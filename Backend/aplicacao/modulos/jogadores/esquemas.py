"""Entradas estritas e saídas privadas explícitas."""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from aplicacao.nucleo.nomes import validar_nome


class PerfilJogador(BaseModel):
    jogador_id: UUID
    email: str
    estado: Literal["cadastro_pendente", "ativo"]
    nome_usuario: str | None
    avatar_id: str | None


class AlterarPerfil(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    nome_usuario: str
    avatar_id: str

    @field_validator("nome_usuario")
    @classmethod
    def conferir_nome(cls, valor: str) -> str:
        return validar_nome(valor)


class PreferenciasJogador(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    tema: Literal["claro", "escuro"] = "claro"
    paleta: Literal["original", "azul", "roxa", "grafite"] = "original"
    musica_id: Literal["lofi_01", "lofi_02", "lofi_03", "arcade_01", "arcade_02"] | None = None
    volume_musica: int = Field(default=70, ge=0, le=100)
    volume_interface: int = Field(default=70, ge=0, le=100)
    volume_eventos: int = Field(default=70, ge=0, le=100)
    silenciado: bool = False
    movimentos_reduzidos: bool = False


class AlterarPreferencias(PreferenciasJogador):
    somente_se_ausentes: bool = False


class PreferenciasSalvas(PreferenciasJogador):
    salvas: bool


class ExcluirConta(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    confirmacao: Literal["EXCLUIR"]
