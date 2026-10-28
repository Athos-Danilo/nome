"""Fronteiras do motor, independentes dos drivers de banco."""

from typing import Protocol
from uuid import UUID

from aplicacao.bancos.conteudo import DocumentoPalavra
from aplicacao.modulos.individual.esquemas import AcaoIndividual, ConfiguracaoIndividual


class CatalogoIndividual(Protocol):
    async def listar(self) -> list[DocumentoPalavra]: ...
    async def buscar(self, identificador: str, revisao: int) -> DocumentoPalavra: ...


class RepositorioIndividual(Protocol):
    async def preparar(
        self, jogador_id: UUID, dados: ConfiguracaoIndividual, catalogo: CatalogoIndividual
    ) -> dict: ...
    async def iniciar(
        self, jogador_id: UUID, plano_id: UUID, catalogo: CatalogoIndividual
    ) -> dict: ...
    async def consultar(
        self, jogador_id: UUID, partida_id: UUID, catalogo: CatalogoIndividual
    ) -> dict: ...
    async def em_aberto(self, jogador_id: UUID, catalogo: CatalogoIndividual) -> dict: ...
    async def agir(
        self,
        jogador_id: UUID,
        partida_id: UUID,
        tipo: str,
        dados: AcaoIndividual,
        catalogo: CatalogoIndividual,
    ) -> dict: ...
