"""Operações individuais autorizadas pela conta ativa da sessão."""

from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request

from aplicacao.modulos.autenticacao.contratos import ContaAutenticada, FalhaAutenticacao
from aplicacao.modulos.autenticacao.rotas import exigir_conta_ativa
from aplicacao.modulos.individual.esquemas import (
    AcaoIndividual,
    AcaoRodada,
    ConectarIndividual,
    ConfiguracaoIndividual,
    EnviarPalpite,
    IniciarIndividual,
    SalvarRascunho,
    SalvarTempo,
    SinalIndividual,
)
from aplicacao.modulos.individual.servico import ServicoIndividual

rotas = APIRouter(prefix="/api/partidas", tags=["Individual"])
Titular = Annotated[ContaAutenticada, Depends(exigir_conta_ativa)]


def servico(requisicao: Request) -> ServicoIndividual:
    instancia = requisicao.app.state.individual
    if instancia is None:
        raise FalhaAutenticacao(
            "DADOS_INDISPONIVEIS", "O jogo está indisponível. Tente novamente.", 503
        )
    return instancia


@rotas.post("/individual/configuracao")
async def preparar(dados: ConfiguracaoIndividual, requisicao: Request, conta: Titular):
    return await servico(requisicao).preparar(conta.jogador_id, dados)


@rotas.post("/individual")
async def iniciar(dados: IniciarIndividual, requisicao: Request, conta: Titular):
    return await servico(requisicao).iniciar(conta.jogador_id, dados.plano_id)


@rotas.get("/em-aberto")
async def em_aberto(requisicao: Request, conta: Titular):
    return await servico(requisicao).em_aberto(conta.jogador_id)


@rotas.get("/{partida_id}")
async def consultar(partida_id: UUID, requisicao: Request, conta: Titular):
    return await servico(requisicao).consultar(conta.jogador_id, partida_id)


@rotas.post("/{partida_id}/palpites")
async def enviar_palpite(
    partida_id: UUID, dados: EnviarPalpite, requisicao: Request, conta: Titular
):
    return await servico(requisicao).agir(conta.jogador_id, partida_id, "palpites", dados)


@rotas.post("/{partida_id}/dicas")
async def pedir_dica(partida_id: UUID, dados: AcaoRodada, requisicao: Request, conta: Titular):
    return await servico(requisicao).agir(conta.jogador_id, partida_id, "dicas", dados)


@rotas.post("/{partida_id}/desistencia-palavra")
async def desistir_palavra(
    partida_id: UUID, dados: AcaoRodada, requisicao: Request, conta: Titular
):
    return await servico(requisicao).agir(
        conta.jogador_id, partida_id, "desistencia-palavra", dados
    )


@rotas.post("/{partida_id}/encerramento")
async def encerrar(partida_id: UUID, dados: AcaoIndividual, requisicao: Request, conta: Titular):
    return await servico(requisicao).agir(conta.jogador_id, partida_id, "encerramento", dados)


@rotas.post("/{partida_id}/pausa")
async def pausa_individual(
    partida_id: UUID, dados: AcaoIndividual, requisicao: Request, conta: Titular
):
    return await servico(requisicao).agir(conta.jogador_id, partida_id, "pausa", dados)


@rotas.post("/{partida_id}/retomada")
async def retomada_individual(
    partida_id: UUID, dados: AcaoIndividual, requisicao: Request, conta: Titular
):
    return await servico(requisicao).agir(conta.jogador_id, partida_id, "retomada", dados)


@rotas.post("/{partida_id}/saida")
async def saida_individual(
    partida_id: UUID, dados: AcaoIndividual, requisicao: Request, conta: Titular
):
    return await servico(requisicao).agir(conta.jogador_id, partida_id, "saida", dados)


@rotas.post("/{partida_id}/rascunho")
async def rascunho_individual(
    partida_id: UUID, dados: SalvarRascunho, requisicao: Request, conta: Titular
):
    return await servico(requisicao).continuidade(conta.jogador_id, partida_id, "rascunho", dados)


@rotas.post("/{partida_id}/conexoes")
async def conexoes_individual(
    partida_id: UUID, dados: ConectarIndividual, requisicao: Request, conta: Titular
):
    return await servico(requisicao).continuidade(conta.jogador_id, partida_id, "conexoes", dados)


@rotas.post("/{partida_id}/sinais")
async def sinais_individual(
    partida_id: UUID, dados: SinalIndividual, requisicao: Request, conta: Titular
):
    return await servico(requisicao).continuidade(conta.jogador_id, partida_id, "sinais", dados)


@rotas.post("/{partida_id}/tempo")
async def tempo_individual(
    partida_id: UUID, dados: SalvarTempo, requisicao: Request, conta: Titular
):
    return await servico(requisicao).continuidade(conta.jogador_id, partida_id, "tempo", dados)


@rotas.get("/{partida_id}/tempo")
async def sincronizar_tempo(partida_id: UUID, requisicao: Request, conta: Titular):
    estado = await servico(requisicao).consultar(conta.jogador_id, partida_id)
    return {**estado, "relogio_servidor_ms": int(datetime.now(UTC).timestamp() * 1000)}
