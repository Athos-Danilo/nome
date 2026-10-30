"""Contratos pequenos da criação da galera."""

from typing import Protocol
from uuid import UUID

from aplicacao.bancos.conteudo import DocumentoPalavra
from aplicacao.modulos.galera.esquemas import ConfiguracaoGalera


class CatalogoGalera(Protocol):
    async def listar(self) -> list[DocumentoPalavra]: ...
    async def buscar(self, identificador: str, revisao: int) -> DocumentoPalavra: ...


class RepositorioGalera(Protocol):
    async def preparar(
        self, jogador_id: UUID, dados: ConfiguracaoGalera, catalogo: CatalogoGalera
    ) -> dict: ...
    async def criar(self, jogador_id: UUID, plano_id: UUID) -> dict: ...
    async def consultar(self, jogador_id: UUID, partida_id: UUID) -> dict: ...
