"""Reservas sem repetição, inclusive para respostas com várias temáticas."""

import random

from aplicacao.bancos.conteudo import TEMATICAS, DocumentoPalavra
from aplicacao.modulos.galera.esquemas import ConfiguracaoGalera


def combinar(
    temas: list[str],
    quantidade: int,
    palavras: list[DocumentoPalavra],
    vistas: set[str],
    sorteio: random.Random,
) -> list[DocumentoPalavra] | None:
    opcoes = []
    for tema in temas:
        candidatos = [p for p in palavras if tema in p.tematicas]
        sorteio.shuffle(candidatos)
        candidatos.sort(key=lambda p: p.id in vistas)
        opcoes.extend([candidatos] * quantidade)
    donos: dict[str, int] = {}
    escolhas: dict[int, DocumentoPalavra] = {}

    def encaixar(posicao: int, visitadas: set[str]) -> bool:
        for palavra in opcoes[posicao]:
            if palavra.id in visitadas:
                continue
            visitadas.add(palavra.id)
            if palavra.id not in donos or encaixar(donos[palavra.id], visitadas):
                donos[palavra.id] = posicao
                escolhas[posicao] = palavra
                return True
        return False

    for posicao in range(len(opcoes)):
        if not encaixar(posicao, set()):
            return None
    return [escolhas[p] for p in range(len(opcoes))]


def selecionar(
    dados: ConfiguracaoGalera,
    palavras: list[DocumentoPalavra],
    vistas: set[str],
    sorteio: random.Random,
) -> tuple[list[str], list[DocumentoPalavra]] | None:
    elegiveis = [p for p in palavras if p.dificuldade == dados.dificuldade]
    quantidade = len(dados.convidados) + 1

    def tentar(temas: list[str]):
        # Primeiro tentar uma composição inteiramente inédita.
        novas = combinar(
            temas, quantidade, [p for p in elegiveis if p.id not in vistas], set(), sorteio
        )
        return novas or combinar(temas, quantidade, elegiveis, vistas, sorteio)

    if dados.modo_tematicas == "manual":
        temas = list(dados.tematicas or [])
        escolhidas = tentar(temas)
        return (temas, escolhidas) if escolhidas else None

    def montar(temas: list[str]):
        if len(temas) == dados.quantidade_sessoes:
            escolhidas = tentar(temas)
            return (temas, escolhidas) if escolhidas else None
        opcoes = list(sorted(TEMATICAS))
        sorteio.shuffle(opcoes)
        for tema in opcoes:
            parcial = [*temas, tema]
            if combinar(parcial, quantidade, elegiveis, vistas, sorteio) is not None:
                resultado = montar(parcial)
                if resultado is not None:
                    return resultado
        return None

    return montar([])
