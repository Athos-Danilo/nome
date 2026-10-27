"""Configuração sem segredos obrigatórios nesta etapa de infraestrutura."""

from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

PASTA_BACKEND = Path(__file__).resolve().parents[2]


class Configuracoes(BaseSettings):
    """Ambiente de execução; os valores privados nunca são devolvidos pela API."""

    model_config = SettingsConfigDict(
        env_prefix="DECIFRA_", env_file=PASTA_BACKEND / ".env", extra="ignore"
    )
    ambiente: Literal["desenvolvimento", "teste", "producao"] = "desenvolvimento"
    origens_permitidas: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
