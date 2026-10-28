"""Operações de perfil, sem depender de HTTP ou detalhes do banco."""

from typing import Protocol
from uuid import UUID

from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.jogadores.colecao import IDENTIFICADORES_AVATARES
from aplicacao.modulos.jogadores.esquemas import (
    AlterarPerfil,
    AlterarPreferencias,
    PerfilJogador,
    PreferenciasSalvas,
)


class RepositorioJogadores(Protocol):
    async def ler_perfil(self, jogador_id: UUID) -> PerfilJogador: ...
    async def salvar_perfil(self, jogador_id: UUID, dados: AlterarPerfil) -> PerfilJogador: ...
    async def ler_preferencias(self, jogador_id: UUID) -> PreferenciasSalvas: ...
    async def salvar_preferencias(
        self, jogador_id: UUID, dados: AlterarPreferencias
    ) -> PreferenciasSalvas: ...
    async def excluir(self, jogador_id: UUID) -> None: ...


class ServicoJogadores:
    def __init__(self, repositorio: RepositorioJogadores) -> None:
        self.repositorio = repositorio

    async def consultar(self, jogador_id: UUID) -> PerfilJogador:
        return await self.repositorio.ler_perfil(jogador_id)

    async def alterar(self, jogador_id: UUID, dados: AlterarPerfil) -> PerfilJogador:
        if dados.avatar_id not in IDENTIFICADORES_AVATARES:
            raise FalhaAutenticacao("AVATAR_INVALIDO", "Escolha um avatar da coleção oficial.", 422)
        return await self.repositorio.salvar_perfil(jogador_id, dados)

    async def consultar_preferencias(self, jogador_id: UUID) -> PreferenciasSalvas:
        return await self.repositorio.ler_preferencias(jogador_id)

    async def alterar_preferencias(
        self, jogador_id: UUID, dados: AlterarPreferencias
    ) -> PreferenciasSalvas:
        return await self.repositorio.salvar_preferencias(jogador_id, dados)

    async def excluir(self, jogador_id: UUID) -> None:
        await self.repositorio.excluir(jogador_id)
