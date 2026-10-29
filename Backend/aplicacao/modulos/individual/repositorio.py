"""Transações do agregado individual; regras puras e catálogo são dependências."""

import hashlib
import json
import random
from collections import Counter
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine

from aplicacao.bancos.acoes import (
    acoes_processadas,
    exposicoes_conteudo,
    interrupcoes,
    palpites,
    penalidades,
    resultados_individuais,
)
from aplicacao.bancos.identidade import jogadores, visitantes
from aplicacao.bancos.partidas import conexoes_individuais, partidas, planos_individuais, rodadas
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.individual.configuracao import selecionar_palavras, sequencia_dificuldades
from aplicacao.modulos.individual.continuidade import ContinuidadeIndividual
from aplicacao.modulos.individual.contratos import CatalogoIndividual
from aplicacao.modulos.individual.esquemas import (
    AcaoIndividual,
    AcaoRodada,
    ConectarIndividual,
    ConfiguracaoIndividual,
    EnviarPalpite,
    SalvarRascunho,
    SinalIndividual,
)
from aplicacao.modulos.individual.regras import avaliar_jogada, limites_do_teclado, pontos_da_dica

ABERTAS = ("preparada", "em_andamento", "pausada")


class IndividualPostgresql:
    def __init__(self, motor: AsyncEngine):
        self.motor = motor

    async def titular(self, conexao: AsyncConnection, jogador_id: UUID) -> None:
        estado = await conexao.scalar(
            select(jogadores.c.estado).where(jogadores.c.id == jogador_id).with_for_update()
        )
        if estado is None or estado == "anonimizado":
            raise FalhaAutenticacao("SESSAO_EXPIRADA", "Entre novamente com Google.", 401)
        if estado != "ativo":
            raise FalhaAutenticacao("PERFIL_INCOMPLETO", "Conclua seu perfil para jogar.", 403)

    async def partida(self, conexao: AsyncConnection, jogador_id: UUID, partida_id: UUID):
        registro = (
            (
                await conexao.execute(
                    select(partidas)
                    .where(
                        partidas.c.id == partida_id,
                        partidas.c.jogador_id == jogador_id,
                        partidas.c.modo == "individual",
                    )
                    .with_for_update()
                )
            )
            .mappings()
            .one_or_none()
        )
        if registro is None:
            raise FalhaAutenticacao("PARTIDA_NAO_ENCONTRADA", "Partida não encontrada.", 404)
        return registro

    async def preparar(
        self, jogador_id: UUID, dados: ConfiguracaoIndividual, catalogo: CatalogoIndividual
    ) -> dict:
        async with self.motor.begin() as conexao:
            await self.titular(conexao, jogador_id)
            vistas = set(
                (
                    await conexao.execute(
                        select(rodadas.c.palavra_id)
                        .join(partidas, rodadas.c.partida_id == partidas.c.id)
                        .join(exposicoes_conteudo, exposicoes_conteudo.c.rodada_id == rodadas.c.id)
                        .where(partidas.c.jogador_id == jogador_id)
                    )
                ).scalars()
            )
            sorteio = random.SystemRandom()
            sequencia = sequencia_dificuldades(dados, sorteio)
            conteudo = await catalogo.listar()
            escolhidas = selecionar_palavras(dados, sequencia, conteudo, vistas, sorteio)
            disponiveis = len(escolhidas)
            pode_iniciar = disponiveis == dados.quantidade_palavras or (
                dados.aceitar_reducao and disponiveis > 0
            )
            retorno = {
                "pode_iniciar": pode_iniciar,
                "plano_id": None,
                "quantidade_solicitada": dados.quantidade_palavras,
                "disponiveis": disponiveis,
                "sequencia_solicitada": sequencia,
                "distribuicao_disponivel": dict(Counter(p.dificuldade for p in escolhidas)),
                "alternativas": []
                if pode_iniciar
                else (
                    (
                        ["outras_tematicas"]
                        if dados.tematica is not None and not dados.permitir_outras_tematicas
                        else []
                    )
                    + (["reduzir"] if disponiveis > 0 else [])
                    + ["cancelar"]
                ),
            }
            if not pode_iniciar:
                return retorno
            for palavra in escolhidas:
                await catalogo.buscar(palavra.id, palavra.revisao)
            configuracao = {
                **dados.model_dump(),
                "quantidade_solicitada": dados.quantidade_palavras,
                "quantidade_palavras": disponiveis,
                "sequencia_efetiva": [p.dificuldade for p in escolhidas],
            }
            expira = datetime.now(UTC) + timedelta(minutes=10)
            plano_id = await conexao.scalar(
                insert(planos_individuais)
                .values(
                    jogador_id=jogador_id,
                    configuracao=configuracao,
                    reservas=[
                        {
                            "id": p.id,
                            "revisao": p.revisao,
                            "dificuldade": p.dificuldade,
                            "inedita": p.id not in vistas,
                        }
                        for p in escolhidas
                    ],
                    expira_em=expira,
                )
                .returning(planos_individuais.c.id)
            )
            return {
                **retorno,
                "plano_id": str(plano_id),
                "expira_em": expira.isoformat(),
                "configuracao": configuracao,
            }

    async def iniciar(self, jogador_id: UUID, plano_id: UUID, catalogo: CatalogoIndividual) -> dict:
        async with self.motor.begin() as conexao:
            await self.titular(conexao, jogador_id)
            plano = (
                (
                    await conexao.execute(
                        select(planos_individuais)
                        .where(
                            planos_individuais.c.id == plano_id,
                            planos_individuais.c.jogador_id == jogador_id,
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
                return await self.estado(
                    conexao, await self.partida(conexao, jogador_id, plano["partida_id"]), catalogo
                )
            if plano["expira_em"] <= datetime.now(UTC):
                raise FalhaAutenticacao(
                    "PLANO_EXPIRADO",
                    "A configuração expirou. Confira novamente antes de iniciar.",
                    409,
                )
            existente = await conexao.scalar(
                select(partidas.c.id).where(
                    partidas.c.jogador_id == jogador_id,
                    partidas.c.modo == "individual",
                    partidas.c.estado.in_(ABERTAS),
                )
            )
            if existente:
                raise FalhaAutenticacao(
                    "INDIVIDUAL_EM_ABERTO", "Você já tem uma partida individual em aberto.", 409
                )
            vistas_agora = set(
                (
                    await conexao.execute(
                        select(rodadas.c.palavra_id)
                        .join(partidas, rodadas.c.partida_id == partidas.c.id)
                        .join(exposicoes_conteudo, exposicoes_conteudo.c.rodada_id == rodadas.c.id)
                        .where(partidas.c.jogador_id == jogador_id)
                    )
                ).scalars()
            )
            if any(r["inedita"] and r["id"] in vistas_agora for r in plano["reservas"]):
                raise FalhaAutenticacao(
                    "PLANO_DESATUALIZADO",
                    "Seu histórico mudou. Confira a configuração novamente.",
                    409,
                )
            registro = (
                (
                    await conexao.execute(
                        insert(partidas)
                        .values(
                            jogador_id=jogador_id,
                            modo="individual",
                            estado="em_andamento",
                            versao=1,
                            configuracao=plano["configuracao"],
                        )
                        .returning(partidas)
                    )
                )
                .mappings()
                .one()
            )
            agora = datetime.now(UTC)
            for indice, reserva in enumerate(plano["reservas"], start=1):
                rodada_id = await conexao.scalar(
                    insert(rodadas)
                    .values(
                        partida_id=registro["id"],
                        ordem=indice,
                        palavra_id=reserva["id"],
                        revisao=reserva["revisao"],
                        dificuldade=reserva["dificuldade"],
                        dica_atual=1,
                        estado="apresentada" if indice == 1 else "reservada",
                        apresentada_em=agora if indice == 1 else None,
                    )
                    .returning(rodadas.c.id)
                )
                if indice == 1:
                    await conexao.execute(insert(exposicoes_conteudo).values(rodada_id=rodada_id))
            await conexao.execute(
                update(planos_individuais)
                .where(planos_individuais.c.id == plano_id)
                .values(partida_id=registro["id"])
            )
            return await self.estado(conexao, registro, catalogo)

    async def estado(
        self, conexao: AsyncConnection, registro, catalogo: CatalogoIndividual
    ) -> dict:
        etapas = (
            (
                await conexao.execute(
                    select(rodadas)
                    .where(rodadas.c.partida_id == registro["id"])
                    .order_by(rodadas.c.ordem)
                )
            )
            .mappings()
            .all()
        )
        atual = (
            next((r for r in etapas if r["estado"] == "apresentada"), None)
            if registro["estado"] in ABERTAS
            else None
        )
        publica = None
        if atual:
            palavra = await catalogo.buscar(atual["palavra_id"], atual["revisao"])
            publica = {
                "rodada_id": str(atual["id"]),
                "ordem": atual["ordem"],
                "dificuldade": atual["dificuldade"],
                "tematicas": palavra.tematicas,
                "posicoes": [None if c.isalnum() else c for c in palavra.resposta],
                "limites": limites_do_teclado(palavra.resposta),
                "rascunho": atual["rascunho"],
                "dica_atual": atual["dica_atual"],
                "dicas_reveladas": palavra.dicas[: atual["dica_atual"]],
                "pontos_disponiveis": pontos_da_dica(atual["dica_atual"]),
            }
        resumo = []
        for etapa in etapas:
            if etapa["estado"] not in {"acertada", "desistida"}:
                continue
            conteudo = await catalogo.buscar(etapa["palavra_id"], etapa["revisao"])
            resumo.append(
                {
                    "ordem": etapa["ordem"],
                    "estado": etapa["estado"],
                    "resposta": conteudo.resposta,
                    "pontos": etapa["pontuacao"],
                    "dicas_utilizadas": etapa["dica_atual"],
                }
            )
        return {
            "partida_id": str(registro["id"]),
            "estado": registro["estado"],
            "origem": registro["origem"],
            "versao": registro["versao"],
            "pontuacao": registro["pontuacao"],
            "quantidade_palavras": len(etapas),
            "rodadas_concluidas": sum(r["estado"] in {"acertada", "desistida"} for r in etapas),
            "rodada_atual": publica,
            "resumo_rodadas": resumo,
            "acertos": sum(r["estado"] == "acertada" for r in etapas),
            "quantidade_pausas": await conexao.scalar(
                select(func.count())
                .select_from(penalidades)
                .where(penalidades.c.partida_id == registro["id"])
            ),
        }

    async def consultar(
        self, jogador_id: UUID, partida_id: UUID, catalogo: CatalogoIndividual
    ) -> dict:
        async with self.motor.begin() as conexao:
            await self.titular(conexao, jogador_id)
            return await self.estado(
                conexao, await self.partida(conexao, jogador_id, partida_id), catalogo
            )

    async def em_aberto(self, jogador_id: UUID, catalogo: CatalogoIndividual) -> dict:
        async with self.motor.begin() as conexao:
            await self.titular(conexao, jogador_id)
            registro = (
                (
                    await conexao.execute(
                        select(partidas).where(
                            partidas.c.jogador_id == jogador_id,
                            partidas.c.modo == "individual",
                            partidas.c.estado.in_(ABERTAS),
                        )
                    )
                )
                .mappings()
                .one_or_none()
            )
            return {
                "individual": await self.estado(conexao, registro, catalogo) if registro else None
            }

    async def finalizar_rodada(
        self, conexao: AsyncConnection, registro, rodada, pontos: int, acerto: bool
    ) -> bool:
        await conexao.execute(
            update(rodadas)
            .where(rodadas.c.id == rodada["id"])
            .values(estado="acertada" if acerto else "desistida", pontuacao=pontos, rascunho=None)
        )
        proxima = await conexao.scalar(
            select(rodadas.c.id)
            .where(rodadas.c.partida_id == registro["id"], rodadas.c.estado == "reservada")
            .order_by(rodadas.c.ordem)
            .limit(1)
        )
        if proxima:
            await conexao.execute(
                update(rodadas)
                .where(rodadas.c.id == proxima)
                .values(estado="apresentada", apresentada_em=datetime.now(UTC))
            )
            await conexao.execute(insert(exposicoes_conteudo).values(rodada_id=proxima))
        return proxima is None

    async def publicar(
        self, conexao: AsyncConnection, partida_id: UUID, pontos: int, concluida: bool
    ) -> None:
        acertos = await conexao.scalar(
            select(func.count())
            .select_from(rodadas)
            .where(rodadas.c.partida_id == partida_id, rodadas.c.estado == "acertada")
        )
        await conexao.execute(
            insert(resultados_individuais).values(
                partida_id=partida_id, pontos=pontos, acertos=acertos, concluida=concluida
            )
        )

    async def agir(
        self,
        jogador_id: UUID,
        partida_id: UUID,
        tipo: str,
        dados: AcaoIndividual,
        catalogo: CatalogoIndividual,
    ) -> dict:
        async with self.motor.begin() as conexao:
            await self.titular(conexao, jogador_id)
            registro = await self.partida(conexao, jogador_id, partida_id)
            return await self.agir_na_transacao(conexao, registro, tipo, dados, catalogo)

    async def agir_na_transacao(
        self,
        conexao: AsyncConnection,
        registro,
        tipo: str,
        dados: AcaoIndividual,
        catalogo: CatalogoIndividual,
    ) -> dict:
        partida_id = registro["id"]
        entrada = hashlib.sha256(
            json.dumps(
                {"tipo": tipo, "dados": dados.model_dump(mode="json")},
                sort_keys=True,
                ensure_ascii=False,
            ).encode()
        ).hexdigest()
        anterior = (
            (
                await conexao.execute(
                    select(acoes_processadas).where(
                        acoes_processadas.c.partida_id == partida_id,
                        acoes_processadas.c.id_acao == dados.id_acao,
                    )
                )
            )
            .mappings()
            .one_or_none()
        )
        if anterior:
            if anterior["entrada_resumo"] != entrada:
                raise FalhaAutenticacao(
                    "ACAO_CONFLITANTE", "Este identificador já foi usado para outra ação.", 409
                )
            return anterior["resultado"]
        if registro["versao"] != dados.versao_esperada:
            raise FalhaAutenticacao(
                "VERSAO_DESATUALIZADA", "Atualize a partida antes de tentar novamente.", 409
            )
        if tipo in {"pausa", "saida", "retomada"}:
            return await self.transicao_pausa(conexao, registro, tipo, dados, catalogo, entrada)
        if registro["estado"] != "em_andamento" and not (
            tipo == "encerramento" and registro["estado"] == "pausada"
        ):
            raise FalhaAutenticacao("PARTIDA_INATIVA", "Esta partida não está em andamento.", 409)
        pontos = 0
        terminou = tipo == "encerramento"
        acao = {
            "tipo": tipo,
            "resultado": "abandonada" if terminou else None,
            "pontos": 0,
            "limpar_montagem": False,
        }
        palpite = None
        rodada = None
        if not terminou:
            rodada = (
                (
                    await conexao.execute(
                        select(rodadas).where(
                            rodadas.c.partida_id == partida_id,
                            rodadas.c.estado == "apresentada",
                        )
                    )
                )
                .mappings()
                .one_or_none()
            )
            if (
                not isinstance(dados, AcaoRodada)
                or rodada is None
                or dados.rodada_id != rodada["id"]
            ):
                raise FalhaAutenticacao("RODADA_INVALIDA", "A rodada informada não é a atual.", 409)
            palavra = await catalogo.buscar(rodada["palavra_id"], rodada["revisao"])
            decisao = avaliar_jogada(
                tipo,
                rodada["dica_atual"],
                palavra.resposta,
                dados.palpite if isinstance(dados, EnviarPalpite) else None,
            )
            pontos, palpite = decisao.pontos, decisao.palpite
            acao.update(resultado=decisao.resultado, limpar_montagem=decisao.limpar_montagem)
            if decisao.resposta_revelada is not None:
                acao["resposta_revelada"] = decisao.resposta_revelada
            if decisao.encerra_rodada:
                terminou = await self.finalizar_rodada(
                    conexao, registro, rodada, pontos, decisao.resultado == "acerto"
                )
            elif decisao.dica_destino is not None:
                await conexao.execute(
                    update(rodadas)
                    .where(rodadas.c.id == rodada["id"])
                    .values(
                        **{
                            "dica_atual": decisao.dica_destino,
                            **({"rascunho": None} if decisao.limpar_montagem else {}),
                        }
                    )
                )
        total = registro["pontuacao"] + pontos
        acao["pontos"] = pontos
        campos = {"pontuacao": total, "versao": registro["versao"] + 1}
        if terminou:
            await conexao.execute(
                delete(conexoes_individuais).where(conexoes_individuais.c.partida_id == partida_id)
            )
            await conexao.execute(
                update(rodadas).where(rodadas.c.partida_id == partida_id).values(rascunho=None)
            )
            campos.update(
                estado="abandonada" if tipo == "encerramento" else "concluida",
                encerrada_em=datetime.now(UTC),
                motivo_encerramento="abandono_voluntario"
                if tipo == "encerramento"
                else "rodadas_finalizadas",
            )
            await self.publicar(conexao, partida_id, total, tipo != "encerramento")
        atualizado = (
            (
                await conexao.execute(
                    update(partidas)
                    .where(partidas.c.id == partida_id)
                    .values(**campos)
                    .returning(partidas)
                )
            )
            .mappings()
            .one()
        )
        resultado = {**await self.estado(conexao, atualizado, catalogo), "acao": acao}
        acao_id = await conexao.scalar(
            insert(acoes_processadas)
            .values(
                partida_id=partida_id,
                id_acao=dados.id_acao,
                tipo=tipo,
                entrada_resumo=entrada,
                resultado=resultado,
                versao_aplicada=atualizado["versao"],
            )
            .returning(acoes_processadas.c.id)
        )
        if palpite is not None:
            await conexao.execute(
                insert(palpites).values(
                    partida_id=partida_id,
                    acao_id=acao_id,
                    rodada_id=rodada["id"],
                    tipo="palavra",
                    texto=palpite,
                    dica_utilizada=rodada["dica_atual"],
                    resultado=acao["resultado"],
                    pontos=pontos,
                )
            )
        return resultado

    async def demonstracao(self, conexao: AsyncConnection, resumo: str):
        visitante = (
            (
                await conexao.execute(
                    select(visitantes)
                    .where(visitantes.c.segredo_resumo == resumo)
                    .with_for_update()
                )
            )
            .mappings()
            .one_or_none()
        )
        if visitante is None:
            raise FalhaAutenticacao(
                "VISITANTE_NECESSARIO", "Atualize a página para continuar.", 401
            )
        if visitante["vinculado_em"] is not None:
            raise FalhaAutenticacao(
                "DEMONSTRACAO_VINCULADA", "Esta demonstração já pertence a uma conta.", 403
            )
        registro = (
            (
                await conexao.execute(
                    select(partidas)
                    .where(
                        partidas.c.id == visitante["demonstracao_id"],
                        partidas.c.visitante_id == visitante["id"],
                        partidas.c.jogador_id.is_(None),
                        partidas.c.origem == "demonstracao",
                    )
                    .with_for_update()
                )
            )
            .mappings()
            .one_or_none()
        )
        if registro is None:
            raise FalhaAutenticacao("DEMONSTRACAO_AUSENTE", "Você ainda não iniciou o teste.", 404)
        return registro

    async def jogo_demonstracao(
        self, resumo: str, catalogo: CatalogoIndividual, ativar=False
    ) -> dict:
        async with self.motor.begin() as conexao:
            registro = await self.demonstracao(conexao, resumo)
            if ativar and registro["estado"] == "preparada":
                primeira = await conexao.scalar(
                    select(rodadas.c.id).where(
                        rodadas.c.partida_id == registro["id"], rodadas.c.ordem == 1
                    )
                )
                await conexao.execute(
                    update(rodadas)
                    .where(rodadas.c.id == primeira)
                    .values(estado="apresentada", apresentada_em=datetime.now(UTC))
                )
                await conexao.execute(insert(exposicoes_conteudo).values(rodada_id=primeira))
                registro = (
                    (
                        await conexao.execute(
                            update(partidas)
                            .where(partidas.c.id == registro["id"])
                            .values(estado="em_andamento", versao=1)
                            .returning(partidas)
                        )
                    )
                    .mappings()
                    .one()
                )
            return await self.estado(conexao, registro, catalogo)

    async def agir_demonstracao(
        self, resumo: str, tipo: str, dados: AcaoIndividual, catalogo: CatalogoIndividual
    ) -> dict:
        async with self.motor.begin() as conexao:
            registro = await self.demonstracao(conexao, resumo)
            return await self.agir_na_transacao(conexao, registro, tipo, dados, catalogo)

    async def transicao_pausa(
        self,
        conexao: AsyncConnection,
        registro,
        tipo: str,
        dados: AcaoIndividual,
        catalogo: CatalogoIndividual,
        entrada: str,
    ) -> dict:
        destino = "em_andamento" if tipo == "retomada" else "pausada"
        esperado = "pausada" if tipo == "retomada" else "em_andamento"
        if registro["estado"] != esperado:
            raise FalhaAutenticacao(
                "PARTIDA_INATIVA", "Atualize a partida antes de continuar.", 409
            )
        pontos = 0 if tipo == "retomada" else -100
        if pontos:
            interrupcao_id = await conexao.scalar(
                select(interrupcoes.c.id).where(
                    interrupcoes.c.partida_id == registro["id"],
                    interrupcoes.c.evento_id == dados.id_acao,
                )
            )
            if interrupcao_id:
                await conexao.execute(
                    update(interrupcoes)
                    .where(interrupcoes.c.id == interrupcao_id)
                    .values(classificacao="pausa")
                )
            else:
                interrupcao_id = await conexao.scalar(
                    insert(interrupcoes)
                    .values(
                        partida_id=registro["id"],
                        evento_id=dados.id_acao,
                        origem="botao_pausa" if tipo == "pausa" else "navegacao",
                        classificacao="pausa",
                    )
                    .returning(interrupcoes.c.id)
                )
            await conexao.execute(
                insert(penalidades).values(
                    partida_id=registro["id"], interrupcao_id=interrupcao_id, pontos=-100
                )
            )
        else:
            await conexao.execute(
                update(interrupcoes)
                .where(
                    interrupcoes.c.partida_id == registro["id"],
                    interrupcoes.c.classificacao == "pausa",
                    interrupcoes.c.avisada_em.is_(None),
                )
                .values(avisada_em=datetime.now(UTC))
            )
        # Documentos e avisos do ciclo anterior não podem cobrar outra pausa ao retomar.
        await conexao.execute(
            delete(conexoes_individuais).where(conexoes_individuais.c.partida_id == registro["id"])
        )
        atualizado = (
            (
                await conexao.execute(
                    update(partidas)
                    .where(partidas.c.id == registro["id"])
                    .values(
                        estado=destino,
                        pontuacao=registro["pontuacao"] + pontos,
                        versao=registro["versao"] + 1,
                    )
                    .returning(partidas)
                )
            )
            .mappings()
            .one()
        )
        resultado = {
            **await self.estado(conexao, atualizado, catalogo),
            "acao": {
                "tipo": tipo,
                "resultado": "retomada" if tipo == "retomada" else "pausada",
                "pontos": pontos,
                "limpar_montagem": False,
            },
        }
        await conexao.execute(
            insert(acoes_processadas).values(
                partida_id=registro["id"],
                id_acao=dados.id_acao,
                tipo=tipo,
                entrada_resumo=entrada,
                resultado=resultado,
                versao_aplicada=atualizado["versao"],
            )
        )
        return resultado

    async def continuidade(
        self,
        jogador_id: UUID,
        partida_id: UUID,
        operacao: str,
        dados: SalvarRascunho | ConectarIndividual | SinalIndividual,
        catalogo: CatalogoIndividual,
    ) -> dict:
        async with self.motor.begin() as conexao:
            await self.titular(conexao, jogador_id)
            registro = await self.partida(conexao, jogador_id, partida_id)
            return await ContinuidadeIndividual(self).aplicar(
                conexao, registro, operacao, dados, catalogo
            )

    async def continuidade_demonstracao(
        self,
        resumo: str,
        operacao: str,
        dados: SalvarRascunho | ConectarIndividual | SinalIndividual,
        catalogo: CatalogoIndividual,
    ) -> dict:
        async with self.motor.begin() as conexao:
            registro = await self.demonstracao(conexao, resumo)
            return await ContinuidadeIndividual(self).aplicar(
                conexao, registro, operacao, dados, catalogo
            )
