"""Configuração estrita: o anfitrião vem da conta, nunca do cliente."""

from typing import Literal, Self
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from aplicacao.bancos.conteudo import TEMATICAS
from aplicacao.nucleo.nomes import validar_nome


class Entrada(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Convidado(Entrada):
    nome: str = Field(strict=True)
    avatar_id: str = Field(strict=True, min_length=1, max_length=60)

    @field_validator("nome")
    @classmethod
    def conferir_nome(cls, valor: str) -> str:
        return validar_nome(valor)


class ConfiguracaoGalera(Entrada):
    convidados: list[Convidado] = Field(default_factory=list, max_length=2)
    dificuldade: Literal["facil", "medio", "dificil"]
    quantidade_sessoes: int = Field(ge=1, le=5, strict=True)
    modo_tematicas: Literal["manual", "aleatorio"]
    tematicas: list[str] | None = None

    @model_validator(mode="after")
    def conferir(self) -> Self:
        if self.modo_tematicas == "manual":
            if (
                self.tematicas is None
                or len(self.tematicas) != self.quantidade_sessoes
                or not set(self.tematicas) <= TEMATICAS
            ):
                raise ValueError("Escolha uma temática válida para cada sessão.")
        elif self.tematicas is not None:
            raise ValueError("O modo aleatório não aceita uma sequência de temáticas.")
        return self


class CriarGalera(Entrada):
    plano_id: UUID
