"""Proteção de respostas privadas também nas subrotas e falhas da demonstração."""

import asyncio
from types import SimpleNamespace

import httpx
import pytest

from aplicacao.nucleo.configuracoes import Configuracoes
from aplicacao.principal import criar_aplicacao


@pytest.mark.parametrize(
    "metodo,caminho",
    [
        ("GET", "/api/demonstracoes/jogo"),
        ("GET", "/api/demonstracoes/jogo/tempo"),
        ("POST", "/api/demonstracoes/jogo"),
        ("POST", "/api/demonstracoes/jogo/palpites"),
        ("POST", "/api/demonstracoes/jogo/rascunho"),
        ("POST", "/api/demonstracoes/jogo/conexoes"),
        ("POST", "/api/demonstracoes/jogo/sinais"),
        ("POST", "/api/demonstracoes/jogo/tempo"),
    ],
)
def teste_subrotas_da_demonstracao_nao_armazenam_respostas_privadas(metodo, caminho):
    async def verificar():
        api = criar_aplicacao(Configuracoes(_env_file=None, ambiente="teste"))
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
        ) as cliente:
            resposta = await cliente.request(metodo, caminho, json={})
            assert resposta.status_code >= 400
            assert resposta.headers.get("Cache-Control") == "no-store"
            assert resposta.headers.get("Referrer-Policy") == "no-referrer"

    asyncio.run(verificar())


@pytest.mark.parametrize("caminho", ["/api/demonstracoes/jogo", "/api/demonstracoes/jogo/tempo"])
def teste_estado_da_demonstracao_bem_sucedido_tambem_nao_fica_em_cache(caminho):
    async def verificar():
        async def jogo_atual(resumo):
            assert resumo == "visitante-controlado"
            return {"rodada_atual": {"dicas": ["Dica já revelada."]}}

        api = criar_aplicacao(Configuracoes(_env_file=None, ambiente="teste"))
        api.state.demonstracoes = SimpleNamespace(resumo=lambda segredo: "visitante-controlado")
        api.state.individual = SimpleNamespace(jogo_demonstracao=jogo_atual)
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
        ) as cliente:
            resposta = await cliente.get(caminho)
            assert resposta.status_code == 200
            assert resposta.json()["rodada_atual"]["dicas"] == ["Dica já revelada."]
            assert resposta.headers["Cache-Control"] == "no-store"
            assert resposta.headers["Referrer-Policy"] == "no-referrer"

    asyncio.run(verificar())
