"""Documento de conteúdo comum ao catálogo atual e às revisões imutáveis."""

import unicodedata
from datetime import datetime
from typing import Annotated, Literal, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

Texto = Annotated[str, Field(min_length=1)]
TEMATICAS = frozenset({"animais", "filmes-e-series", "marcas", "paises", "objetos"})


def chave_da_resposta(resposta: str) -> str:
    """Detecta duplicatas do catálogo; não valida palpites de uma partida."""
    texto = unicodedata.normalize("NFD", resposta.casefold())
    return " ".join("".join(letra for letra in texto if not unicodedata.combining(letra)).split())


class ConteudoPalavra(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    id: Annotated[str, Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    resposta: Texto
    tematicas: Annotated[list[Texto], Field(min_length=1)]
    dificuldade: Literal["facil", "medio", "dificil"]
    dicas: Annotated[list[Texto], Field(min_length=5, max_length=5)]

    @field_validator("resposta")
    @classmethod
    def validar_resposta(cls, resposta: str) -> str:
        if resposta != resposta.strip() or resposta != resposta.upper():
            raise ValueError("A resposta deve estar em maiúsculas e sem espaços nas extremidades.")
        if not any(caractere.isalpha() or caractere in "0123456789" for caractere in resposta):
            raise ValueError("A resposta precisa conter letras ou algarismos de 0 a 9.")
        if resposta != unicodedata.normalize("NFC", resposta):
            raise ValueError("A resposta deve utilizar Unicode NFC, preservando os acentos.")
        return resposta

    @field_validator("tematicas", "dicas")
    @classmethod
    def validar_textos(cls, textos: list[str]) -> list[str]:
        if any(not texto.strip() or texto != texto.strip() for texto in textos):
            raise ValueError("Não utilize textos vazios ou espaços nas extremidades.")
        if any(texto != unicodedata.normalize("NFC", texto) for texto in textos):
            raise ValueError("Os textos devem utilizar Unicode NFC.")
        if len(set(textos)) != len(textos):
            raise ValueError("Não utilize textos repetidos.")
        return textos

    @field_validator("tematicas")
    @classmethod
    def validar_tematicas(cls, tematicas: list[str]) -> list[str]:
        if not set(tematicas) <= TEMATICAS:
            raise ValueError("Temática desconhecida; utilize os identificadores do catálogo.")
        return tematicas


class DocumentoPalavra(ConteudoPalavra):
    resposta_chave: Texto
    revisao: Annotated[int, Field(gt=0)]
    lote_origem: Texto
    atualizado_em: datetime

    @field_validator("atualizado_em")
    @classmethod
    def validar_fuso(cls, instante: datetime) -> datetime:
        if instante.utcoffset() is None:
            raise ValueError("O instante da revisão precisa informar o fuso horário.")
        return instante

    @model_validator(mode="after")
    def validar_chave(self) -> Self:
        if self.resposta_chave != chave_da_resposta(self.resposta):
            raise ValueError("Chave de resposta incompatível com o texto do conteúdo.")
        return self


class LotePalavras(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    versao_formato: Literal[1]
    lote: Annotated[str, Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    palavras: Annotated[list[ConteudoPalavra], Field(min_length=1)]

    @field_validator("versao_formato", mode="before")
    @classmethod
    def validar_versao(cls, versao: object) -> object:
        if type(versao) is not int:
            raise ValueError("A versão deve ser o número inteiro 1.")
        return versao
