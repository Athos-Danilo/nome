"""Contratos pequenos da criação da galera."""

from typing import Protocol
from uuid import UUID

from aplicacao.bancos.conteudo import DocumentoPalavra
from aplicacao.modulos.galera.esquemas import (
    AcaoGalera,
    ConexaoGalera,
    ConfiguracaoGalera,
    TempoGalera,
)


class CatalogoGalera(Protocol):
    async def listar(self) -> list[DocumentoPalavra]: ...
    async def buscar(self, identificador: str, revisao: int) -> DocumentoPalavra: ...


class RepositorioGalera(Protocol):
    async def preparar(
        self, jogador_id: UUID, dados: ConfiguracaoGalera, catalogo: CatalogoGalera
    ) -> dict: ...
    async def criar(self, jogador_id: UUID, plano_id: UUID) -> dict: ...
    async def consultar(self, jogador_id: UUID, partida_id: UUID) -> dict: ...

    async def consultar_painel(
        self, jogador_id: UUID, partida_id: UUID, catalogo: CatalogoGalera
    ) -> dict: ...
    async def agir(
        self, jogador_id: UUID, partida_id: UUID, dados: AcaoGalera, catalogo: CatalogoGalera
    ) -> dict: ...
    async def tempo(
        self,
        jogador_id: UUID,
        partida_id: UUID,
        dados: TempoGalera | None,
        catalogo: CatalogoGalera,
    ) -> dict: ...

    async def conexao(
        self, jogador_id: UUID, partida_id: UUID, dados: ConexaoGalera, catalogo: CatalogoGalera
    ) -> dict: ...
