"""Configuração privada da galera, com sessão ativa e CSRF."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request

from aplicacao.modulos.autenticacao.contratos import ContaAutenticada, FalhaAutenticacao
from aplicacao.modulos.autenticacao.rotas import exigir_conta_ativa
from aplicacao.modulos.galera.esquemas import ConfiguracaoGalera, CriarGalera
from aplicacao.modulos.galera.servico import ServicoGalera

rotas = APIRouter(prefix="/api/partidas/galera", tags=["Galera"])
Titular = Annotated[ContaAutenticada, Depends(exigir_conta_ativa)]


def servico(requisicao: Request) -> ServicoGalera:
    if requisicao.app.state.galera is None:
        raise FalhaAutenticacao(
            "DADOS_INDISPONIVEIS", "A galera está indisponível. Tente novamente.", 503
        )
    return requisicao.app.state.galera


@rotas.post("/configuracao")
async def preparar(dados: ConfiguracaoGalera, requisicao: Request, conta: Titular):
    return await servico(requisicao).preparar(conta.jogador_id, dados)


@rotas.post("")
async def criar(dados: CriarGalera, requisicao: Request, conta: Titular):
    return await servico(requisicao).criar(conta.jogador_id, dados.plano_id)


@rotas.get("/{partida_id}")
async def consultar(partida_id: UUID, requisicao: Request, conta: Titular):
    return await servico(requisicao).consultar(conta.jogador_id, partida_id)
