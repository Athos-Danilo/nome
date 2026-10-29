"""Demonstração jogável, máscara pública e resultados persistidos."""

from uuid import UUID, uuid4

from sqlalchemy import func, select

from aplicacao.bancos.acoes import resultados_individuais
from aplicacao.bancos.partidas import rodadas
from aplicacao.modulos.individual.regras import conferir_palpite
from testes.teste_demonstracoes import ambiente as ambiente_demo
from testes.teste_demonstracoes import identificar
from testes.teste_individual import CatalogoControlado, agir, ambiente, iniciar
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401


def teste_sinais_fixos_e_numeros_no_palpite():
    assert conferir_palpite("wall-e 3", "WALL-E 3") == ("WALL-E 3", True)


def teste_resultado_recuperavel_sem_revelar_reservas(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            assert estado["resumo_rodadas"] == []
            estado = (await agir(cliente, estado, "desistencia-palavra")).json()
            resumo = estado["resumo_rodadas"]
            assert len(resumo) == 1 and resumo[0]["estado"] == "desistida"
            assert resumo[0]["resposta"] and resumo[0]["pontos"] == 0
            estado = (await agir(cliente, estado, "encerramento")).json()
            recuperada = (await cliente.get(f"/api/partidas/{estado['partida_id']}")).json()
            assert recuperada["resumo_rodadas"] == resumo
            assert recuperada["acertos"] == 0 and recuperada["pontuacao"] == 0
            assert len(recuperada["resumo_rodadas"]) == 1

    executar(verificar())


def teste_mascara_nao_revela_digitos_ou_letras(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            for item in api.state.individual.catalogo.itens:
                item.resposta = "WALL-E 3"
            estado = await iniciar(cliente)
            assert estado["rodada_atual"]["posicoes"] == [
                None,
                None,
                None,
                None,
                "-",
                None,
                " ",
                None,
            ]
            assert "WALL" not in str(estado)
            estado = (await agir(cliente, estado, "palpites", palpite="wall-e 3")).json()
            assert estado["pontuacao"] == 100

    executar(verificar())


def teste_demo_jogavel_idempotente_e_resultado_no_banco(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente_demo(base_perfil) as (api, cliente):
            catalogo = CatalogoControlado()
            for i, item in enumerate(catalogo.itens[:3]):
                item.id = f"teste-{i}"
            api.state.individual.catalogo = catalogo
            await identificar(cliente)
            await cliente.post("/api/demonstracoes", json={})
            resposta = await cliente.post("/api/demonstracoes/jogo", json={})
            assert resposta.status_code == 200, resposta.text
            estado = resposta.json()
            assert (
                estado["estado"] == "em_andamento"
                and len(estado["rodada_atual"]["dicas_reveladas"]) == 1
            )
            assert (await cliente.get("/api/demonstracoes/jogo")).json() == estado
            negada = await cliente.post(
                "/api/demonstracoes/jogo/dicas",
                json={
                    "id_acao": str(uuid4()),
                    "versao_esperada": estado["versao"],
                    "rodada_id": estado["rodada_atual"]["rodada_id"],
                },
                headers={"X-Decifra-CSRF": "errado"},
            )
            assert negada.status_code == 403
            for _ in range(3):
                with base_perfil.connect() as c:
                    palavra_id = c.scalar(
                        select(rodadas.c.palavra_id).where(
                            rodadas.c.id == UUID(estado["rodada_atual"]["rodada_id"])
                        )
                    )
                palavra = await catalogo.buscar(palavra_id, 1)
                entrada = {
                    "id_acao": str(uuid4()),
                    "versao_esperada": estado["versao"],
                    "rodada_id": estado["rodada_atual"]["rodada_id"],
                    "palpite": palavra.resposta,
                }
                resposta = await cliente.post("/api/demonstracoes/jogo/palpites", json=entrada)
                assert resposta.status_code == 200, resposta.text
                assert (
                    await cliente.post("/api/demonstracoes/jogo/palpites", json=entrada)
                ).json() == resposta.json()
                estado = resposta.json()
            assert (
                estado["estado"] == "concluida"
                and estado["pontuacao"] == 300
                and estado["acertos"] == 3
            )
            assert len(estado["resumo_rodadas"]) == 3
            with base_perfil.connect() as c:
                assert c.scalar(select(resultados_individuais.c.pontos)) == 300
                assert c.scalar(select(func.count()).select_from(resultados_individuais)) == 1
            cliente.cookies.clear()
            assert (await cliente.get("/api/demonstracoes/jogo")).status_code == 401

    executar(verificar())


def teste_limites_do_teclado_nao_identificam_letras_ausentes(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            for item in api.state.individual.catalogo.itens:
                item.resposta = "ÁRARA"
            estado = await iniciar(cliente)
            limites = estado["rodada_atual"]["limites"]
            assert limites["A"] == 3 and limites["R"] == 2
            assert limites["W"] == limites["Ç"] == 6
            assert set(limites) == set("ABCDEFGHIJKLMNOPQRSTUVWXYZÇ0123456789")
            assert not any(n == 0 for n in limites.values())

    executar(verificar())


def teste_demo_vinculada_continua_no_motor_da_conta_e_revoga_cookie_visitante(base_perfil):  # noqa: F811
    from testes.teste_autenticacao_http import entrar

    async def verificar():
        async with ambiente_demo(base_perfil) as (api, cliente):
            catalogo = CatalogoControlado()
            for i, item in enumerate(catalogo.itens[:3]):
                item.id = f"teste-{i}"
            api.state.individual.catalogo = catalogo
            await identificar(cliente)
            await cliente.post("/api/demonstracoes", json={})
            estado = (await cliente.post("/api/demonstracoes/jogo", json={})).json()
            estado = (
                await cliente.post(
                    "/api/demonstracoes/jogo/dicas",
                    json={
                        "id_acao": str(uuid4()),
                        "versao_esperada": estado["versao"],
                        "rodada_id": estado["rodada_atual"]["rodada_id"],
                    },
                )
            ).json()
            sessao = await entrar(cliente)
            cliente.headers["X-Decifra-CSRF"] = sessao["token_csrf"]
            assert (
                await cliente.patch(
                    "/api/perfil", json={"nome_usuario": "Jogador", "avatar_id": "capivara_zen"}
                )
            ).status_code == 200
            assert (await cliente.post("/api/demonstracoes/vinculo", json={})).status_code == 200
            assert (await cliente.get("/api/demonstracoes/jogo")).status_code == 403
            recebida = (await cliente.get(f"/api/partidas/{estado['partida_id']}")).json()
            assert recebida["versao"] == estado["versao"]
            assert recebida["rodada_atual"]["dica_atual"] == 2 and recebida["pontuacao"] == 0
            resposta = await agir(cliente, recebida, "desistencia-palavra")
            assert resposta.status_code == 200
            assert resposta.json()["rodadas_concluidas"] == 1

    executar(verificar())


def teste_letra_ausente_nunca_atinge_limite_na_montagem():
    from aplicacao.modulos.individual.regras import limites_do_teclado

    assert limites_do_teclado("ARARA")["W"] > len("ARARA")
