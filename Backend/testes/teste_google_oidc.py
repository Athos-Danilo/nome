"""Assinaturas e claims OIDC reais com rede e chaves Google controladas."""

import asyncio
import time
from urllib.parse import parse_qs, urlparse

import httpx
import pytest
from joserfc import jwt
from joserfc.jwk import RSAKey
from pydantic import SecretStr

from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.autenticacao.google import GoogleOIDC
from aplicacao.nucleo.configuracoes import Configuracoes


@pytest.fixture(scope="module")
def chave():
    return RSAKey.generate_key(2048, parameters={"kid": "chave-teste"})


def criar_provedor(chave, alterar=None, assinar_com=None, erro_rede=False):
    agora = int(time.time())
    claims = {
        "iss": "https://accounts.google.com",
        "sub": "123456",
        "aud": "cliente-teste",
        "iat": agora,
        "exp": agora + 300,
        "nonce": "nonce-teste",
        "email": "athos@example.test",
        "email_verified": True,
    }
    claims.update(alterar or {})
    for campo in [campo for campo, valor in claims.items() if valor is None]:
        del claims[campo]
    assinado = jwt.encode({"alg": "RS256", "kid": "chave-teste"}, claims, assinar_com or chave)
    chamadas = []

    def responder(requisicao):
        chamadas.append(requisicao)
        if erro_rede:
            raise httpx.ConnectError("endereco-privado-nao-deve-vazar", request=requisicao)
        if requisicao.url.path == "/.well-known/openid-configuration":
            return httpx.Response(
                200,
                json={
                    "issuer": "https://accounts.google.com",
                    "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
                    "token_endpoint": "https://oauth2.googleapis.com/token",
                    "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
                    "id_token_signing_alg_values_supported": ["RS256"],
                },
            )
        if requisicao.url.path == "/token":
            dados = parse_qs(requisicao.content.decode())
            assert dados["code_verifier"] == ["v" * 64]
            assert dados["redirect_uri"] == [
                "http://localhost:5173/api/autenticacao/google/retorno"
            ]
            return httpx.Response(
                200,
                json={
                    "access_token": "acesso-descartavel",
                    "token_type": "Bearer",
                    "id_token": assinado,
                },
            )
        assert requisicao.url.path == "/oauth2/v3/certs"
        return httpx.Response(200, json={"keys": [chave.as_dict(private=False)]})

    provedor = GoogleOIDC(
        Configuracoes(
            _env_file=None,
            google_cliente_id="cliente-teste",
            google_cliente_segredo=SecretStr("ficticio"),
        ),
        transporte=httpx.MockTransport(responder),
    )
    return provedor, chamadas


def teste_autorizacao_tem_estado_nonce_pkce_e_retorno_fixo(chave):
    provedor, _ = criar_provedor(chave)
    endereco = asyncio.run(provedor.endereco_login("estado-teste", "nonce-teste", "v" * 64))
    parametros = parse_qs(urlparse(endereco).query)
    assert parametros["state"] == ["estado-teste"]
    assert parametros["nonce"] == ["nonce-teste"]
    assert parametros["code_challenge_method"] == ["S256"]
    assert parametros["response_type"] == ["code"]
    assert set(parametros["scope"][0].split()) == {"openid", "email"}
    assert "code_verifier" not in parametros


def teste_assinatura_e_identidade_google_validas(chave):
    provedor, chamadas = criar_provedor(chave)
    identidade = asyncio.run(provedor.autenticar("codigo-teste", "nonce-teste", "v" * 64))
    assert identidade.sujeito == "123456"
    assert identidade.email == "athos@example.test"
    assert len(chamadas) == 3


@pytest.mark.parametrize(
    "alterar",
    [
        {"iss": "https://invasor.example"},
        {"aud": "outro-cliente"},
        {"nonce": "outra"},
        {"exp": 1},
        {"iat": int(time.time()) + 3600},
        {"nonce": None},
        {"sub": ""},
        {"email_verified": False},
        {"email_verified": "true"},
        {"email": None},
        {"azp": "outro-cliente"},
        {"sub": "a" * 256},
        {"email": "invalido"},
    ],
)
def teste_claim_invalida_nao_produz_identidade(chave, alterar):
    provedor, _ = criar_provedor(chave, alterar)
    with pytest.raises(FalhaAutenticacao) as falha:
        asyncio.run(provedor.autenticar("codigo-teste", "nonce-teste", "v" * 64))
    assert falha.value.codigo == "IDENTIDADE_INVALIDA"


def teste_assinatura_de_outra_chave_e_rede_indisponivel(chave):
    provedor, _ = criar_provedor(chave, assinar_com=RSAKey.generate_key(2048))
    with pytest.raises(FalhaAutenticacao) as falha:
        asyncio.run(provedor.autenticar("codigo-teste", "nonce-teste", "v" * 64))
    assert falha.value.codigo == "IDENTIDADE_INVALIDA"
    provedor, _ = criar_provedor(chave, erro_rede=True)
    with pytest.raises(FalhaAutenticacao) as falha:
        asyncio.run(provedor.endereco_login("estado", "nonce", "v" * 64))
    assert falha.value.codigo == "PROVEDOR_INDISPONIVEL"
    assert "privado" not in str(falha.value)
