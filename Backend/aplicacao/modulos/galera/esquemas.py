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


class AcaoGalera(Entrada):
    id_acao: UUID
    versao_esperada: int = Field(ge=0, strict=True)
    tipo: Literal["iniciar", "letra", "palpite", "voto", "extra", "encerrar"]
    participante_id: UUID | None = None
    valor: str | None = Field(default=None, max_length=300, strict=True)
    palavra: int | None = Field(default=None, ge=0, le=2, strict=True)
    aceita: bool | None = Field(default=None, strict=True)
    tematica: str | None = None

    @model_validator(mode="after")
    def conferir_acao(self) -> Self:
        campos = self.model_fields_set - {"id_acao", "versao_esperada", "tipo"}
        permitidos = {
            "iniciar": set(),
            "encerrar": set(),
            "letra": {"participante_id", "valor"},
            "palpite": {"participante_id", "valor", "palavra"},
            "voto": {"participante_id", "aceita"},
            "extra": {"tematica"},
        }[self.tipo]
        if not campos <= permitidos:
            raise ValueError("Campos incompatíveis com essa ação.")
        if self.tipo in {"letra", "palpite"} and (
            self.participante_id is None or self.valor is None
        ):
            raise ValueError("Informe participante e tentativa.")
        if self.tipo == "palpite" and self.palavra is None:
            raise ValueError("Escolha a palavra.")
        if self.tipo == "voto" and (self.participante_id is None or self.aceita is None):
            raise ValueError("Informe o voto do participante.")
        if self.tematica is not None and self.tematica not in TEMATICAS:
            raise ValueError("Escolha uma temática válida.")
        return self


class TempoGalera(Entrada):
    sessao_id: UUID
    inicio_ms: int = Field(ge=0, strict=True)
    fim_ms: int = Field(ge=0, strict=True)


class ConexaoGalera(Entrada):
    tipo: Literal["conectar", "pagehide", "pageshow"]
    aba_id: UUID
    documento_id: UUID
    versao_esperada: int = Field(ge=0, strict=True)
    navegacao: Literal["navigate", "reload", "back_forward", "desconhecida"] = "desconhecida"
    evento_id: UUID | None = None
    persistido: bool = Field(default=False, strict=True)
