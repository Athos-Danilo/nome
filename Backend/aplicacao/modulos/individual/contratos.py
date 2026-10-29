"""Fronteiras do motor, independentes dos drivers de banco."""

from typing import Protocol
from uuid import UUID

from aplicacao.bancos.conteudo import DocumentoPalavra
from aplicacao.modulos.individual.esquemas import (
    AcaoIndividual,
    ConectarIndividual,
    ConfiguracaoIndividual,
    SalvarRascunho,
    SalvarTempo,
    SinalIndividual,
)


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

    async def jogo_demonstracao(
        self, resumo: str, catalogo: CatalogoIndividual, ativar: bool = False
    ) -> dict: ...
    async def agir_demonstracao(
        self, resumo: str, tipo: str, dados: AcaoIndividual, catalogo: CatalogoIndividual
    ) -> dict: ...

    async def continuidade(
        self,
        jogador_id: UUID,
        partida_id: UUID,
        operacao: str,
        dados: SalvarRascunho | SalvarTempo | ConectarIndividual | SinalIndividual,
        catalogo: CatalogoIndividual,
    ) -> dict: ...
    async def continuidade_demonstracao(
        self,
        resumo: str,
        operacao: str,
        dados: SalvarRascunho | SalvarTempo | ConectarIndividual | SinalIndividual,
        catalogo: CatalogoIndividual,
    ) -> dict: ...
