"""Cookies opacos e autorização do titular em cada transferência."""

import hmac
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from aplicacao.modulos.autenticacao.contratos import ContaAutenticada, FalhaAutenticacao
from aplicacao.modulos.autenticacao.rotas import exigir_conta, gravar_cookie, nome_cookie
from aplicacao.modulos.autenticacao.servico import segredo_valido, token_csrf
from aplicacao.modulos.demonstracoes.contratos import EntradaVazia
from aplicacao.modulos.demonstracoes.servico import ServicoDemonstracoes

rotas = APIRouter(prefix="/api", tags=["Visitante e demonstração"])


def servico(requisicao: Request) -> ServicoDemonstracoes:
    instancia = requisicao.app.state.demonstracoes
    if instancia is None:
        raise FalhaAutenticacao(
            "DADOS_INDISPONIVEIS", "O teste está indisponível. Tente novamente.", 503
        )
    return instancia


def origem_valida(requisicao: Request):
    if requisicao.headers.get("origin") != requisicao.app.state.configuracoes.origem_publica:
        raise FalhaAutenticacao("ACAO_NAO_PERMITIDA", "Atualize a página e tente novamente.", 403)


def segredo_visitante(requisicao: Request) -> str | None:
    return requisicao.cookies.get(nome_cookie(requisicao, "visitante"))


@rotas.post("/visitantes")
async def identificar_visitante(requisicao: Request, dados: EntradaVazia | None = None):
    origem_valida(requisicao)
    segredo, estado = await servico(requisicao).identificar(segredo_visitante(requisicao))
    resposta = JSONResponse(jsonable_encoder({**estado, "token_csrf": token_csrf(segredo)}))
    # Validade técnica do cookie renovada a cada acesso; não é o prazo do vínculo.
    gravar_cookie(requisicao, resposta, "visitante", segredo, 365 * 86400)
    return resposta


@rotas.post("/demonstracoes")
async def iniciar_demonstracao(requisicao: Request, dados: EntradaVazia | None = None):
    origem_valida(requisicao)
    segredo = segredo_visitante(requisicao)
    if not segredo_valido(segredo):
        raise FalhaAutenticacao("VISITANTE_NECESSARIO", "Atualize a página para continuar.", 401)
    recebido = requisicao.headers.get("x-decifra-csrf", "")
    if not hmac.compare_digest(recebido.encode(), token_csrf(segredo).encode()):
        raise FalhaAutenticacao("ACAO_NAO_PERMITIDA", "Atualize a página e tente novamente.", 403)
    # Conta autenticada não pode consumir um novo teste; um teste já em curso segue acessível.
    sessao = requisicao.cookies.get(nome_cookie(requisicao, "sessao"))
    if segredo_valido(sessao) and requisicao.app.state.autenticacao:
        try:
            await requisicao.app.state.autenticacao.consultar(sessao)
        except FalhaAutenticacao as falha:
            if falha.situacao != 401:
                raise
        else:
            estado = await servico(requisicao).consultar_visitante(segredo)
            if not estado["demonstracao_utilizada"]:
                raise FalhaAutenticacao(
                    "ENTRADA_JA_REALIZADA", "Sua conta já pode criar partidas completas.", 403
                )
    return await servico(requisicao).iniciar(segredo)


@rotas.get("/demonstracoes/atual")
async def consultar_demonstracao(requisicao: Request):
    return await servico(requisicao).consultar(segredo_visitante(requisicao))


@rotas.post("/demonstracoes/vinculo")
async def vincular_demonstracao(
    requisicao: Request,
    conta: Annotated[ContaAutenticada, Depends(exigir_conta)],
    dados: EntradaVazia | None = None,
):
    return await servico(requisicao).vincular(segredo_visitante(requisicao), conta.jogador_id)
