"""Orquestra criação e consulta sem regras de turnos do individual."""

from uuid import UUID

from aplicacao.modulos.galera.contratos import CatalogoGalera, RepositorioGalera
from aplicacao.modulos.galera.esquemas import (
    AcaoGalera,
    ConexaoGalera,
    ConfiguracaoGalera,
    TempoGalera,
)


class ServicoGalera:
    def __init__(self, repositorio: RepositorioGalera, catalogo: CatalogoGalera):
        self.repositorio = repositorio
        self.catalogo = catalogo

    async def preparar(self, jogador_id: UUID, dados: ConfiguracaoGalera) -> dict:
        return await self.repositorio.preparar(jogador_id, dados, self.catalogo)

    async def criar(self, jogador_id: UUID, plano_id: UUID) -> dict:
        return await self.repositorio.criar(jogador_id, plano_id)

    async def consultar(self, jogador_id: UUID, partida_id: UUID) -> dict:
        return await self.repositorio.consultar(jogador_id, partida_id)

    async def consultar_painel(self, jogador_id: UUID, partida_id: UUID) -> dict:
        return await self.repositorio.consultar_painel(jogador_id, partida_id, self.catalogo)

    async def agir(self, jogador_id: UUID, partida_id: UUID, dados: AcaoGalera) -> dict:
        return await self.repositorio.agir(jogador_id, partida_id, dados, self.catalogo)

    async def tempo(
        self, jogador_id: UUID, partida_id: UUID, dados: TempoGalera | None = None
    ) -> dict:
        return await self.repositorio.tempo(jogador_id, partida_id, dados, self.catalogo)

    async def conexao(self, jogador_id: UUID, partida_id: UUID, dados: ConexaoGalera) -> dict:
        return await self.repositorio.conexao(jogador_id, partida_id, dados, self.catalogo)
