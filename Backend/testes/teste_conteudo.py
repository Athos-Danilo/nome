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
