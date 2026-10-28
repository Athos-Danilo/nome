"""Rotas e dependências reutilizáveis de autorização."""

import hmac
from dataclasses import asdict
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, RedirectResponse, Response

from aplicacao.modulos.autenticacao.contratos import ContaAutenticada, FalhaAutenticacao
from aplicacao.modulos.autenticacao.servico import ServicoAutenticacao, segredo_valido, token_csrf

rotas = APIRouter(prefix="/api/autenticacao", tags=["Autenticação"])


def nome_cookie(requisicao: Request, finalidade: str) -> str:
    prefixo = "__Host-" if requisicao.app.state.configuracoes.cookie_seguro else ""
    return f"{prefixo}decifra_{finalidade}"


def servico(requisicao: Request) -> ServicoAutenticacao:
    instancia = requisicao.app.state.autenticacao
    if instancia is None:
        raise FalhaAutenticacao(
            "AUTENTICACAO_INDISPONIVEL", "A entrada com Google ainda não está disponível.", 503
        )
    return instancia


async def exigir_conta(requisicao: Request) -> ContaAutenticada:
    segredo = requisicao.cookies.get(nome_cookie(requisicao, "sessao"))
    if not segredo_valido(segredo):
        raise FalhaAutenticacao("SESSAO_NECESSARIA", "Entre com sua conta Google.", 401)
    conta = await servico(requisicao).consultar(segredo)
    if requisicao.method not in {"GET", "HEAD", "OPTIONS"}:
        origem = requisicao.headers.get("origin")
        recebido = requisicao.headers.get("x-decifra-csrf", "")
        if origem != requisicao.app.state.configuracoes.origem_publica or not hmac.compare_digest(
            recebido.encode(), token_csrf(segredo).encode()
        ):
            raise FalhaAutenticacao(
                "ACAO_NAO_PERMITIDA", "Atualize a página e tente novamente.", 403
            )
    return conta


async def exigir_conta_ativa(
    conta: Annotated[ContaAutenticada, Depends(exigir_conta)],
) -> ContaAutenticada:
    if conta.estado != "ativo":
        raise FalhaAutenticacao("PERFIL_INCOMPLETO", "Conclua seu perfil para jogar.", 403)
    return conta


def gravar_cookie(requisicao: Request, resposta: Response, finalidade: str, valor: str, idade: int):
    resposta.set_cookie(
        nome_cookie(requisicao, finalidade),
        valor,
        max_age=idade,
        httponly=True,
        secure=requisicao.app.state.configuracoes.cookie_seguro,
        samesite="lax",
        path="/",
    )


@rotas.get("/google")
async def iniciar_login(requisicao: Request):
    endereco, navegador = await servico(requisicao).iniciar()
    resposta = RedirectResponse(endereco, status_code=303)
    gravar_cookie(requisicao, resposta, "login", navegador, 600)
    return resposta


@rotas.get("/google/retorno")
async def receber_retorno(requisicao: Request):
    parametros = requisicao.query_params
    estado = parametros.get("state")
    navegador = requisicao.cookies.get(nome_cookie(requisicao, "login"))
    if (
        not segredo_valido(estado)
        or not segredo_valido(navegador)
        or any(len(parametros.getlist(campo)) > 1 for campo in ("state", "code", "error"))
        or (parametros.get("code") and parametros.get("error"))
        or len(parametros.get("code", "")) > 4096
    ):
        raise FalhaAutenticacao("RETORNO_INVALIDO", "Reinicie a entrada com Google.", 400)
    segredo = await servico(requisicao).concluir(
        estado,
        navegador,
        parametros.get("code"),
        parametros.get("error"),
        requisicao.cookies.get(nome_cookie(requisicao, "sessao")),
    )
    resposta = RedirectResponse(
        requisicao.app.state.configuracoes.origem_publica + "/?autenticacao=concluida",
        status_code=303,
    )
    gravar_cookie(
        requisicao,
        resposta,
        "sessao",
        segredo,
        requisicao.app.state.configuracoes.sessao_dias * 86400,
    )
    resposta.delete_cookie(
        nome_cookie(requisicao, "login"),
        path="/",
        secure=requisicao.app.state.configuracoes.cookie_seguro,
        httponly=True,
        samesite="lax",
    )
    return resposta


@rotas.get("/sessao")
async def consultar_sessao(
    requisicao: Request, conta: Annotated[ContaAutenticada, Depends(exigir_conta)]
):
    dados = asdict(conta)
    dados["token_csrf"] = token_csrf(requisicao.cookies[nome_cookie(requisicao, "sessao")])
    return JSONResponse(jsonable_encoder(dados))


@rotas.post("/sair", status_code=204)
async def sair(requisicao: Request, conta: Annotated[ContaAutenticada, Depends(exigir_conta)]):
    await servico(requisicao).sair(requisicao.cookies[nome_cookie(requisicao, "sessao")])
    resposta = Response(status_code=204)
    resposta.delete_cookie(
        nome_cookie(requisicao, "sessao"),
        path="/",
        secure=requisicao.app.state.configuracoes.cookie_seguro,
        httponly=True,
        samesite="lax",
    )
    return resposta
