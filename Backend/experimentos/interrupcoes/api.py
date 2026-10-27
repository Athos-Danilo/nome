"""Servidor local de prova: não importar na aplicação, não publicar como API do jogo."""

from time import monotonic
from typing import Literal
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict

from experimentos.interrupcoes.modelo import ProvaInterrupcoes


class CriacaoProva(BaseModel):
    model_config = ConfigDict(extra="forbid")
    modo: Literal["individual", "galera"]


class ConexaoProva(BaseModel):
    model_config = ConfigDict(extra="forbid")
    aba_id: UUID
    documento_id: UUID
    navegacao: Literal["navigate", "reload", "back_forward", "prerender", "desconhecida"]


class SinalProva(BaseModel):
    model_config = ConfigDict(extra="forbid")
    documento_id: UUID
    tipo: Literal["atividade", "pagehide", "pageshow", "offline", "online", "oculta", "visivel"]
    persistido: bool = False


class AcaoProva(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id_acao: UUID
    tipo: Literal["pausar", "retomar", "encerrar", "sair"]


def criar_prova_api() -> FastAPI:
    api = FastAPI(title="Prova local de interrupções — sem dados reais")
    provas: dict[UUID, ProvaInterrupcoes] = {}

    def obter(identificador: UUID) -> ProvaInterrupcoes:
        if identificador not in provas:
            raise HTTPException(404, "Prova não encontrada; o servidor pode ter sido reiniciado.")
        return provas[identificador]

    @api.post("/prova-api/experimentos", status_code=201)
    async def criar(entrada: CriacaoProva) -> dict:
        if len(provas) >= 200:
            raise HTTPException(
                409, "Limite da prova local atingido; reinicie o servidor de testes."
            )
        identificador = uuid4()
        provas[identificador] = ProvaInterrupcoes(entrada.modo)
        return {"id": str(identificador)}

    @api.get("/prova-api/experimentos/{identificador}")
    async def consultar(identificador: UUID) -> dict:
        return obter(identificador).consultar(monotonic())

    @api.post("/prova-api/experimentos/{identificador}/conexao")
    async def conectar(identificador: UUID, entrada: ConexaoProva) -> dict:
        prova = obter(identificador)
        try:
            prova.conectar(entrada.aba_id, entrada.documento_id, entrada.navegacao, monotonic())
        except ValueError as falha:
            raise HTTPException(409, str(falha)) from falha
        return prova.consultar(monotonic())

    @api.post("/prova-api/experimentos/{identificador}/sinais")
    async def sinalizar(identificador: UUID, entrada: SinalProva) -> dict:
        prova = obter(identificador)
        prova.sinal(entrada.documento_id, entrada.tipo, monotonic(), entrada.persistido)
        return prova.consultar(monotonic())

    @api.post("/prova-api/experimentos/{identificador}/acoes")
    async def agir(identificador: UUID, entrada: AcaoProva) -> dict:
        prova = obter(identificador)
        try:
            prova.agir(entrada.id_acao, entrada.tipo, monotonic())
        except ValueError as falha:
            raise HTTPException(409, str(falha)) from falha
        return prova.consultar(monotonic())

    return api


aplicacao = criar_prova_api()
