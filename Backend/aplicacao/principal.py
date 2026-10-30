"""Entrada da API. Os módulos de negócio serão adicionados nas fases próprias."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import create_async_engine

from aplicacao.modulos.acompanhamento.repositorio import AcompanhamentoPostgresql
from aplicacao.modulos.acompanhamento.rotas import rotas as rotas_acompanhamento
from aplicacao.modulos.acompanhamento.servico import ServicoEstatisticas
from aplicacao.modulos.autenticacao.contratos import (
    FalhaAutenticacao,
    ProvedorGoogle,
    RepositorioAutenticacao,
)
from aplicacao.modulos.autenticacao.google import GoogleOIDC
from aplicacao.modulos.autenticacao.repositorio import AutenticacaoPostgresql
from aplicacao.modulos.autenticacao.rotas import nome_cookie, rotas
from aplicacao.modulos.autenticacao.servico import ServicoAutenticacao
from aplicacao.modulos.demonstracoes.catalogo import SorteioMongo
from aplicacao.modulos.demonstracoes.repositorio import DemonstracoesPostgresql
from aplicacao.modulos.demonstracoes.rotas import rotas as rotas_demonstracoes
from aplicacao.modulos.demonstracoes.servico import ServicoDemonstracoes
from aplicacao.modulos.galera.repositorio import GaleraPostgresql
from aplicacao.modulos.galera.rotas import rotas as rotas_galera
from aplicacao.modulos.galera.servico import ServicoGalera
from aplicacao.modulos.individual.catalogo import CatalogoIndividualMongo
from aplicacao.modulos.individual.repositorio import IndividualPostgresql
from aplicacao.modulos.individual.rotas import rotas as rotas_individual
from aplicacao.modulos.individual.servico import ServicoIndividual
from aplicacao.modulos.jogadores.repositorio import JogadoresPostgresql
from aplicacao.modulos.jogadores.rotas import rotas as rotas_jogadores
from aplicacao.modulos.jogadores.servico import ServicoJogadores
from aplicacao.nucleo.configuracoes import PASTA_BACKEND, Configuracoes


class EstadoDaApi(BaseModel):
    """Disponibilidade do processo HTTP, sem presumir conexão com os bancos."""

    nome: str = "Decifra"
    situacao: str = "disponivel"


def criar_aplicacao(
    configuracoes: Configuracoes | None = None,
    *,
    repositorio_autenticacao: RepositorioAutenticacao | None = None,
    provedor_google: ProvedorGoogle | None = None,
) -> FastAPI:
    configuracoes = configuracoes or Configuracoes()
    if (
        provedor_google is None
        and configuracoes.google_cliente_id
        and configuracoes.google_cliente_segredo
    ):
        provedor_google = GoogleOIDC(configuracoes)
    motor = None
    if repositorio_autenticacao is None and configuracoes.postgresql_url is not None:
        endereco = make_url(configuracoes.postgresql_url.get_secret_value())
        if endereco.drivername not in {"postgresql", "postgresql+psycopg"}:
            raise ValueError("A autenticação exige PostgreSQL com Psycopg 3.")
        motor = create_async_engine(
            endereco.set(drivername="postgresql+psycopg"), pool_pre_ping=True, hide_parameters=True
        )
        repositorio_autenticacao = AutenticacaoPostgresql(motor)

    @asynccontextmanager
    async def ciclo_de_vida(api: FastAPI):
        try:
            yield
        finally:
            if motor is not None:
                await motor.dispose()

    api = FastAPI(title="Decifra", version="0.1.0", lifespan=ciclo_de_vida)
    api.state.configuracoes = configuracoes
    api.state.jogadores = (
        ServicoJogadores(JogadoresPostgresql(motor)) if motor is not None else None
    )
    api.state.autenticacao = (
        ServicoAutenticacao(repositorio_autenticacao, provedor_google, configuracoes.sessao_dias)
        if repositorio_autenticacao is not None and provedor_google is not None
        else None
    )
    api.state.demonstracoes = (
        ServicoDemonstracoes(DemonstracoesPostgresql(motor), SorteioMongo(configuracoes).sortear)
        if motor is not None
        else None
    )
    api.state.individual = (
        ServicoIndividual(IndividualPostgresql(motor), CatalogoIndividualMongo(configuracoes))
        if motor is not None
        else None
    )

    api.state.galera = (
        ServicoGalera(GaleraPostgresql(motor), api.state.individual.catalogo)
        if motor is not None
        else None
    )
    api.state.consultas_acompanhamento = AcompanhamentoPostgresql(motor) if motor else None
    api.state.acompanhamento = (
        ServicoEstatisticas(api.state.consultas_acompanhamento, api.state.individual.catalogo)
        if motor
        else None
    )

    @api.exception_handler(FalhaAutenticacao)
    async def tratar_autenticacao(requisicao: Request, falha: FalhaAutenticacao):
        resposta = JSONResponse(
            {"erro": {"codigo": falha.codigo, "mensagem": falha.mensagem}},
            status_code=falha.situacao,
        )
        if requisicao.url.path.endswith("/google/retorno"):
            resposta.delete_cookie(
                nome_cookie(requisicao, "login"),
                path="/",
                secure=configuracoes.cookie_seguro,
                httponly=True,
                samesite="lax",
            )
        return resposta

    @api.exception_handler(SQLAlchemyError)
    async def tratar_indisponibilidade(requisicao: Request, falha: SQLAlchemyError):
        return JSONResponse(
            {
                "erro": {
                    "codigo": "DADOS_INDISPONIVEIS",
                    "mensagem": "Não foi possível acessar seus dados. Tente novamente.",
                }
            },
            status_code=503,
        )

    @api.middleware("http")
    async def proteger_respostas_autenticacao(requisicao: Request, proxima):
        resposta = await proxima(requisicao)
        if requisicao.url.path.startswith(
            ("/api/autenticacao", "/api/partidas")
        ) or requisicao.url.path in {
            "/api/perfil",
            "/api/historico",
            "/api/estatisticas",
            "/api/preferencias",
            "/api/visitantes",
            "/api/demonstracoes",
            "/api/demonstracoes/atual",
            "/api/demonstracoes/vinculo",
        }:
            resposta.headers["Cache-Control"] = "no-store"
            resposta.headers["Referrer-Policy"] = "no-referrer"
        return resposta

    api.include_router(rotas)
    api.include_router(rotas_jogadores)
    api.include_router(rotas_demonstracoes)
    api.include_router(rotas_galera)
    api.include_router(rotas_individual)
    api.include_router(rotas_acompanhamento)
    api.mount(
        "/api/avatares/recursos",
        StaticFiles(directory=PASTA_BACKEND / "recursos/avatares"),
        name="avatares",
    )

    @api.exception_handler(RequestValidationError)
    async def tratar_entrada_invalida(requisicao: Request, falha: RequestValidationError):
        codigo = (
            "CONFIRMACAO_INVALIDA"
            if requisicao.method == "DELETE" and requisicao.url.path == "/api/perfil"
            else "DADOS_INVALIDOS"
        )
        mensagem = (
            "Digite EXCLUIR para confirmar."
            if codigo == "CONFIRMACAO_INVALIDA"
            else "Confira os campos informados e tente novamente."
        )
        return JSONResponse({"erro": {"codigo": codigo, "mensagem": mensagem}}, status_code=422)

    api.add_middleware(
        CORSMiddleware,
        allow_origins=configuracoes.origens_permitidas,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
        allow_headers=["Content-Type", "X-Decifra-CSRF"],
    )

    @api.get("/api/saude", response_model=EstadoDaApi, tags=["Infraestrutura"])
    def consultar_saude() -> EstadoDaApi:
        return EstadoDaApi()

    return api


aplicacao = criar_aplicacao()
