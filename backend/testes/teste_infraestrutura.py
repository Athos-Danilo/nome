"""Verifica contrato HTTP e isolamento de origem sem acessar bancos reais."""

import asyncio

import httpx

from aplicacao.nucleo.configuracoes import Configuracoes
from aplicacao.principal import criar_aplicacao


def consultar_rota(origem: str | None = None) -> httpx.Response:
    api = criar_aplicacao(
        Configuracoes(_env_file=None, ambiente="teste", origens_permitidas=["http://testserver"])
    )

    async def executar() -> httpx.Response:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api), base_url="http://testserver"
        ) as cliente:
            return await cliente.get("/api/saude", headers={"Origin": origem} if origem else {})

    return asyncio.run(executar())


def teste_saude_nao_expoe_configuracao_privada() -> None:
    resposta = consultar_rota()
    assert resposta.status_code == 200
    assert resposta.json() == {"nome": "Decifra", "situacao": "disponivel"}


def teste_origem_autorizada_recebe_permissao() -> None:
    resposta = consultar_rota("http://testserver")
    assert resposta.headers["access-control-allow-origin"] == "http://testserver"


def teste_origem_desconhecida_nao_recebe_permissao() -> None:
    resposta = consultar_rota("https://origem-invalida.example")
    assert "access-control-allow-origin" not in resposta.headers
