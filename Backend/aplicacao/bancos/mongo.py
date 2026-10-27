"""Conexão assíncrona privada, com fechamento explícito dos recursos."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from pymongo import AsyncMongoClient

from aplicacao.modulos.catalogo.repositorio import RepositorioCatalogo
from aplicacao.nucleo.configuracoes import Configuracoes


@asynccontextmanager
async def abrir_catalogo(configuracoes: Configuracoes) -> AsyncIterator[RepositorioCatalogo]:
    if configuracoes.mongodb_banco in {"admin", "config", "local"}:
        raise ValueError(
            "Escolha um banco próprio do Decifra, fora dos bancos internos do MongoDB."
        )
    async with AsyncMongoClient(
        configuracoes.mongodb_url.get_secret_value(), serverSelectionTimeoutMS=5000, tz_aware=True
    ) as cliente:
        await cliente.admin.command("ping")
        yield RepositorioCatalogo(cliente[configuracoes.mongodb_banco])
