"""Entradas estritas; nunca receber pontuação calculada pelo navegador."""

from typing import Annotated, Literal, Self
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from aplicacao.bancos.conteudo import TEMATICAS

type Dificuldade = Literal["facil", "medio", "dificil"]


class Entrada(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ConfiguracaoIndividual(Entrada):
    quantidade_palavras: Literal[3, 5, 7]
    tematica: str | None = None
    dificuldades: list[Dificuldade] = Field(
        default_factory=lambda: ["facil"], min_length=1, max_length=3
    )
    distribuicao: Literal["unica", "personalizada", "aleatoria"] = "unica"
    quantidades: dict[Dificuldade, Annotated[int, Field(strict=True, ge=0)]] | None = None
    ordem: Literal["sorteada", "crescente", "manual"] = "sorteada"
    sequencia: list[Dificuldade] | None = None
    permitir_outras_tematicas: bool = Field(default=False, strict=True)
    aceitar_reducao: bool = Field(default=False, strict=True)

    @model_validator(mode="after")
    def conferir(self) -> Self:
        from collections import Counter

        if self.tematica is not None and self.tematica not in TEMATICAS:
            raise ValueError("Temática desconhecida.")
        if len(set(self.dificuldades)) != len(self.dificuldades):
            raise ValueError("Dificuldades repetidas.")
        if self.distribuicao == "unica" and len(self.dificuldades) != 1:
            raise ValueError("Escolha uma dificuldade ou uma distribuição combinada.")
        if self.distribuicao == "personalizada":
            if (
                not self.quantidades
                or set(self.quantidades) != set(self.dificuldades)
                or any(type(n) is not int or n < 0 for n in self.quantidades.values())
                or sum(self.quantidades.values()) != self.quantidade_palavras
            ):
                raise ValueError("A soma das quantidades deve corresponder ao total.")
        elif self.quantidades is not None:
            raise ValueError("Quantidades exigem distribuição personalizada.")
        if self.ordem == "manual":
            if (
                self.distribuicao == "aleatoria"
                or not self.sequencia
                or len(self.sequencia) != self.quantidade_palavras
                or not set(self.sequencia) <= set(self.dificuldades)
            ):
                raise ValueError("Sequência manual inválida.")
            if self.quantidades is not None and Counter(self.sequencia) != Counter(
                {d: n for d, n in self.quantidades.items() if n}
            ):
                raise ValueError("A ordem deve respeitar as quantidades.")
        elif self.sequencia is not None:
            raise ValueError("Sequência explícita exige ordem manual.")
        return self


class IniciarIndividual(Entrada):
    plano_id: UUID


class AcaoIndividual(Entrada):
    id_acao: UUID
    versao_esperada: int = Field(ge=0, strict=True)


class AcaoRodada(AcaoIndividual):
    rodada_id: UUID


class EnviarPalpite(AcaoRodada):
    palpite: str = Field(min_length=1, max_length=300, strict=True)


class SalvarRascunho(Entrada):
    versao_esperada: int = Field(ge=0, strict=True)
    rodada_id: UUID
    revisao_esperada: int = Field(ge=0, strict=True)
    letras: list[str] = Field(min_length=1, max_length=300)
    selecionada: int = Field(ge=-1, lt=300, strict=True)


class ConectarIndividual(Entrada):
    aba_id: UUID
    documento_id: UUID
    navegacao: Literal["navigate", "reload", "back_forward", "desconhecida"]


class SinalIndividual(Entrada):
    aba_id: UUID
    documento_id: UUID
    evento_id: UUID
    versao_esperada: int = Field(ge=0, strict=True)
    tipo: Literal["atividade", "pagehide", "pageshow", "offline", "online", "oculta", "visivel"]
    persistido: bool = Field(default=False, strict=True)
