"""Casos de uso sem conhecer cookies, SQL ou o driver do catálogo."""

import secrets
from uuid import UUID

from pydantic import ValidationError

from aplicacao.bancos.conteudo import TEMATICAS
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.autenticacao.servico import resumir, segredo_valido
from aplicacao.modulos.demonstracoes.contratos import (
    PalavraReservada,
    RepositorioDemonstracoes,
    Sorteio,
)


class ServicoDemonstracoes:
    def __init__(self, repositorio: RepositorioDemonstracoes, sortear: Sorteio):
        self.repositorio = repositorio
        self.sortear = sortear

    async def identificar(self, anterior: str | None) -> tuple[str, dict]:
        segredo = anterior if segredo_valido(anterior) else secrets.token_urlsafe(32)
        return segredo, await self.repositorio.identificar(resumir(segredo))

    def resumo(self, segredo: str | None) -> str:
        if not segredo_valido(segredo):
            raise FalhaAutenticacao(
                "VISITANTE_NECESSARIO", "Atualize a página para continuar.", 401
            )
        return resumir(segredo)

    async def selecionar(self) -> list[dict]:
        try:
            itens = [PalavraReservada.model_validate(item) for item in await self.sortear()]
        except ValidationError as falha:
            raise FalhaAutenticacao(
                "CATALOGO_INDISPONIVEL", "Não foi possível preparar as palavras.", 503
            ) from falha
        if (
            len(itens) != 3
            or len({item.id for item in itens}) != 3
            or any(item.dificuldade != "facil" or item.tematica not in TEMATICAS for item in itens)
        ):
            raise FalhaAutenticacao(
                "CONTEUDO_INSUFICIENTE", "Ainda não há palavras suficientes para o teste.", 409
            )
        return [item.model_dump() for item in itens]

    async def consultar(self, segredo: str | None) -> dict:
        return await self.repositorio.consultar_demonstracao(self.resumo(segredo))

    async def consultar_visitante(self, segredo: str | None) -> dict:
        return await self.repositorio.consultar_visitante(self.resumo(segredo))

    async def iniciar(self, segredo: str | None) -> dict:
        return await self.repositorio.iniciar(self.resumo(segredo), self.selecionar)

    async def vincular(self, segredo: str | None, jogador_id: UUID) -> dict:
        return await self.repositorio.vincular(self.resumo(segredo), jogador_id)
