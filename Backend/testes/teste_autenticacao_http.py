"""Contratos públicos da autenticação, sem credenciais nem tráfego Google."""

import asyncio
from datetime import UTC, datetime, timedelta
from typing import Annotated
from urllib.parse import parse_qs, urlparse
from uuid import uuid4

import httpx
import pytest
from fastapi import Depends
from pydantic import ValidationError

from aplicacao.modulos.autenticacao.contratos import (
    ContaAutenticada,
    FalhaAutenticacao,
    IdentidadeGoogle,
)
from aplicacao.modulos.autenticacao.rotas import exigir_conta_ativa
from aplicacao.nucleo.configuracoes import Configuracoes
from aplicacao.principal import criar_aplicacao


def consultar(caminho: str) -> httpx.Response:
    async def executar() -> httpx.Response:
        api = criar_aplicacao(Configuracoes(_env_file=None, ambiente="teste"))
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
        ) as cliente:
            return await cliente.get(caminho)

    return asyncio.run(executar())


def teste_sessao_ausente_nao_autoriza() -> None:
    resposta = consultar("/api/autenticacao/sessao")
    assert resposta.status_code == 401
    assert resposta.json()["erro"]["codigo"] == "SESSAO_NECESSARIA"
    assert resposta.headers["cache-control"] == "no-store"


def teste_login_sem_configuracao_nao_expoe_segredos() -> None:
    resposta = consultar("/api/autenticacao/google")
    assert resposta.status_code == 503
    assert resposta.json()["erro"]["codigo"] == "AUTENTICACAO_INDISPONIVEL"


def teste_retorno_sem_estado_nao_autentica() -> None:
    resposta = consultar("/api/autenticacao/google/retorno?code=nao-confiavel")
    assert resposta.status_code == 400
    assert resposta.json()["erro"]["codigo"] == "RETORNO_INVALIDO"


class CatalogoDeSessoes:
    """Substituto do contrato; persistência e concorrência têm testes reais próprios."""

    def __init__(self):
        self.tentativas = {}
        self.sessoes = {}
        self.contas = {}

    async def guardar_tentativa(self, tentativa):
        self.tentativas[tentativa.estado_resumo] = tentativa

    async def consumir_tentativa(self, estado_resumo, navegador_resumo, agora):
        tentativa = self.tentativas.get(estado_resumo)
        if tentativa and tentativa.navegador_resumo == navegador_resumo:
            del self.tentativas[estado_resumo]
            if tentativa.expira_em > agora:
                return tentativa
        return None

    async def abrir_sessao(self, identidade, resumo, anterior, agora, expira_em):
        jogador_id = self.contas.setdefault(identidade.sujeito, uuid4())
        if anterior:
            self.sessoes.pop(anterior, None)
        self.sessoes[resumo] = ContaAutenticada(
            jogador_id, identidade.email, "cadastro_pendente", None, None, expira_em
        )

    async def consultar_sessao(self, resumo, agora):
        conta = self.sessoes.get(resumo)
        return conta if conta and conta.expira_em > agora else None

    async def revogar_sessao(self, resumo, agora):
        self.sessoes.pop(resumo, None)


class GoogleControlado:
    def __init__(self):
        self.chamadas = []
        self.falhar = False

    async def endereco_login(self, estado, nonce, verificador):
        self.chamadas.append((nonce, verificador))
        return f"https://accounts.google.com/o/oauth2/v2/auth?state={estado}"

    async def autenticar(self, codigo, nonce, verificador):
        assert (nonce, verificador) in self.chamadas
        assert codigo == "codigo-teste"
        if self.falhar:
            raise FalhaAutenticacao("PROVEDOR_INDISPONIVEL", "Tente novamente.", 503)
        return IdentidadeGoogle("sujeito-google-teste", "athos@example.test")


async def iniciar(cliente):
    resposta = await cliente.get("/api/autenticacao/google")
    assert resposta.status_code == 303
    assert "HttpOnly" in resposta.headers["set-cookie"]
    assert "SameSite=lax" in resposta.headers["set-cookie"]
    return parse_qs(urlparse(resposta.headers["location"]).query)["state"][0]


async def entrar(cliente):
    estado = await iniciar(cliente)
    resposta = await cliente.get(
        "/api/autenticacao/google/retorno", params={"state": estado, "code": "codigo-teste"}
    )
    assert resposta.status_code == 303
    assert resposta.headers["location"].startswith("http://localhost:5173/")
    assert "HttpOnly" in resposta.headers["set-cookie"]
    return (await cliente.get("/api/autenticacao/sessao")).json()


def executar_cenario(cenario):
    async def executar():
        banco = CatalogoDeSessoes()
        google = GoogleControlado()
        api = criar_aplicacao(
            Configuracoes(_env_file=None, ambiente="teste"),
            repositorio_autenticacao=banco,
            provedor_google=google,
        )
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
        ) as cliente:
            await cenario(cliente, banco, google)

    asyncio.run(executar())


def teste_login_retorna_conta_pendente_sem_identidade_google_e_sair_revoga():
    async def cenario(cliente, banco, google):
        conta = await entrar(cliente)
        assert conta["estado"] == "cadastro_pendente"
        assert conta["email"] == "athos@example.test"
        assert "google_sujeito" not in conta
        assert len(banco.sessoes) == 1
        cookie = cliente.cookies.get("decifra_sessao")
        assert cookie not in banco.sessoes
        resposta = await cliente.post(
            "/api/autenticacao/sair",
            headers={"Origin": "http://localhost:5173", "X-Decifra-CSRF": conta["token_csrf"]},
        )
        assert resposta.status_code == 204
        assert not banco.sessoes
        cliente.cookies.set("decifra_sessao", cookie)
        assert (await cliente.get("/api/autenticacao/sessao")).status_code == 401

    executar_cenario(cenario)


@pytest.mark.parametrize(
    "origem,token",
    [
        (None, None),
        ("https://invasor.example", "valido"),
        ("http://localhost:5173", "incorreto"),
        (None, "valido"),
    ],
)
def teste_saida_exige_origem_e_csrf(origem, token):
    async def cenario(cliente, banco, google):
        conta = await entrar(cliente)
        cabecalhos = {}
        if origem:
            cabecalhos["Origin"] = origem
        if token:
            cabecalhos["X-Decifra-CSRF"] = conta["token_csrf"] if token == "valido" else token
        resposta = await cliente.post("/api/autenticacao/sair", headers=cabecalhos)
        assert resposta.status_code == 403
        assert len(banco.sessoes) == 1

    executar_cenario(cenario)


def teste_estado_nao_pode_ser_reutilizado_nem_transferido_a_outro_navegador():
    async def cenario(cliente, banco, google):
        estado = await iniciar(cliente)
        cookie = cliente.cookies.get("decifra_login")
        cliente.cookies.clear()
        parametros = {"state": estado, "code": "codigo-teste"}
        assert (
            await cliente.get("/api/autenticacao/google/retorno", params=parametros)
        ).status_code == 400
        cliente.cookies.set("decifra_login", cookie)
        assert (
            await cliente.get("/api/autenticacao/google/retorno", params=parametros)
        ).status_code == 303
        cliente.cookies.set("decifra_login", cookie)
        assert (
            await cliente.get("/api/autenticacao/google/retorno", params=parametros)
        ).status_code == 400
        assert len(banco.sessoes) == 1

    executar_cenario(cenario)


def teste_cancelamento_e_falha_google_nao_criam_sessao():
    async def cenario(cliente, banco, google):
        estado = await iniciar(cliente)
        resposta = await cliente.get(
            "/api/autenticacao/google/retorno",
            params={
                "state": estado,
                "error": "access_denied",
                "error_description": "dado-nao-confiavel",
            },
        )
        assert resposta.status_code == 400
        assert resposta.json()["erro"]["codigo"] == "LOGIN_CANCELADO"
        assert "dado-nao-confiavel" not in resposta.text
        google.falhar = True
        estado = await iniciar(cliente)
        resposta = await cliente.get(
            "/api/autenticacao/google/retorno", params={"state": estado, "code": "codigo-teste"}
        )
        assert resposta.status_code == 503
        assert not banco.sessoes

    executar_cenario(cenario)


def teste_novo_login_rotaciona_sessao_e_mantem_conta():
    async def cenario(cliente, banco, google):
        primeira = await entrar(cliente)
        cookie_anterior = cliente.cookies.get("decifra_sessao")
        segunda = await entrar(cliente)
        assert segunda["jogador_id"] == primeira["jogador_id"]
        assert cliente.cookies.get("decifra_sessao") != cookie_anterior
        assert len(banco.sessoes) == 1

    executar_cenario(cenario)


def teste_sessao_expirada_e_tentativa_expirada_nao_autorizam():
    async def cenario(cliente, banco, google):
        from dataclasses import replace

        conta = await entrar(cliente)
        resumo = next(iter(banco.sessoes))
        banco.sessoes[resumo] = replace(
            banco.sessoes[resumo], expira_em=datetime.now(UTC) - timedelta(seconds=1)
        )
        assert (await cliente.get("/api/autenticacao/sessao")).status_code == 401
        estado = await iniciar(cliente)
        chave = next(iter(banco.tentativas))
        banco.tentativas[chave] = replace(
            banco.tentativas[chave], expira_em=datetime.now(UTC) - timedelta(seconds=1)
        )
        resposta = await cliente.get(
            "/api/autenticacao/google/retorno", params={"state": estado, "code": "codigo-teste"}
        )
        assert resposta.status_code == 400
        assert conta["jogador_id"]

    executar_cenario(cenario)


def teste_conta_pendente_nao_libera_operacao_de_jogo():
    async def executar():
        banco, google = CatalogoDeSessoes(), GoogleControlado()
        api = criar_aplicacao(
            Configuracoes(_env_file=None, ambiente="teste"),
            repositorio_autenticacao=banco,
            provedor_google=google,
        )

        @api.get("/protegida-apenas-no-teste")
        async def protegida(conta: Annotated[ContaAutenticada, Depends(exigir_conta_ativa)]):
            return {"jogador_id": str(conta.jogador_id)}

        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
        ) as cliente:
            assert (await cliente.get("/protegida-apenas-no-teste")).status_code == 401
            conta = await entrar(cliente)
            resposta = await cliente.get("/protegida-apenas-no-teste")
            assert resposta.status_code == 403
            assert resposta.json()["erro"]["codigo"] == "PERFIL_INCOMPLETO"
            from dataclasses import replace

            chave = next(iter(banco.sessoes))
            banco.sessoes[chave] = replace(banco.sessoes[chave], estado="ativo")
            resposta = await cliente.get("/protegida-apenas-no-teste?jogador_id=outro")
            assert resposta.json()["jogador_id"] == conta["jogador_id"]

    asyncio.run(executar())


def teste_https_protege_cookie_e_nao_usa_host_recebido_para_retorno():
    async def executar():
        banco, google = CatalogoDeSessoes(), GoogleControlado()
        origem = "https://decifra-teste.example"
        api = criar_aplicacao(
            Configuracoes(_env_file=None, ambiente="producao", origem_publica=origem),
            repositorio_autenticacao=banco,
            provedor_google=google,
        )
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api), base_url=origem
        ) as cliente:
            resposta = await cliente.get(
                "/api/autenticacao/google", headers={"X-Forwarded-Host": "invasor.example"}
            )
            estado = parse_qs(urlparse(resposta.headers["location"]).query)["state"][0]
            resposta = await cliente.get(
                "/api/autenticacao/google/retorno",
                params={
                    "state": estado,
                    "code": "codigo-teste",
                },
                headers={"X-Forwarded-Host": "invasor.example"},
            )
            assert resposta.status_code == 303
            assert resposta.headers["location"].startswith(origem + "/")
            cookies = resposta.headers.get_list("set-cookie")
            assert any("__Host-decifra_sessao=" in valor for valor in cookies)
            assert all(
                "Secure" in valor and "HttpOnly" in valor and "Path=/" in valor for valor in cookies
            )
            assert all("Domain=" not in valor for valor in cookies)
            assert resposta.headers["cache-control"] == "no-store"
            assert resposta.headers["referrer-policy"] == "no-referrer"

    asyncio.run(executar())


@pytest.mark.parametrize(
    "origem",
    [
        "http://publico.example",
        "https://site.example/caminho",
        "https://usuario:senha@site.example",
        "https://site.example?x=1",
    ],
)
def teste_rejeita_origem_publica_insegura_ou_com_caminho(origem):
    with pytest.raises(ValidationError):
        Configuracoes(_env_file=None, origem_publica=origem)


def teste_producao_exige_https():
    with pytest.raises(ValidationError):
        Configuracoes(_env_file=None, ambiente="producao")
