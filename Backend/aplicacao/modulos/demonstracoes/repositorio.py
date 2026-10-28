"""Reserva única e vínculo atômico, sem copiar partidas ou publicar pontos."""

from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import insert, select, update
from sqlalchemy.dialects.postgresql import insert as inserir_postgresql
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine

from aplicacao.bancos.identidade import jogadores, visitantes
from aplicacao.bancos.partidas import partidas, rodadas
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.demonstracoes.contratos import Sorteio

ABERTAS = ("preparada", "em_andamento", "pausada")


def resumo_partida(dados) -> dict:
    return {
        "partida_id": dados["id"],
        "estado": dados["estado"],
        "pontuacao": dados["pontuacao"],
        "versao": dados["versao"],
        "quantidade_palavras": 3,
        "dificuldade": "facil",
        "vinculo_expira_em": dados["criado_em"] + timedelta(days=7),
    }


class DemonstracoesPostgresql:
    def __init__(self, motor: AsyncEngine):
        self.motor = motor

    async def visitante(self, conexao: AsyncConnection, resumo: str, bloquear=False):
        consulta = select(visitantes).where(visitantes.c.segredo_resumo == resumo)
        if bloquear:
            consulta = consulta.with_for_update()
        dados = (await conexao.execute(consulta)).mappings().one_or_none()
        if dados is None:
            raise FalhaAutenticacao(
                "VISITANTE_NECESSARIO", "Atualize a página para continuar.", 401
            )
        return dados

    async def estado(self, conexao: AsyncConnection, visitante) -> dict:
        demonstracao = None
        if visitante["demonstracao_id"] and visitante["vinculado_em"] is None:
            dados = (
                (
                    await conexao.execute(
                        select(partidas).where(partidas.c.id == visitante["demonstracao_id"])
                    )
                )
                .mappings()
                .one()
            )
            demonstracao = resumo_partida(dados)
        return {
            "demonstracao_utilizada": visitante["demonstracao_utilizada"],
            "pode_iniciar": not visitante["demonstracao_utilizada"],
            "vinculada": visitante["vinculado_em"] is not None,
            "demonstracao": demonstracao,
        }

    async def identificar(self, resumo: str) -> dict:
        async with self.motor.begin() as conexao:
            await conexao.execute(
                inserir_postgresql(visitantes)
                .values(segredo_resumo=resumo)
                .on_conflict_do_nothing(index_elements=[visitantes.c.segredo_resumo])
            )
            return await self.estado(conexao, await self.visitante(conexao, resumo))

    async def consultar_visitante(self, resumo: str) -> dict:
        async with self.motor.connect() as conexao:
            return await self.estado(conexao, await self.visitante(conexao, resumo))

    async def consultar_demonstracao(self, resumo: str) -> dict:
        async with self.motor.connect() as conexao:
            visitante = await self.visitante(conexao, resumo)
            if visitante["vinculado_em"] is not None:
                raise FalhaAutenticacao(
                    "DEMONSTRACAO_VINCULADA", "Esta demonstração já pertence a uma conta.", 403
                )
            if visitante["demonstracao_id"] is None:
                raise FalhaAutenticacao(
                    "DEMONSTRACAO_AUSENTE", "Você ainda não iniciou o teste.", 404
                )
            return (await self.estado(conexao, visitante))["demonstracao"]

    async def iniciar(self, resumo: str, sortear: Sorteio) -> dict:
        async with self.motor.begin() as conexao:
            visitante = await self.visitante(conexao, resumo, bloquear=True)
            if visitante["vinculado_em"] is not None:
                raise FalhaAutenticacao(
                    "DEMONSTRACAO_UTILIZADA", "Entre com Google para jogar novas partidas.", 409
                )
            if visitante["demonstracao_id"]:
                return (await self.estado(conexao, visitante))["demonstracao"]
            if visitante["demonstracao_utilizada"]:
                raise FalhaAutenticacao(
                    "DEMONSTRACAO_UTILIZADA", "Entre com Google para jogar novas partidas.", 409
                )
            palavras = await sortear()
            registro = (
                (
                    await conexao.execute(
                        insert(partidas)
                        .values(
                            visitante_id=visitante["id"],
                            modo="individual",
                            origem="demonstracao",
                            configuracao={
                                "quantidade_palavras": 3,
                                "dificuldade": "facil",
                                "tematica": "aleatoria",
                            },
                        )
                        .returning(partidas)
                    )
                )
                .mappings()
                .one()
            )
            await conexao.execute(
                insert(rodadas),
                [
                    {
                        "partida_id": registro["id"],
                        "ordem": indice,
                        "palavra_id": item["id"],
                        "revisao": item["revisao"],
                        "dificuldade": "facil",
                        "dica_atual": 1,
                    }
                    for indice, item in enumerate(palavras, start=1)
                ],
            )
            await conexao.execute(
                update(visitantes)
                .where(visitantes.c.id == visitante["id"])
                .values(demonstracao_utilizada=True, demonstracao_id=registro["id"])
            )
            return resumo_partida(registro)

    async def vincular(self, resumo: str, jogador_id: UUID) -> dict:
        async with self.motor.begin() as conexao:
            # Mesma ordem da exclusão: titular antes das partidas e de seus vínculos.
            titular = (
                await conexao.execute(
                    select(jogadores.c.id)
                    .where(jogadores.c.id == jogador_id, jogadores.c.estado != "anonimizado")
                    .with_for_update()
                )
            ).scalar_one_or_none()
            if titular is None:
                raise FalhaAutenticacao("SESSAO_EXPIRADA", "Entre novamente com Google.", 401)
            visitante = await self.visitante(conexao, resumo, bloquear=True)
            if visitante["demonstracao_id"] is None:
                raise FalhaAutenticacao(
                    "DEMONSTRACAO_AUSENTE", "Não há demonstração para vincular.", 404
                )
            if visitante["vinculado_em"] is not None:
                if visitante["jogador_vinculado_id"] == jogador_id:
                    return {"partida_id": visitante["demonstracao_id"], "vinculada": True}
                raise FalhaAutenticacao(
                    "DEMONSTRACAO_JA_VINCULADA", "Esta demonstração já foi vinculada.", 409
                )
            demonstracao = (
                (
                    await conexao.execute(
                        select(partidas)
                        .where(partidas.c.id == visitante["demonstracao_id"])
                        .with_for_update()
                    )
                )
                .mappings()
                .one()
            )
            agora = datetime.now(UTC)
            if agora >= demonstracao["criado_em"] + timedelta(days=7):
                raise FalhaAutenticacao(
                    "PRAZO_VINCULO_ENCERRADO",
                    "O prazo de sete dias para vincular o teste terminou.",
                    409,
                )
            if demonstracao["estado"] in ABERTAS:
                existente = await conexao.scalar(
                    select(partidas.c.id).where(
                        partidas.c.jogador_id == jogador_id,
                        partidas.c.modo == "individual",
                        partidas.c.estado.in_(ABERTAS),
                    )
                )
                if existente:
                    raise FalhaAutenticacao(
                        "INDIVIDUAL_EM_ABERTO",
                        "Sua conta já tem uma partida em aberto. "
                        "Conclua ou abandone a demonstração antes de vinculá-la.",
                        409,
                    )
            await conexao.execute(
                update(partidas)
                .where(partidas.c.id == demonstracao["id"])
                .values(jogador_id=jogador_id, visitante_id=None)
            )
            await conexao.execute(
                update(visitantes)
                .where(visitantes.c.id == visitante["id"])
                .values(jogador_vinculado_id=jogador_id, vinculado_em=agora)
            )
            return {"partida_id": demonstracao["id"], "vinculada": True}
