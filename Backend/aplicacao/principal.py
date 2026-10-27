"""Entrada da API. Os módulos de negócio serão adicionados nas fases próprias."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from aplicacao.nucleo.configuracoes import Configuracoes


class EstadoDaApi(BaseModel):
    """Disponibilidade do processo HTTP, sem presumir conexão com os bancos."""

    nome: str = "Decifra"
    situacao: str = "disponivel"


def criar_aplicacao(configuracoes: Configuracoes | None = None) -> FastAPI:
    configuracoes = configuracoes or Configuracoes()
    api = FastAPI(title="Decifra", version="0.1.0")
    api.add_middleware(
        CORSMiddleware,
        allow_origins=configuracoes.origens_permitidas,
        allow_credentials=True,
        allow_methods=["GET"],
        allow_headers=["Content-Type"],
    )

    @api.get("/api/saude", response_model=EstadoDaApi, tags=["Infraestrutura"])
    def consultar_saude() -> EstadoDaApi:
        return EstadoDaApi()

    return api


aplicacao = criar_aplicacao()
