"""Casos de uso com dependências de catálogo e persistência explícitas."""

from uuid import UUID

from aplicacao.modulos.individual.contratos import CatalogoIndividual, RepositorioIndividual
from aplicacao.modulos.individual.esquemas import AcaoIndividual, ConfiguracaoIndividual


class ServicoIndividual:
    def __init__(self, repositorio: RepositorioIndividual, catalogo: CatalogoIndividual):
        self.repositorio = repositorio
        self.catalogo = catalogo

    async def preparar(self, jogador_id: UUID, dados: ConfiguracaoIndividual) -> dict:
        return await self.repositorio.preparar(jogador_id, dados, self.catalogo)

    async def iniciar(self, jogador_id: UUID, plano_id: UUID) -> dict:
        return await self.repositorio.iniciar(jogador_id, plano_id, self.catalogo)

    async def consultar(self, jogador_id: UUID, partida_id: UUID) -> dict:
        return await self.repositorio.consultar(jogador_id, partida_id, self.catalogo)

    async def em_aberto(self, jogador_id: UUID) -> dict:
        return await self.repositorio.em_aberto(jogador_id, self.catalogo)

    async def agir(
        self, jogador_id: UUID, partida_id: UUID, tipo: str, dados: AcaoIndividual
    ) -> dict:
        return await self.repositorio.agir(jogador_id, partida_id, tipo, dados, self.catalogo)

    async def jogo_demonstracao(self, resumo: str, ativar: bool = False) -> dict:
        return await self.repositorio.jogo_demonstracao(resumo, self.catalogo, ativar)

    async def agir_demonstracao(self, resumo: str, tipo: str, dados: AcaoIndividual) -> dict:
        return await self.repositorio.agir_demonstracao(resumo, tipo, dados, self.catalogo)
