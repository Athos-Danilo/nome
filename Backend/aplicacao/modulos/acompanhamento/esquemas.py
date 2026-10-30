"""Projeções de consulta sem respostas, palpites ou identidade privada."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

Modo = Literal["individual", "galera"]
Situacao = Literal["preparada", "em_andamento", "pausada", "concluida", "abandonada"]
Categoria = Literal["pontos", "palavras-acertadas", "partidas-concluidas"]


class ParticipanteHistorico(BaseModel):
    nome: str
    pontos: int


class ItemHistorico(BaseModel):
    partida_id: UUID
    modo: Modo
    origem: str
    estado: Situacao
    criado_em: datetime
    encerrada_em: datetime | None
    pontuacao: int
    palavras: int
    acertos: int
    participantes: list[ParticipanteHistorico] = Field(default_factory=list)
    vencedores: list[str] = Field(default_factory=list)
    resultado_galera: str | None = None
    motivo_encerramento: str | None = None


class Historico(BaseModel):
    itens: list[ItemHistorico]
    total: int
    pagina: int
    por_pagina: int = 10


class Desempenho(BaseModel):
    palavras_apresentadas: int = 0
    palavras_acertadas: int = 0
    palavras_desistidas: int = 0
    erros: int = 0
    pontos: int = 0
    media_dicas: float | None = None


class Resumo(BaseModel):
    partidas_encerradas: int = 0
    partidas_concluidas: int = 0
    partidas_abandonadas: int = 0
    pontos: int = 0
    melhor_pontuacao: int | None = None
    palavras_acertadas: int = 0
    palavras_desistidas: int = 0
    erros: int = 0
    media_dicas: float | None = None


class Estatisticas(BaseModel):
    resumo: Resumo
    em_aberto: ItemHistorico | None
    por_tematica: dict[str, Desempenho]
    por_dificuldade: dict[str, Desempenho]


class Classificado(BaseModel):
    posicao: int
    nome: str
    valor: int


class Ranking(BaseModel):
    categoria: Categoria
    itens: list[Classificado]
    total: int
    pagina: int
    por_pagina: int = 10
