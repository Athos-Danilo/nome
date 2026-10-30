"""Consultas relacionais consistentes; publicação continua pertencendo ao jogo."""

from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine

from aplicacao.bancos.acoes import palpites, resultados_individuais
from aplicacao.bancos.identidade import jogadores
from aplicacao.bancos.partidas import participantes, partidas, rodadas
from aplicacao.modulos.acompanhamento.contratos import DadosEstatisticas, GrupoRodadas
from aplicacao.modulos.acompanhamento.esquemas import (
    Categoria,
    Classificado,
    Historico,
    ItemHistorico,
    Modo,
    ParticipanteHistorico,
    Ranking,
    Resumo,
    Situacao,
)

ENCERRADAS = ("concluida", "abandonada")


def selecao_historico() -> Select:
    return select(
        partidas.c.id.label("partida_id"),
        partidas.c.modo,
        partidas.c.origem,
        partidas.c.estado,
        partidas.c.criado_em,
        partidas.c.encerrada_em,
        partidas.c.pontuacao,
        partidas.c.resultado_galera,
        partidas.c.motivo_encerramento,
        select(func.count())
        .where(rodadas.c.partida_id == partidas.c.id)
        .correlate(partidas)
        .scalar_subquery()
        .label("palavras"),
        select(func.count())
        .where(rodadas.c.partida_id == partidas.c.id, rodadas.c.estado == "acertada")
        .correlate(partidas)
        .scalar_subquery()
        .label("acertos"),
    )


async def itens_historico(c: AsyncConnection, consulta: Select) -> list[ItemHistorico]:
    itens = [ItemHistorico.model_validate(r) for r in (await c.execute(consulta)).mappings()]
    ids = [i.partida_id for i in itens if i.modo == "galera"]
    if not ids:
        return itens
    grupos = (
        await c.execute(
            select(participantes)
            .where(participantes.c.partida_id.in_(ids))
            .order_by(participantes.c.inscricao)
        )
    ).mappings()
    por_partida = {i: [] for i in ids}
    for p in grupos:
        por_partida[p["partida_id"]].append(
            ParticipanteHistorico(
                nome="Jogador excluído" if p["anonimizado"] else p["nome"], pontos=p["pontuacao"]
            )
        )
    for item in itens:
        if item.modo != "galera":
            continue
        item.participantes = por_partida[item.partida_id]
        if item.estado in ENCERRADAS and item.participantes:
            maior = max(p.pontos for p in item.participantes)
            item.vencedores = [p.nome for p in item.participantes if p.pontos == maior]
    return itens


class AcompanhamentoPostgresql:
    def __init__(self, motor: AsyncEngine):
        self.motor = motor

    async def historico(
        self, jogador_id: UUID, pagina: int, modo: Modo | None, estado: Situacao | None
    ) -> Historico:
        filtros = [partidas.c.jogador_id == jogador_id]
        if modo:
            filtros.append(partidas.c.modo == modo)
        if estado:
            filtros.append(partidas.c.estado == estado)
        async with self.motor.connect() as aberta:
            c = await aberta.execution_options(isolation_level="REPEATABLE READ")
            async with c.begin():
                total = await c.scalar(select(func.count()).select_from(partidas).where(*filtros))
                itens = await itens_historico(
                    c,
                    selecao_historico()
                    .where(*filtros)
                    .order_by(partidas.c.criado_em.desc(), partidas.c.id.desc())
                    .offset((pagina - 1) * 10)
                    .limit(10),
                )
                return Historico(itens=itens, total=total, pagina=pagina)

    async def estatisticas(self, jogador_id: UUID) -> DadosEstatisticas:
        publicadas = partidas.join(
            resultados_individuais, partidas.c.id == resultados_individuais.c.partida_id
        )
        filtros = [
            partidas.c.jogador_id == jogador_id,
            partidas.c.modo == "individual",
            partidas.c.estado.in_(ENCERRADAS),
        ]
        async with self.motor.connect() as aberta:
            c = await aberta.execution_options(isolation_level="REPEATABLE READ")
            async with c.begin():
                r = (
                    (
                        await c.execute(
                            select(
                                func.count().label("partidas_encerradas"),
                                func.count()
                                .filter(resultados_individuais.c.concluida)
                                .label("partidas_concluidas"),
                                func.count()
                                .filter(~resultados_individuais.c.concluida)
                                .label("partidas_abandonadas"),
                                func.coalesce(func.sum(resultados_individuais.c.pontos), 0).label(
                                    "pontos"
                                ),
                                func.max(resultados_individuais.c.pontos).label("melhor_pontuacao"),
                                func.coalesce(func.sum(resultados_individuais.c.acertos), 0).label(
                                    "palavras_acertadas"
                                ),
                            )
                            .select_from(publicadas)
                            .where(*filtros)
                        )
                    )
                    .mappings()
                    .one()
                )
                resumo = Resumo.model_validate(r)
                erros = (
                    select(palpites.c.rodada_id, func.count().label("erros"))
                    .where(palpites.c.resultado == "erro")
                    .group_by(palpites.c.rodada_id)
                    .subquery()
                )
                colunas = [
                    rodadas.c.palavra_id,
                    rodadas.c.revisao,
                    rodadas.c.dificuldade,
                    rodadas.c.estado,
                    rodadas.c.dica_atual,
                ]
                linhas = (
                    await c.execute(
                        select(
                            *colunas,
                            func.count().label("quantidade"),
                            func.sum(rodadas.c.pontuacao).label("pontos"),
                            func.sum(func.coalesce(erros.c.erros, 0)).label("erros"),
                        )
                        .select_from(
                            publicadas.join(
                                rodadas, rodadas.c.partida_id == partidas.c.id
                            ).outerjoin(erros, erros.c.rodada_id == rodadas.c.id)
                        )
                        .where(*filtros, rodadas.c.apresentada_em.is_not(None))
                        .group_by(*colunas)
                    )
                ).mappings()
                grupos = [
                    GrupoRodadas(
                        palavra_id=r["palavra_id"],
                        revisao=r["revisao"],
                        dificuldade=r["dificuldade"],
                        estado=r["estado"],
                        dica=r["dica_atual"],
                        quantidade=r["quantidade"],
                        pontos=r["pontos"],
                        erros=r["erros"],
                    )
                    for r in linhas
                ]
                abertos = await itens_historico(
                    c,
                    selecao_historico().where(
                        partidas.c.jogador_id == jogador_id,
                        partidas.c.modo == "individual",
                        ~partidas.c.estado.in_(ENCERRADAS),
                    ),
                )
                return DadosEstatisticas(resumo, abertos[0] if abertos else None, grupos)

    async def ranking(self, categoria: Categoria, pagina: int) -> Ranking:
        medida = {
            "pontos": func.sum(resultados_individuais.c.pontos),
            "palavras-acertadas": func.sum(resultados_individuais.c.acertos),
            "partidas-concluidas": func.count().filter(resultados_individuais.c.concluida),
        }[categoria]
        totais = select(
            jogadores.c.id, jogadores.c.nome_usuario, jogadores.c.estado, medida.label("valor")
        ).select_from(
            jogadores.join(partidas, jogadores.c.id == partidas.c.jogador_id).join(
                resultados_individuais, resultados_individuais.c.partida_id == partidas.c.id
            )
        )
        totais = totais.where(
            jogadores.c.estado.in_(("ativo", "anonimizado")),
            partidas.c.modo == "individual",
            partidas.c.estado.in_(ENCERRADAS),
        )
        totais = totais.group_by(jogadores.c.id).subquery()
        classificados = select(
            totais, func.rank().over(order_by=totais.c.valor.desc()).label("posicao")
        ).subquery()
        async with self.motor.connect() as aberta:
            c = await aberta.execution_options(isolation_level="REPEATABLE READ")
            async with c.begin():
                total = await c.scalar(select(func.count()).select_from(totais))
                linhas = (
                    await c.execute(
                        select(classificados)
                        .order_by(classificados.c.valor.desc(), classificados.c.id)
                        .offset((pagina - 1) * 10)
                        .limit(10)
                    )
                ).mappings()
                itens = [
                    Classificado(
                        posicao=r["posicao"],
                        valor=r["valor"],
                        nome="Jogador excluído"
                        if r["estado"] == "anonimizado"
                        else r["nome_usuario"],
                    )
                    for r in linhas
                ]
                return Ranking(categoria=categoria, itens=itens, total=total, pagina=pagina)
