"""Documento de conteúdo comum ao catálogo atual e às revisões imutáveis."""

import unicodedata
from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Texto = Annotated[str, Field(min_length=1)]


class ConteudoPalavra(BaseModel):
    model_config = ConfigDict(extra="forbid")

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
        if not any(caractere.isalpha() for caractere in resposta):
            raise ValueError("A resposta precisa conter letras.")
        if resposta != unicodedata.normalize("NFC", resposta):
            raise ValueError("A resposta deve utilizar Unicode NFC, preservando os acentos.")
        return resposta

    @field_validator("tematicas", "dicas")
    @classmethod
    def validar_textos(cls, textos: list[str]) -> list[str]:
        if any(not texto.strip() for texto in textos) or len(set(textos)) != len(textos):
            raise ValueError("Não utilize textos vazios ou repetidos.")
        return textos


class DocumentoPalavra(ConteudoPalavra):
    revisao: Annotated[int, Field(gt=0)]
    lote_origem: Texto
    atualizado_em: datetime

    @field_validator("atualizado_em")
    @classmethod
    def validar_fuso(cls, instante: datetime) -> datetime:
        if instante.utcoffset() is None:
            raise ValueError("O instante da revisão precisa informar o fuso horário.")
        return instante
