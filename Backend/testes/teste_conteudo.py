import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from aplicacao.bancos.conteudo import ConteudoPalavra


def teste_lotes_existentes_respeitam_modelo_de_conteudo() -> None:
    arquivos = list((Path(__file__).resolve().parents[2] / "Data/palavras").glob("*.json"))
    assert arquivos
    for arquivo in arquivos:
        for palavra in json.loads(arquivo.read_text(encoding="utf-8"))["palavras"]:
            assert ConteudoPalavra.model_validate(palavra).resposta == palavra["resposta"]


@pytest.mark.parametrize(
    "alteracao",
    [
        {"resposta": "Japão"},
        {"dicas": ["Só uma dica"]},
        {"tematicas": ["paises", "paises"]},
        {"dificuldade": "media"},
    ],
)
def teste_rejeita_documento_invalido(alteracao: dict) -> None:
    conteudo = dict(
        id="japao",
        resposta="JAPÃO",
        tematicas=["paises"],
        dificuldade="medio",
        dicas=[f"Dica {numero}" for numero in range(5)],
    )
    with pytest.raises(ValidationError):
        ConteudoPalavra.model_validate(conteudo | alteracao)


@pytest.mark.parametrize("resposta", ["1917", "WALL-E", "MONSTROS S.A.", "ADEUS, LÊNIN!"])
def teste_catalogo_preserva_algarismos_e_sinais_da_grafia_oficial(resposta: str) -> None:
    palavra = ConteudoPalavra.model_validate(
        dict(
            id="titulo-teste",
            resposta=resposta,
            tematicas=["filmes-e-series"],
            dificuldade="medio",
            dicas=[f"Pista {n}" for n in range(5)],
        )
    )
    assert palavra.resposta == resposta


@pytest.mark.parametrize("resposta", ["---", "?!", "..."])
def teste_catalogo_exige_pelo_menos_uma_posicao_para_jogar(resposta: str) -> None:
    with pytest.raises(ValidationError):
        ConteudoPalavra.model_validate(
            dict(
                id="titulo-teste",
                resposta=resposta,
                tematicas=["filmes-e-series"],
                dificuldade="medio",
                dicas=[f"Pista {n}" for n in range(5)],
            )
        )
