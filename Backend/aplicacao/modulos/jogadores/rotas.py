"""Entradas autenticadas sempre usam o titular da própria sessão."""

from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response

from aplicacao.modulos.autenticacao.contratos import ContaAutenticada, FalhaAutenticacao
from aplicacao.modulos.autenticacao.rotas import exigir_conta, nome_cookie
from aplicacao.modulos.jogadores.colecao import listar_avatares
from aplicacao.modulos.jogadores.esquemas import (
    AlterarPerfil,
    AlterarPreferencias,
    ExcluirConta,
    PerfilJogador,
    PreferenciasSalvas,
)
from aplicacao.modulos.jogadores.servico import ServicoJogadores

rotas = APIRouter(prefix="/api", tags=["Perfil e preferências"])
Titular = Annotated[ContaAutenticada, Depends(exigir_conta)]


def servico(requisicao: Request) -> ServicoJogadores:
    instancia = requisicao.app.state.jogadores
    if instancia is None:
        raise FalhaAutenticacao(
            "DADOS_INDISPONIVEIS", "Seus dados estão indisponíveis. Tente novamente.", 503
        )
    return instancia


@rotas.get("/avatares")
async def consultar_avatares() -> list[dict[str, str]]:
    return listar_avatares()


@rotas.get("/perfil", response_model=PerfilJogador)
async def consultar_perfil(requisicao: Request, conta: Titular) -> PerfilJogador:
    return await servico(requisicao).consultar(conta.jogador_id)


@rotas.patch("/perfil", response_model=PerfilJogador)
async def alterar_perfil(
    dados: AlterarPerfil, requisicao: Request, conta: Titular
) -> PerfilJogador:
    return await servico(requisicao).alterar(conta.jogador_id, dados)


@rotas.get("/preferencias", response_model=PreferenciasSalvas)
async def consultar_preferencias(requisicao: Request, conta: Titular) -> PreferenciasSalvas:
    return await servico(requisicao).consultar_preferencias(conta.jogador_id)


@rotas.put("/preferencias", response_model=PreferenciasSalvas)
async def alterar_preferencias(
    dados: AlterarPreferencias, requisicao: Request, conta: Titular
) -> PreferenciasSalvas:
    return await servico(requisicao).alterar_preferencias(conta.jogador_id, dados)


@rotas.delete("/perfil", status_code=204)
async def excluir_perfil(dados: ExcluirConta, requisicao: Request, conta: Titular) -> Response:
    await servico(requisicao).excluir(conta.jogador_id)
    resposta = Response(status_code=204)
    resposta.delete_cookie(
        nome_cookie(requisicao, "sessao"),
        path="/",
        httponly=True,
        secure=requisicao.app.state.configuracoes.cookie_seguro,
        samesite="lax",
    )
    return resposta
