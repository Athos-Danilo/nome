"""Adaptador OIDC do Google; detalhes OAuth permanecem fora dos casos de uso."""

import httpx
from authlib.integrations.base_client import OAuthError
from authlib.integrations.starlette_client import OAuth
from joserfc.errors import JoseError

from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao, IdentidadeGoogle
from aplicacao.nucleo.configuracoes import Configuracoes


class GoogleOIDC:
    def __init__(self, configuracoes: Configuracoes, *, transporte=None) -> None:
        self.retorno = configuracoes.retorno_google
        self.cliente = OAuth().register(
            "google",
            client_id=configuracoes.google_cliente_id,
            client_secret=configuracoes.google_cliente_segredo.get_secret_value(),
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={
                "scope": "openid email",
                "code_challenge_method": "S256",
                "timeout": httpx.Timeout(10),
                "transport": transporte,
            },
        )

    async def endereco_login(self, estado: str, nonce: str, verificador: str) -> str:
        try:
            dados = await self.cliente.create_authorization_url(
                self.retorno,
                state=estado,
                nonce=nonce,
                code_verifier=verificador,
                prompt="select_account",
            )
            return dados["url"]
        except (httpx.HTTPError, OAuthError, ValueError, KeyError) as falha:
            raise FalhaAutenticacao(
                "PROVEDOR_INDISPONIVEL", "O Google está indisponível. Tente novamente.", 503
            ) from falha

    async def autenticar(self, codigo: str, nonce: str, verificador: str) -> IdentidadeGoogle:
        try:
            token = await self.cliente.fetch_access_token(
                self.retorno,
                code=codigo,
                code_verifier=verificador,
            )
            dados = await self.cliente.parse_id_token(
                token,
                nonce=nonce,
                leeway=30,
                claims_options={
                    "iss": {
                        "essential": True,
                        "values": ["https://accounts.google.com", "accounts.google.com"],
                    }
                },
            )
            if dados is None or dados.get("email_verified") is not True:
                raise ValueError("Identidade não verificada.")
            sujeito, email = dados.get("sub"), dados.get("email")
            if not isinstance(sujeito, str) or not 1 <= len(sujeito) <= 255:
                raise ValueError("Identificador inválido.")
            if (
                not isinstance(email, str)
                or not 3 <= len(email) <= 320
                or email.count("@") != 1
                or email.startswith("@")
                or email.endswith("@")
                or any(caractere.isspace() or ord(caractere) < 32 for caractere in email)
            ):
                raise ValueError("E-mail inválido.")
            return IdentidadeGoogle(sujeito, email)
        except httpx.HTTPError as falha:
            raise FalhaAutenticacao(
                "PROVEDOR_INDISPONIVEL", "O Google está indisponível. Tente novamente.", 503
            ) from falha
        except (OAuthError, JoseError, ValueError, KeyError, TypeError) as falha:
            raise FalhaAutenticacao(
                "IDENTIDADE_INVALIDA", "Não foi possível confirmar sua identidade Google.", 400
            ) from falha
