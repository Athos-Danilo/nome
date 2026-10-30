"""Fórmulas dos indicadores, usando a revisão histórica do catálogo."""

from collections import defaultdict
from typing import Protocol
from uuid import UUID

from aplicacao.bancos.conteudo import DocumentoPalavra
from aplicacao.modulos.acompanhamento.contratos import DadosEstatisticas, GrupoRodadas
from aplicacao.modulos.acompanhamento.esquemas import Desempenho, Estatisticas


class LeituraEstatisticas(Protocol):
    async def estatisticas(self, jogador_id: UUID) -> DadosEstatisticas: ...


class LeituraRevisoes(Protocol):
    async def buscar(self, identificador: str, revisao: int) -> DocumentoPalavra: ...


def desempenho(grupos: list[GrupoRodadas]) -> Desempenho:
    acertos = sum(g.quantidade for g in grupos if g.estado == "acertada")
    dicas = sum(g.quantidade * g.dica for g in grupos if g.estado == "acertada")
    return Desempenho(
        palavras_apresentadas=sum(g.quantidade for g in grupos),
        palavras_acertadas=acertos,
        palavras_desistidas=sum(g.quantidade for g in grupos if g.estado == "desistida"),
        erros=sum(g.erros for g in grupos),
        pontos=sum(g.pontos for g in grupos),
        media_dicas=round(dicas / acertos, 2) if acertos else None,
    )


class ServicoEstatisticas:
    def __init__(self, repositorio: LeituraEstatisticas, catalogo: LeituraRevisoes):
        self.repositorio = repositorio
        self.catalogo = catalogo

    async def consultar(self, jogador_id: UUID) -> Estatisticas:
        dados = await self.repositorio.estatisticas(jogador_id)
        geral = desempenho(dados.grupos)
        dados.resumo.palavras_desistidas = geral.palavras_desistidas
        dados.resumo.erros = geral.erros
        dados.resumo.media_dicas = geral.media_dicas
        temas: dict[str, list[GrupoRodadas]] = defaultdict(list)
        dificuldades: dict[str, list[GrupoRodadas]] = defaultdict(list)
        revisoes: dict[tuple[str, int], list[str]] = {}
        for grupo in dados.grupos:
            chave = (grupo.palavra_id, grupo.revisao)
            if chave not in revisoes:
                revisoes[chave] = (await self.catalogo.buscar(*chave)).tematicas
            for tema in set(revisoes[chave]):
                temas[tema].append(grupo)
            dificuldades[grupo.dificuldade].append(grupo)
        return Estatisticas(
            resumo=dados.resumo,
            em_aberto=dados.em_aberto,
            por_tematica={t: desempenho(g) for t, g in sorted(temas.items())},
            por_dificuldade={d: desempenho(g) for d, g in sorted(dificuldades.items())},
        )
