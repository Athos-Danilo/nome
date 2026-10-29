"""Pausas e rascunhos em PostgreSQL descartável, antes da integração visual."""

from uuid import uuid4

from sqlalchemy import func, select

from aplicacao.bancos.acoes import interrupcoes, penalidades, resultados_individuais
from aplicacao.bancos.esquema import metadados
from aplicacao.bancos.partidas import conexoes_individuais, rodadas
from testes.teste_individual import agir, ambiente, iniciar
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401


def teste_esquema_registra_conexoes_e_rascunho():
    assert "conexoes_individuais" in metadados.tables
    assert "rascunho" in metadados.tables["rodadas"].c


def teste_exclusao_remove_montagem_e_conexoes_da_conta(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            url = f"/api/partidas/{estado['partida_id']}"
            posicoes = estado["rodada_atual"]["posicoes"]
            corpo = {
                "versao_esperada": estado["versao"],
                "rodada_id": estado["rodada_atual"]["rodada_id"],
                "revisao_esperada": 0,
                "letras": ["A" if i == 0 else (c or "") for i, c in enumerate(posicoes)],
                "selecionada": 1,
            }
            assert (await cliente.post(url + "/rascunho", json=corpo)).status_code == 200
            assert (
                await cliente.post(
                    url + "/conexoes",
                    json={
                        "aba_id": str(uuid4()),
                        "documento_id": str(uuid4()),
                        "navegacao": "navigate",
                    },
                )
            ).status_code == 200
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(conexoes_individuais)) == 1
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(rodadas)
                        .where(rodadas.c.rascunho.is_not(None))
                    )
                    == 1
                )
            assert (
                await cliente.request("DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"})
            ).status_code == 204
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(conexoes_individuais)) == 0
                assert all(v is None for v in c.scalars(select(rodadas.c.rascunho)))
            assert (await cliente.get(url)).status_code == 401

    executar(verificar())


def teste_pausa_unica_saldo_negativo_retomada_e_abandono(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            estado = (await agir(cliente, estado, "dicas")).json()
            corpo = {"id_acao": str(uuid4()), "versao_esperada": estado["versao"]}
            url = f"/api/partidas/{estado['partida_id']}"
            resposta = await cliente.post(url + "/pausa", json=corpo)
            assert resposta.status_code == 200, resposta.text
            pausa = resposta.json()
            assert pausa["estado"] == "pausada" and pausa["pontuacao"] == -100
            assert pausa["rodada_atual"]["dica_atual"] == 2
            assert pausa["quantidade_pausas"] == 1
            assert (await cliente.post(url + "/pausa", json=corpo)).json() == pausa
            assert (await cliente.get(url)).json()["pontuacao"] == -100
            assert (await agir(cliente, pausa, "dicas")).status_code == 409
            repetida = await cliente.post(
                url + "/pausa", json={"id_acao": str(uuid4()), "versao_esperada": pausa["versao"]}
            )
            assert repetida.status_code in (200, 409)
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(penalidades)) == 1
                assert c.scalar(select(func.count()).select_from(resultados_individuais)) == 0
            retomada = await cliente.post(
                url + "/retomada",
                json={"id_acao": str(uuid4()), "versao_esperada": pausa["versao"]},
            )
            assert retomada.status_code == 200, retomada.text
            estado = retomada.json()
            assert estado["pontuacao"] == -100 and estado["rodada_atual"]["dica_atual"] == 2
            estado = (
                await cliente.post(
                    url + "/pausa",
                    json={"id_acao": str(uuid4()), "versao_esperada": estado["versao"]},
                )
            ).json()
            assert estado["pontuacao"] == -200 and estado["quantidade_pausas"] == 2
            estado = (await agir(cliente, estado, "encerramento")).json()
            assert estado["estado"] == "abandonada" and estado["pontuacao"] == -200
            with base_perfil.connect() as c:
                assert c.scalar(select(resultados_individuais.c.pontos)) == -200
            assert (await iniciar(cliente))["estado"] == "em_andamento"

    executar(verificar())


def teste_rascunho_persiste_rejeita_atraso_e_erro_limpa(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            url = f"/api/partidas/{estado['partida_id']}"
            letras = [""] * len(estado["rodada_atual"]["posicoes"])
            letras[0] = "ç"
            corpo = {
                "versao_esperada": estado["versao"],
                "rodada_id": estado["rodada_atual"]["rodada_id"],
                "revisao_esperada": 0,
                "letras": letras,
                "selecionada": 1,
            }
            resposta = await cliente.post(url + "/rascunho", json=corpo)
            assert resposta.status_code == 200, resposta.text
            atual = resposta.json()
            r = atual["rodada_atual"]["rascunho"]
            assert r["letras"][0] == "Ç" and r["revisao"] == 1
            assert atual["versao"] == estado["versao"] and atual["pontuacao"] == 0
            assert (await cliente.get(url)).json()["rodada_atual"]["rascunho"] == r
            assert (await cliente.post(url + "/rascunho", json=corpo)).status_code == 200
            alterado = {**corpo, "letras": ["Z"] * len(letras)}
            assert (await cliente.post(url + "/rascunho", json=alterado)).status_code == 409
            atual = (await agir(cliente, atual, "palpites", palpite="Z" * len(letras))).json()
            assert atual["rodada_atual"]["rascunho"] is None
            assert (
                await cliente.post(url + "/rascunho", json={**corpo, "revisao_esperada": 1})
            ).status_code == 409

    executar(verificar())


def teste_conexoes_recarga_ambiguas_e_sinais_atrasados_nao_cobram(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            url = f"/api/partidas/{estado['partida_id']}"
            aba = str(uuid4())
            doc = str(uuid4())
            conexao = {"aba_id": aba, "documento_id": doc, "navegacao": "navigate"}
            resposta = await cliente.post(url + "/conexoes", json=conexao)
            assert resposta.status_code == 200, resposta.text
            sinal = {
                "aba_id": aba,
                "documento_id": doc,
                "evento_id": str(uuid4()),
                "versao_esperada": estado["versao"],
                "tipo": "pagehide",
                "persistido": False,
            }
            assert (await cliente.post(url + "/sinais", json=sinal)).status_code == 200
            recarga = await cliente.post(
                url + "/conexoes",
                json={**conexao, "documento_id": str(uuid4()), "navegacao": "reload"},
            )
            assert recarga.status_code == 200 and recarga.json()["pontuacao"] == 0
            assert (await cliente.post(url + "/sinais", json=sinal)).json()["pontuacao"] == 0
            ambiguo = await cliente.post(
                url + "/conexoes",
                json={
                    "aba_id": str(uuid4()),
                    "documento_id": str(uuid4()),
                    "navegacao": "navigate",
                },
            )
            assert ambiguo.json()["pontuacao"] == 0
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(penalidades)) == 0

    executar(verificar())


def teste_voltar_historico_cobra_uma_vez_e_nao_repete_apos_retomada(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            url = f"/api/partidas/{estado['partida_id']}"
            conexao = {
                "aba_id": str(uuid4()),
                "documento_id": str(uuid4()),
                "navegacao": "navigate",
            }
            assert (await cliente.post(url + "/conexoes", json=conexao)).status_code == 200
            retorno = {**conexao, "documento_id": str(uuid4()), "navegacao": "back_forward"}
            resposta = await cliente.post(url + "/conexoes", json=retorno)
            assert resposta.status_code == 200, resposta.text
            pausa = resposta.json()
            assert pausa["estado"] == "pausada" and pausa["pontuacao"] == -100
            assert (await cliente.post(url + "/conexoes", json=retorno)).json()["pontuacao"] == -100
            retomada = (
                await cliente.post(
                    url + "/retomada",
                    json={"id_acao": str(uuid4()), "versao_esperada": pausa["versao"]},
                )
            ).json()
            assert retomada["estado"] == "em_andamento"
            assert (await cliente.post(url + "/conexoes", json=retorno)).json()["pontuacao"] == -100
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(penalidades)) == 1

    executar(verificar())


def teste_pausa_concorrente_nao_duplica_penalidade(base_perfil):  # noqa: F811
    import asyncio

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            url = f"/api/partidas/{estado['partida_id']}/pausa"
            corpo = {"id_acao": str(uuid4()), "versao_esperada": estado["versao"]}
            respostas = await asyncio.gather(
                cliente.post(url, json=corpo), cliente.post(url, json=corpo)
            )
            assert all(r.status_code == 200 for r in respostas)
            assert respostas[0].json() == respostas[1].json()
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(penalidades)) == 1

    executar(verificar())


def teste_rascunho_preserva_sinais_e_rejeita_troca_de_rodada(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            for item in api.state.individual.catalogo.itens:
                item.resposta = "WALL-E 3"
            estado = await iniciar(cliente)
            url = f"/api/partidas/{estado['partida_id']}/rascunho"
            corpo = {
                "versao_esperada": estado["versao"],
                "rodada_id": estado["rodada_atual"]["rodada_id"],
                "revisao_esperada": 0,
                "letras": ["W", "A", "", "", "-", "", " ", "3"],
                "selecionada": 2,
            }
            assert (await cliente.post(url, json=corpo)).status_code == 200
            assert (
                await cliente.post(url, json={**corpo, "rodada_id": str(uuid4())})
            ).status_code == 409
            assert (
                await cliente.post(
                    url,
                    json={
                        **corpo,
                        "revisao_esperada": 1,
                        "letras": ["W", "A", "", "", "X", "", " ", "3"],
                    },
                )
            ).status_code == 422
            assert (await cliente.post(url, json={**corpo, "pontuacao": 999})).status_code == 422

    executar(verificar())


def teste_sinal_pagehide_repetido_e_cache_historico_uma_pausa(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            url = f"/api/partidas/{estado['partida_id']}"
            conexao = {
                "aba_id": str(uuid4()),
                "documento_id": str(uuid4()),
                "navegacao": "navigate",
            }
            await cliente.post(url + "/conexoes", json=conexao)
            sinal = {
                **{k: conexao[k] for k in ("aba_id", "documento_id")},
                "evento_id": str(uuid4()),
                "versao_esperada": estado["versao"],
                "tipo": "pagehide",
                "persistido": True,
            }
            for _ in range(2):
                assert (await cliente.post(url + "/sinais", json=sinal)).json()["pontuacao"] == 0
            retorno = {**sinal, "evento_id": str(uuid4()), "tipo": "pageshow"}
            pausada = (await cliente.post(url + "/sinais", json=retorno)).json()
            assert pausada["pontuacao"] == -100 and pausada["estado"] == "pausada"
            assert (await cliente.post(url + "/sinais", json=retorno)).json()["pontuacao"] == -100
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(penalidades)) == 1
                assert c.scalar(select(func.count()).select_from(interrupcoes)) == 1

    executar(verificar())
