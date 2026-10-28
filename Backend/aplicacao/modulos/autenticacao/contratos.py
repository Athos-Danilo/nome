"""Contratos internos; não representam respostas públicas da API."""

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol
from uuid import UUID


@dataclass(frozen=True)
class IdentidadeGoogle:
    sujeito: str
    email: str


@dataclass(frozen=True)
class TentativaLogin:
    estado_resumo: str
    navegador_resumo: str
    nonce: str
    verificador: str
    expira_em: datetime


@dataclass(frozen=True)
class ContaAutenticada:
    jogador_id: UUID
    email: str
    estado: str
    nome_usuario: str | None
    avatar_id: str | None
    expira_em: datetime


class RepositorioAutenticacao(Protocol):
    async def guardar_tentativa(self, tentativa: TentativaLogin) -> None: ...
    async def consumir_tentativa(
        self, estado_resumo: str, navegador_resumo: str, agora: datetime
    ) -> TentativaLogin | None: ...
    async def abrir_sessao(
        self,
        identidade: IdentidadeGoogle,
        resumo: str,
        anterior: str | None,
        agora: datetime,
        expira_em: datetime,
    ) -> None: ...
    async def consultar_sessao(self, resumo: str, agora: datetime) -> ContaAutenticada | None: ...
    async def revogar_sessao(self, resumo: str, agora: datetime) -> None: ...


class ProvedorGoogle(Protocol):
    async def endereco_login(self, estado: str, nonce: str, verificador: str) -> str: ...
    async def autenticar(self, codigo: str, nonce: str, verificador: str) -> IdentidadeGoogle: ...


class FalhaAutenticacao(Exception):
    def __init__(self, codigo: str, mensagem: str, situacao: int) -> None:
        self.codigo = codigo
        self.mensagem = mensagem
        self.situacao = situacao
        super().__init__(mensagem)
