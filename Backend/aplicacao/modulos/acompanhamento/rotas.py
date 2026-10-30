"""Identidade privada sempre obtida da sessão, nunca de parâmetro do cliente."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request

from aplicacao.modulos.acompanhamento.esquemas import (
    Categoria,
    Estatisticas,
    Historico,
    Modo,
    Ranking,
    Situacao,
)
from aplicacao.modulos.acompanhamento.repositorio import AcompanhamentoPostgresql
from aplicacao.modulos.autenticacao.contratos import ContaAutenticada, FalhaAutenticacao
from aplicacao.modulos.autenticacao.rotas import exigir_conta_ativa

rotas = APIRouter(prefix="/api", tags=["Acompanhamento"])
Titular = Annotated[ContaAutenticada, Depends(exigir_conta_ativa)]
Pagina = Annotated[int, Query(ge=1, le=100000)]


def repositorio(requisicao: Request) -> AcompanhamentoPostgresql:
    instancia = requisicao.app.state.consultas_acompanhamento
    if instancia is None:
        raise FalhaAutenticacao("DADOS_INDISPONIVEIS", "Tente novamente em instantes.", 503)
    return instancia


@rotas.get("/historico", response_model=Historico)
async def historico(
    requisicao: Request,
    conta: Titular,
    pagina: Pagina = 1,
    modo: Modo | None = None,
    estado: Situacao | None = None,
):
    return await repositorio(requisicao).historico(conta.jogador_id, pagina, modo, estado)


@rotas.get("/estatisticas", response_model=Estatisticas)
async def estatisticas(requisicao: Request, conta: Titular):
    repositorio(requisicao)
    return await requisicao.app.state.acompanhamento.consultar(conta.jogador_id)


@rotas.get("/rankings/{categoria}", response_model=Ranking)
async def ranking(categoria: Categoria, requisicao: Request, pagina: Pagina = 1):
    return await repositorio(requisicao).ranking(categoria, pagina)
