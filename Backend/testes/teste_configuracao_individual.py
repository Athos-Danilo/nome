import random
from collections import Counter

import pytest
from pydantic import ValidationError

from aplicacao.modulos.individual.configuracao import selecionar_palavras, sequencia_dificuldades
from aplicacao.modulos.individual.esquemas import ConfiguracaoIndividual
from testes.teste_individual import CatalogoControlado


def teste_sorteio_independente_preserva_chances_e_ordem_crescente():
    dados = ConfiguracaoIndividual(
        quantidade_palavras=7,
        dificuldades=["facil", "medio"],
        distribuicao="aleatoria",
        ordem="crescente",
    )
    esperado = random.Random(12).choices(["facil", "medio"], k=7)
    obtido = sequencia_dificuldades(dados, random.Random(12))
    assert Counter(obtido) == Counter(esperado)
    assert obtido == sorted(esperado, key=["facil", "medio", "dificil"].index)


def teste_quantidades_e_ordem_manual_sao_respeitadas():
    dados = ConfiguracaoIndividual(
        quantidade_palavras=3,
        dificuldades=["facil", "medio"],
        distribuicao="personalizada",
        quantidades={"facil": 1, "medio": 2},
        ordem="manual",
        sequencia=["medio", "facil", "medio"],
    )
    assert sequencia_dificuldades(dados, random.Random(1)) == ["medio", "facil", "medio"]
    with pytest.raises(ValidationError):
        ConfiguracaoIndividual(**(dados.model_dump() | {"quantidades": {"facil": 2, "medio": 1}}))


def teste_ineditas_precedem_vistas_e_nunca_repetem_na_partida():
    dados = ConfiguracaoIndividual(quantidade_palavras=3, tematica="paises")
    itens = CatalogoControlado().itens[:4]
    escolhidas = selecionar_palavras(
        dados, ["facil"] * 3, itens, {p.id for p in itens[:3]}, random.Random(2)
    )
    assert escolhidas[0].id == itens[3].id
    assert len(escolhidas) == len({p.id for p in escolhidas}) == 3


def teste_sem_troca_silenciosa_de_tematica_ou_dificuldade():
    itens = CatalogoControlado().itens
    dados = ConfiguracaoIndividual(quantidade_palavras=3, tematica="animais")
    assert selecionar_palavras(dados, ["facil"] * 3, itens, set(), random.Random(1)) == []
    dados.permitir_outras_tematicas = True
    assert len(selecionar_palavras(dados, ["facil"] * 3, itens, set(), random.Random(1))) == 3
    assert selecionar_palavras(dados, ["dificil"] * 3, itens, set(), random.Random(1)) == []


@pytest.mark.parametrize("quantidade", [True, 1.0, "1"])
def teste_quantidades_nao_aceitam_booleanos_decimais_ou_textos(quantidade):
    with pytest.raises(ValidationError):
        ConfiguracaoIndividual(
            quantidade_palavras=3,
            dificuldades=["facil", "medio"],
            distribuicao="personalizada",
            quantidades={"facil": quantidade, "medio": 2},
        )


def teste_ineditas_continuam_prioritarias_depois_de_autorizar_outras_tematicas():
    itens = CatalogoControlado().itens[:3]
    itens[2] = itens[2].model_copy(update={"tematicas": ["animais"]})
    dados = ConfiguracaoIndividual(
        quantidade_palavras=3, tematica="paises", permitir_outras_tematicas=True
    )
    escolhidas = selecionar_palavras(
        dados, ["facil"] * 3, itens, {p.id for p in itens[:2]}, random.Random(1)
    )
    assert escolhidas[0].id == itens[2].id
