"""Configuração sem segredos obrigatórios nesta etapa de infraestrutura."""

from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PASTA_BACKEND = Path(__file__).resolve().parents[2]


class Configuracoes(BaseSettings):
    """Ambiente de execução; os valores privados nunca são devolvidos pela API."""

    model_config = SettingsConfigDict(
        env_prefix="DECIFRA_", env_file=PASTA_BACKEND / ".env", extra="ignore"
    )
    ambiente: Literal["desenvolvimento", "teste", "producao"] = "desenvolvimento"
    postgresql_url: SecretStr | None = None
    mongodb_url: SecretStr = SecretStr("mongodb://127.0.0.1:27017")
    mongodb_banco: str = "decifra"
    origens_permitidas: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    origem_publica: str = "http://localhost:5173"
    google_cliente_id: str | None = None
    google_cliente_segredo: SecretStr | None = None
    sessao_dias: int = Field(default=7, ge=1, le=30)

    @model_validator(mode="after")
    def validar_origem_publica(self):
        origem = urlsplit(self.origem_publica)
        if (
            origem.scheme not in {"http", "https"}
            or not origem.hostname
            or origem.username
            or origem.password
            or origem.query
            or origem.fragment
            or origem.path not in {"", "/"}
        ):
            raise ValueError("A origem pública deve conter somente protocolo, endereço e porta.")
        if origem.scheme == "http" and origem.hostname not in {"localhost", "127.0.0.1", "::1"}:
            raise ValueError("HTTP só é permitido no ambiente local.")
        if self.ambiente == "producao" and origem.scheme != "https":
            raise ValueError("O ambiente de produção exige uma origem pública HTTPS.")
        self.origem_publica = self.origem_publica.rstrip("/")
        return self

    @property
    def retorno_google(self) -> str:
        return f"{self.origem_publica}/api/autenticacao/google/retorno"

    @property
    def cookie_seguro(self) -> bool:
        return self.origem_publica.startswith("https://")
