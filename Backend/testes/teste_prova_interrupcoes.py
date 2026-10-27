"""Estados da prova com relógio controlado; não representam pontos do jogo real."""

import asyncio
from uuid import uuid4

import httpx
import pytest

from aplicacao.principal import criar_aplicacao
from experimentos.interrupcoes.api import criar_prova_api
from experimentos.interrupcoes.modelo import ProvaInterrupcoes


@pytest.mark.parametrize("tempo", [1, 11, 1000])
def teste_recarga_declarada_na_mesma_aba_nao_desconta_mesmo_lenta(tempo: float) -> None:
    prova = ProvaInterrupcoes("individual")
    aba, documento = uuid4(), uuid4()
    prova.conectar(aba, documento, "navigate", 0)
    prova.sinal(documento, "pagehide", 0.5)
    prova.conectar(aba, uuid4(), "reload", tempo)
    assert prova.saldo_simulado == 300
    assert prova.interrupcao_id is None
    assert prova.classificacao == "recarga_declarada"


def teste_ausencia_repete_uma_unica_interrupcao_sem_pontuar_automaticamente() -> None:
    prova = ProvaInterrupcoes("individual")
    prova.conectar(uuid4(), uuid4(), "navigate", 0)
    primeira = prova.consultar(12)["interrupcao_id"]
    assert primeira
    assert prova.consultar(50)["interrupcao_id"] == primeira
    assert prova.saldo_simulado == 300
    assert len([evento for evento in prova.eventos if evento["tipo"] == "interrupcao_aberta"]) == 1


def teste_reenvio_e_recarga_apos_pausa_nao_duplicam_desconto() -> None:
    prova = ProvaInterrupcoes("individual")
    aba = uuid4()
    prova.conectar(aba, uuid4(), "navigate", 0)
    acao = uuid4()
    prova.agir(acao, "pausar", 1)
    prova.agir(acao, "pausar", 2)
    prova.conectar(aba, uuid4(), "reload", 3)
    prova.agir(uuid4(), "pausar", 4)
    assert prova.saldo_simulado == 200 and prova.pausas_simuladas == 1
    prova.agir(uuid4(), "retomar", 5)
    prova.agir(uuid4(), "pausar", 6)
    assert prova.saldo_simulado == 100 and prova.pausas_simuladas == 2


def teste_beacon_atrasado_do_documento_anterior_nao_abre_outra_interrupcao() -> None:
    prova = ProvaInterrupcoes("individual")
    aba, documento = uuid4(), uuid4()
    prova.conectar(aba, documento, "navigate", 0)
    prova.conectar(aba, uuid4(), "reload", 1)
    prova.sinal(documento, "pagehide", 2)
    assert prova.interrupcao_id is None
    assert prova.eventos[-1]["tipo"] == "sinal_atrasado_ignorado"


@pytest.mark.parametrize("sinal", ["offline", "online", "oculta", "visivel"])
def teste_sinal_de_rede_ou_visibilidade_nao_e_penalidade(sinal: str) -> None:
    prova = ProvaInterrupcoes("individual")
    documento = uuid4()
    prova.conectar(uuid4(), documento, "navigate", 0)
    prova.sinal(documento, sinal, 2)
    assert prova.saldo_simulado == 300 and prova.interrupcao_id is None


def teste_retorno_apos_suspensao_gera_apuracao_sem_inventar_causa() -> None:
    prova = ProvaInterrupcoes("galera")
    documento = uuid4()
    prova.conectar(uuid4(), documento, "navigate", 0)
    prova.sinal(documento, "atividade", 120)
    assert prova.interrupcao_id and prova.classificacao == "em_apuracao"
    assert prova.estado == "ativa" and prova.saldo_simulado == 300


def teste_reabertura_com_identidade_restaurada_pode_imitar_reload() -> None:
    prova = ProvaInterrupcoes("individual")
    aba = uuid4()
    prova.conectar(aba, uuid4(), "navigate", 0)
    # O servidor só recebe os sinais: a restauração pode apresentar os mesmos valores.
    prova.conectar(aba, uuid4(), "reload", 60)
    assert prova.classificacao == "recarga_declarada"
    assert prova.saldo_simulado == 300


def teste_nova_aba_nao_prova_se_houve_fechamento_ou_duplicacao() -> None:
    prova = ProvaInterrupcoes("galera")
    prova.conectar(uuid4(), uuid4(), "navigate", 0)
    prova.conectar(uuid4(), uuid4(), "navigate", 1)
    assert prova.classificacao == "retorno_ambiguo" and prova.interrupcao_id
    assert prova.estado == "ativa"


@pytest.mark.parametrize("modo", ["individual", "galera"])
@pytest.mark.parametrize("cache", [True, False])
def teste_saida_pelo_historico_tem_efeito_unico_por_modo(modo: str, cache: bool) -> None:
    prova = ProvaInterrupcoes(modo)
    aba, documento = uuid4(), uuid4()
    prova.conectar(aba, documento, "navigate", 0)
    if cache:
        prova.sinal(documento, "pagehide", 1, persistido=True)
        prova.sinal(documento, "pageshow", 2, persistido=True)
        prova.sinal(documento, "pageshow", 3, persistido=True)
    else:
        novo = uuid4()
        prova.conectar(aba, novo, "back_forward", 2)
        prova.conectar(aba, novo, "back_forward", 3)
    assert prova.saldo_simulado == (200 if modo == "individual" else 300)
    assert prova.estado == ("pausada" if modo == "individual" else "encerrada")


def teste_galera_rejeita_pausa_e_encerramento_nao_desconta() -> None:
    prova = ProvaInterrupcoes("galera")
    with pytest.raises(ValueError):
        prova.agir(uuid4(), "pausar", 1)
    prova.agir(uuid4(), "encerrar", 2)
    assert prova.estado == "encerrada" and prova.saldo_simulado == 300
    prova.conectar(uuid4(), uuid4(), "reload", 3)
    assert prova.estado == "encerrada"
    with pytest.raises(ValueError):
        prova.agir(uuid4(), "retomar", 4)


def teste_rotas_experimentais_nao_estao_na_api_principal() -> None:
    caminhos = {rota.path for rota in criar_aplicacao().routes}
    assert not any(caminho.startswith("/prova-api") for caminho in caminhos)


def teste_prova_http_valida_campos_e_reenvio_sem_expor_dados_reais() -> None:
    async def verificar() -> None:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=criar_prova_api()), base_url="http://testserver"
        ) as cliente:
            resposta = await cliente.post("/prova-api/experimentos", json={"modo": "individual"})
            caminho = f"/prova-api/experimentos/{resposta.json()['id']}"
            acao = {"id_acao": str(uuid4()), "tipo": "pausar"}
            primeira = await cliente.post(f"{caminho}/acoes", json=acao)
            segunda = await cliente.post(f"{caminho}/acoes", json=acao)
            assert primeira.json()["saldo_simulado"] == segunda.json()["saldo_simulado"] == 200
            invalida = await cliente.post(f"{caminho}/sinais", json={"tipo": "inventado"})
            assert invalida.status_code == 422

    asyncio.run(verificar())
