"""Planos privados e criação atômica das sessões da galera."""

import random
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import delete, insert, select, update
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine

from aplicacao.bancos.acoes import exposicoes_conteudo
from aplicacao.bancos.identidade import avatares, jogadores
from aplicacao.bancos.partidas import (
    ordens_participantes,
    participantes,
    partidas,
    planos_galera,
    rodadas,
    sessoes_galera,
)
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.galera.contratos import CatalogoGalera
from aplicacao.modulos.galera.esquemas import (
    AcaoGalera,
    ConexaoGalera,
    ConfiguracaoGalera,
    TempoGalera,
)
from aplicacao.modulos.galera.selecao import selecionar
from aplicacao.nucleo.nomes import chave_do_nome


class GaleraPostgresql:
    def __init__(self, motor: AsyncEngine):
        self.motor = motor

    async def titular(self, c: AsyncConnection, jogador_id: UUID):
        jogador = (
            (
                await c.execute(
                    select(jogadores).where(jogadores.c.id == jogador_id).with_for_update()
                )
            )
            .mappings()
            .one_or_none()
        )
        if jogador is None or jogador["estado"] != "ativo":
            raise FalhaAutenticacao(
                "SESSAO_NECESSARIA", "Entre novamente para reunir a galera.", 401
            )
        return jogador

    async def grupo(self, c, jogador, dados):
        grupo = [
            {"nome": jogador["nome_usuario"], "avatar_id": jogador["avatar_id"], "anfitriao": True},
            *[{**p.model_dump(), "anfitriao": False} for p in dados.convidados],
        ]
        chaves = [chave_do_nome(p["nome"]) for p in grupo]
        if len(set(chaves)) != len(chaves):
            raise FalhaAutenticacao(
                "NOMES_REPETIDOS",
                "Cada participante precisa de um nome diferente, inclusive sem distinguir acentos.",
                422,
            )
        permitidos = set((await c.execute(select(avatares.c.id))).scalars())
        if any(p["avatar_id"] not in permitidos for p in grupo):
            raise FalhaAutenticacao(
                "AVATAR_INVALIDO", "Escolha um avatar disponível para cada participante.", 422
            )
        return grupo

    async def preparar(
        self, jogador_id: UUID, dados: ConfiguracaoGalera, catalogo: CatalogoGalera
    ) -> dict:
        async with self.motor.begin() as c:
            jogador = await self.titular(c, jogador_id)
            grupo = await self.grupo(c, jogador, dados)
            vistas = set(
                (
                    await c.execute(
                        select(rodadas.c.palavra_id)
                        .join(partidas, rodadas.c.partida_id == partidas.c.id)
                        .join(exposicoes_conteudo, exposicoes_conteudo.c.rodada_id == rodadas.c.id)
                        .where(partidas.c.jogador_id == jogador_id)
                    )
                ).scalars()
            )
            palavras = await catalogo.listar()
            selecionadas = selecionar(dados, palavras, vistas, random.SystemRandom())
            retorno = {
                "pode_criar": selecionadas is not None,
                "plano_id": None,
                "quantidade_participantes": len(grupo),
                "quantidade_sessoes": dados.quantidade_sessoes,
                "quantidade_palavras": len(grupo) * dados.quantidade_sessoes,
                "participantes": grupo,
                "configuracao": dados.model_dump(exclude={"convidados"}),
            }
            if selecionadas is None:
                retorno["mensagem"] = (
                    "Não há palavras suficientes sem repetição para essa combinação. "
                    "Ajuste as sessões, as temáticas ou a dificuldade."
                )
                if dados.tematicas:
                    retorno["disponibilidade"] = [
                        {
                            "sessao": i + 1,
                            "tematica": t,
                            "disponiveis": sum(
                                t in p.tematicas and p.dificuldade == dados.dificuldade
                                for p in palavras
                            ),
                            "necessarias": len(grupo),
                        }
                        for i, t in enumerate(dados.tematicas)
                    ]
                return retorno
            temas, escolhidas = selecionadas
            for palavra in escolhidas:
                await catalogo.buscar(palavra.id, palavra.revisao)
            agora = datetime.now(UTC)
            await c.execute(
                delete(planos_galera).where(
                    planos_galera.c.jogador_id == jogador_id,
                    planos_galera.c.partida_id.is_(None),
                    planos_galera.c.expira_em < agora,
                )
            )
            id = await c.scalar(
                insert(planos_galera)
                .values(
                    jogador_id=jogador_id,
                    configuracao={"entrada": dados.model_dump(), "grupo": grupo},
                    reservas=[
                        {
                            "palavra_id": p.id,
                            "revisao": p.revisao,
                            "tematica": temas[i // len(grupo)],
                        }
                        for i, p in enumerate(escolhidas)
                    ],
                    expira_em=agora + timedelta(minutes=10),
                )
                .returning(planos_galera.c.id)
            )
            return {**retorno, "plano_id": str(id)}

    async def criar(self, jogador_id: UUID, plano_id: UUID) -> dict:
        async with self.motor.begin() as c:
            jogador = await self.titular(c, jogador_id)
            plano = (
                (
                    await c.execute(
                        select(planos_galera)
                        .where(
                            planos_galera.c.id == plano_id, planos_galera.c.jogador_id == jogador_id
                        )
                        .with_for_update()
                    )
                )
                .mappings()
                .one_or_none()
            )
            if plano is None:
                raise FalhaAutenticacao(
                    "PLANO_NAO_ENCONTRADO", "Confira novamente a configuração.", 404
                )
            if plano["partida_id"]:
                return await self.estado(c, jogador_id, plano["partida_id"])
            if plano["expira_em"] <= datetime.now(UTC):
                raise FalhaAutenticacao(
                    "PLANO_EXPIRADO", "Confira novamente: essa configuração expirou.", 409
                )
            dados = ConfiguracaoGalera.model_validate(plano["configuracao"]["entrada"])
            grupo = await self.grupo(c, jogador, dados)
            if grupo != plano["configuracao"]["grupo"]:
                raise FalhaAutenticacao(
                    "CONFIGURACAO_DESATUALIZADA",
                    "Seu perfil mudou. Confira a configuração de novo.",
                    409,
                )
            partida_id = await c.scalar(
                insert(partidas)
                .values(
                    jogador_id=jogador_id,
                    modo="galera",
                    estado="preparada",
                    versao=1,
                    configuracao=dados.model_dump(exclude={"convidados"}),
                )
                .returning(partidas.c.id)
            )
            ids = []
            for indice, p in enumerate(grupo, 1):
                ids.append(
                    await c.scalar(
                        insert(participantes)
                        .values(
                            partida_id=partida_id,
                            nome=p["nome"],
                            nome_chave=chave_do_nome(p["nome"]),
                            avatar_id=p["avatar_id"],
                            anfitriao=p["anfitriao"],
                            inscricao=indice,
                        )
                        .returning(participantes.c.id)
                    )
                )
            for numero in range(1, dados.quantidade_sessoes + 1):
                reservas = plano["reservas"][(numero - 1) * len(grupo) : numero * len(grupo)]
                sessao_id = await c.scalar(
                    insert(sessoes_galera)
                    .values(
                        partida_id=partida_id, numero=numero, tematica_id=reservas[0]["tematica"]
                    )
                    .returning(sessoes_galera.c.id)
                )
                for ordem, p in enumerate(reservas, 1):
                    await c.execute(
                        insert(rodadas).values(
                            partida_id=partida_id,
                            sessao_id=sessao_id,
                            ordem=ordem,
                            palavra_id=p["palavra_id"],
                            revisao=p["revisao"],
                            dificuldade=dados.dificuldade,
                        )
                    )
                if numero == 1:
                    ordem = list(ids)
                    random.SystemRandom().shuffle(ordem)
                    for posicao, pessoa in enumerate(ordem, 1):
                        await c.execute(
                            insert(ordens_participantes).values(
                                partida_id=partida_id,
                                sessao_id=sessao_id,
                                participante_id=pessoa,
                                posicao=posicao,
                            )
                        )
            await c.execute(
                update(planos_galera)
                .where(planos_galera.c.id == plano_id)
                .values(partida_id=partida_id)
            )
            return await self.estado(c, jogador_id, partida_id)

    async def estado(self, c, jogador_id: UUID, partida_id: UUID) -> dict:
        p = (
            (
                await c.execute(
                    select(partidas).where(
                        partidas.c.id == partida_id,
                        partidas.c.jogador_id == jogador_id,
                        partidas.c.modo == "galera",
                    )
                )
            )
            .mappings()
            .one_or_none()
        )
        if p is None:
            raise FalhaAutenticacao(
                "PARTIDA_NAO_ENCONTRADA", "Essa partida não foi encontrada.", 404
            )
        grupo = (
            (
                await c.execute(
                    select(participantes)
                    .where(participantes.c.partida_id == partida_id)
                    .order_by(participantes.c.inscricao)
                )
            )
            .mappings()
            .all()
        )
        ordem = (
            (
                await c.execute(
                    select(ordens_participantes.c.participante_id)
                    .join(sessoes_galera, sessoes_galera.c.id == ordens_participantes.c.sessao_id)
                    .where(
                        ordens_participantes.c.partida_id == partida_id,
                        sessoes_galera.c.numero == 1,
                    )
                    .order_by(ordens_participantes.c.posicao)
                )
            )
            .scalars()
            .all()
        )
        return {
            "partida_id": str(partida_id),
            "estado": p["estado"],
            "versao": p["versao"],
            "configuracao": p["configuracao"],
            "participantes": [
                {
                    "participante_id": str(a["id"]),
                    "nome": a["nome"],
                    "avatar_id": a["avatar_id"],
                    "anfitriao": a["anfitriao"],
                    "pontuacao": a["pontuacao"],
                }
                for a in grupo
            ],
            "ordem_primeira_sessao": [str(i) for i in ordem],
        }

    async def consultar(self, jogador_id: UUID, partida_id: UUID) -> dict:
        async with self.motor.begin() as c:
            await self.titular(c, jogador_id)
            return await self.estado(c, jogador_id, partida_id)

    def painel_jogo(self):
        from aplicacao.modulos.galera.painel import PainelPostgresql

        return PainelPostgresql(self.motor, self.titular, self.estado)

    async def consultar_painel(
        self, jogador_id: UUID, partida_id: UUID, catalogo: CatalogoGalera
    ) -> dict:
        return await self.painel_jogo().consultar(jogador_id, partida_id, catalogo)

    async def agir(
        self, jogador_id: UUID, partida_id: UUID, dados: AcaoGalera, catalogo: CatalogoGalera
    ) -> dict:
        return await self.painel_jogo().agir(jogador_id, partida_id, dados, catalogo)

    async def tempo(
        self,
        jogador_id: UUID,
        partida_id: UUID,
        dados: TempoGalera | None,
        catalogo: CatalogoGalera,
    ) -> dict:
        return await self.painel_jogo().tempo(jogador_id, partida_id, dados, catalogo)

    async def conexao(
        self, jogador_id: UUID, partida_id: UUID, dados: ConexaoGalera, catalogo: CatalogoGalera
    ) -> dict:
        return await self.painel_jogo().conexao(jogador_id, partida_id, dados, catalogo)
