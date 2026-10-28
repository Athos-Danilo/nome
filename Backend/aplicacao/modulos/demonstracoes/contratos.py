"""Contratos pequenos para sorteio e persistência da demonstração."""

from collections.abc import Awaitable, Callable
from typing import Protocol
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PalavraReservada(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    id: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    revisao: int = Field(gt=0)
    dificuldade: str
    tematica: str


type Sorteio = Callable[[], Awaitable[list[dict]]]


class RepositorioDemonstracoes(Protocol):
    async def identificar(self, resumo: str) -> dict: ...
    async def consultar_visitante(self, resumo: str) -> dict: ...
    async def consultar_demonstracao(self, resumo: str) -> dict: ...
    async def iniciar(self, resumo: str, sortear: Sorteio) -> dict: ...
    async def vincular(self, resumo: str, jogador_id: UUID) -> dict: ...


class EntradaVazia(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
