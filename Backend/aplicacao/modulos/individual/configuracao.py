"""Escolhas de dificuldade e seleção sem efeitos nos bancos."""

from random import Random

from aplicacao.bancos.conteudo import DocumentoPalavra
from aplicacao.modulos.individual.esquemas import ConfiguracaoIndividual

NIVEIS = ("facil", "medio", "dificil")


def sequencia_dificuldades(configuracao: ConfiguracaoIndividual, sorteio: Random) -> list[str]:
    if configuracao.ordem == "manual":
        return list(configuracao.sequencia)
    if configuracao.distribuicao == "aleatoria":
        sequencia = sorteio.choices(configuracao.dificuldades, k=configuracao.quantidade_palavras)
    elif configuracao.distribuicao == "personalizada":
        sequencia = [
            nivel for nivel, total in configuracao.quantidades.items() for _ in range(total)
        ]
    else:
        sequencia = configuracao.dificuldades * configuracao.quantidade_palavras
    if configuracao.ordem == "crescente":
        sequencia.sort(key=NIVEIS.index)
    else:
        sorteio.shuffle(sequencia)
    return sequencia


def selecionar_palavras(
    configuracao: ConfiguracaoIndividual,
    sequencia: list[str],
    conteudo: list[DocumentoPalavra],
    vistas: set[str],
    sorteio: Random,
) -> list[DocumentoPalavra]:
    selecionadas = []
    usadas = set()
    for nivel in sequencia:
        opcoes = [
            p
            for p in conteudo
            if p.dificuldade == nivel
            and p.id not in usadas
            and (
                configuracao.tematica is None
                or configuracao.tematica in p.tematicas
                or configuracao.permitir_outras_tematicas
            )
        ]
        if not opcoes:
            continue
        sorteio.shuffle(opcoes)
        opcoes.sort(
            key=lambda p: (
                p.id in vistas,
                configuracao.tematica is not None and configuracao.tematica not in p.tematicas,
            )
        )
        selecionadas.append(opcoes[0])
        usadas.add(opcoes[0].id)
    return selecionadas
