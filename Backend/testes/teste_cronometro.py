"""Medição informativa em banco isolado, sem mudar a pontuação."""

from datetime import UTC, datetime
from uuid import uuid4

from testes.teste_individual import agir, ambiente, iniciar
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401


def teste_intervalos_sobrepostos_reenvio_pausa_resultado_e_legado(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            assert estado["rodada_atual"]["tempo_ativo_ms"] is None
            agora = int(datetime.now(UTC).timestamp() * 1000)
            url = f"/api/partidas/{estado['partida_id']}/tempo"
            corpo = {
                "rodada_id": estado["rodada_atual"]["rodada_id"],
                "inicio_ms": agora - 6000,
                "fim_ms": agora - 3000,
            }
            resposta = await cliente.post(url, json=corpo)
            assert resposta.status_code == 200, resposta.text
            assert resposta.json()["rodada_atual"]["tempo_ativo_ms"] == 3000
            assert (await cliente.post(url, json=corpo)).json()["rodada_atual"][
                "tempo_ativo_ms"
            ] == 3000
            estado = (
                await cliente.post(
                    url, json={**corpo, "inicio_ms": agora - 4000, "fim_ms": agora - 1000}
                )
            ).json()
            assert estado["rodada_atual"]["tempo_ativo_ms"] == 5000
            assert estado["pontuacao"] == 0
            assert (
                await cliente.post(url, json={**corpo, "fim_ms": agora + 60000})
            ).status_code == 422
            assert (
                await cliente.post(url, json={**corpo, "rodada_id": str(uuid4())})
            ).status_code == 409
            pausa = (
                await cliente.post(
                    url.removesuffix("/tempo") + "/pausa",
                    json={"id_acao": str(uuid4()), "versao_esperada": estado["versao"]},
                )
            ).json()
            assert pausa["pontuacao"] == -100
            assert (await cliente.post(url, json=corpo)).status_code == 409
            estado = (
                await cliente.post(
                    url.removesuffix("/tempo") + "/retomada",
                    json={"id_acao": str(uuid4()), "versao_esperada": pausa["versao"]},
                )
            ).json()
            assert estado["rodada_atual"]["tempo_ativo_ms"] == 5000
            estado = (await agir(cliente, estado, "encerramento")).json()
            assert estado["tempo_total_ms"] == 5000
            assert estado["resumo_rodadas"][0]["estado"] == "interrompida"
            assert estado["resumo_rodadas"][0]["tempo_ativo_ms"] == 5000
            assert len(estado["resumo_rodadas"]) == 1
            assert estado["pontuacao"] == -100
            assert (await cliente.post(url, json=corpo)).status_code == 409

    executar(verificar())


def teste_uniao_pura_nao_conta_ausencia_nem_muta_anterior():
    from aplicacao.modulos.individual.tempo import duracao, unir_intervalos

    anterior = [[1000, 3000]]
    unido = unir_intervalos(anterior, 2000, 4000, 5000)
    assert anterior == [[1000, 3000]]
    assert unido == [[1000, 4000]]
    assert duracao(unir_intervalos(unido, 20000, 23000, 24000)) == 6000
    assert duracao(None) is None
    assert duracao([]) == 0
