"""Configuração da galera em API real e banco descartável."""

from uuid import UUID

from sqlalchemy import func, select

from aplicacao.bancos.acoes import exposicoes_conteudo
from aplicacao.bancos.partidas import (
    ordens_participantes,
    participantes,
    partidas,
    rodadas,
    sessoes_galera,
)
from testes.teste_individual import ambiente, iniciar
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401

CONFIGURACAO = {
    "convidados": [{"nome": "Amigo", "avatar_id": "coruja_sabia"}],
    "dificuldade": "facil",
    "quantidade_sessoes": 2,
    "modo_tematicas": "manual",
    "tematicas": ["paises", "paises"],
}


def teste_cria_galera_reserva_sem_repetir_nem_expor_e_preserva_individual(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            api.state.galera.catalogo = api.state.individual.catalogo
            individual = await iniciar(cliente)
            plano = await cliente.post("/api/partidas/galera/configuracao", json=CONFIGURACAO)
            assert plano.status_code == 200, plano.text
            assert plano.json()["pode_criar"] is True
            assert "reservas" not in plano.json() and "palavras" not in plano.json()
            r = await cliente.post(
                "/api/partidas/galera", json={"plano_id": plano.json()["plano_id"]}
            )
            assert r.status_code == 200, r.text
            estado = r.json()
            assert estado["estado"] == "preparada"
            assert [p["nome"] for p in estado["participantes"]] == ["Jogador", "Amigo"]
            assert sorted(estado["ordem_primeira_sessao"]) == sorted(
                p["participante_id"] for p in estado["participantes"]
            )
            assert "palavras" not in estado and "respostas" not in estado
            assert (
                await cliente.post(
                    "/api/partidas/galera", json={"plano_id": plano.json()["plano_id"]}
                )
            ).json() == estado
            assert (
                await cliente.get(f"/api/partidas/galera/{estado['partida_id']}")
            ).json() == estado
            with base_perfil.connect() as c:
                id = UUID(estado["partida_id"])
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(participantes)
                        .where(participantes.c.partida_id == id)
                    )
                    == 2
                )
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(sessoes_galera)
                        .where(sessoes_galera.c.partida_id == id)
                    )
                    == 2
                )
                reservas = list(
                    c.execute(select(rodadas).where(rodadas.c.partida_id == id)).mappings()
                )
                assert len(reservas) == 4 and len({r["palavra_id"] for r in reservas}) == 4
                assert all(r["estado"] == "reservada" for r in reservas)
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(ordens_participantes)
                        .where(ordens_participantes.c.partida_id == id)
                    )
                    == 2
                )
                assert c.scalar(select(func.count()).select_from(exposicoes_conteudo)) == 1
            assert (
                await cliente.get(f"/api/partidas/{individual['partida_id']}")
            ).json() == individual

    executar(verificar())


def teste_recusa_nomes_duplicados_avatar_invalido_e_falta_conteudo(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            api.state.galera.catalogo = api.state.individual.catalogo
            for convidado in [
                {"nome": "JOGÁDOR", "avatar_id": "coruja_sabia"},
                {"nome": "Amigo", "avatar_id": "inexistente"},
            ]:
                r = await cliente.post(
                    "/api/partidas/galera/configuracao",
                    json={**CONFIGURACAO, "convidados": [convidado]},
                )
                assert r.status_code == 422
            r = await cliente.post(
                "/api/partidas/galera/configuracao", json={**CONFIGURACAO, "dificuldade": "dificil"}
            )
            assert r.status_code == 200 and r.json()["pode_criar"] is False
            assert r.json()["plano_id"] is None
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(partidas)) == 0

    executar(verificar())


def teste_aleatorio_oculta_sequencia_permite_solo_e_criacao_concorrente(base_perfil):  # noqa: F811
    import asyncio

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            api.state.galera.catalogo = api.state.individual.catalogo
            dados = {
                "convidados": [],
                "dificuldade": "facil",
                "quantidade_sessoes": 5,
                "modo_tematicas": "aleatorio",
            }
            plano = (await cliente.post("/api/partidas/galera/configuracao", json=dados)).json()
            assert plano["pode_criar"]
            assert "paises" not in str(plano)
            respostas = await asyncio.gather(
                *[
                    cliente.post("/api/partidas/galera", json={"plano_id": plano["plano_id"]})
                    for _ in range(2)
                ]
            )
            assert all(r.status_code == 200 for r in respostas)
            assert respostas[0].json() == respostas[1].json()
            assert "paises" not in respostas[0].text
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(partidas)) == 1
                assert c.scalar(select(func.count()).select_from(rodadas)) == 5
                assert c.scalar(select(func.count()).select_from(exposicoes_conteudo)) == 0

    executar(verificar())


def teste_plano_expirado_csrf_falso_entrada_invalida_e_anonimizacao(base_perfil):  # noqa: F811
    from datetime import UTC, datetime, timedelta

    from sqlalchemy import update

    from aplicacao.bancos.partidas import planos_galera

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            api.state.galera.catalogo = api.state.individual.catalogo
            for campos in [
                {"quantidade_sessoes": True},
                {"quantidade_sessoes": 6},
                {"tematicas": ["inexistente", "paises"]},
                {"jogador_id": conta["jogador_id"]},
                {"convidados": CONFIGURACAO["convidados"] * 3},
            ]:
                assert (
                    await cliente.post(
                        "/api/partidas/galera/configuracao", json={**CONFIGURACAO, **campos}
                    )
                ).status_code == 422
            plano = (
                await cliente.post("/api/partidas/galera/configuracao", json=CONFIGURACAO)
            ).json()
            with base_perfil.begin() as c:
                c.execute(
                    update(planos_galera).values(
                        criado_em=datetime.now(UTC) - timedelta(minutes=20),
                        expira_em=datetime.now(UTC) - timedelta(minutes=1),
                    )
                )
            assert (
                await cliente.post("/api/partidas/galera", json={"plano_id": plano["plano_id"]})
            ).status_code == 409
            csrf = cliente.headers["X-Decifra-CSRF"]
            cliente.headers["X-Decifra-CSRF"] = "invalido"
            assert (
                await cliente.post("/api/partidas/galera/configuracao", json=CONFIGURACAO)
            ).status_code == 403
            cliente.headers["X-Decifra-CSRF"] = csrf
            assert (
                await cliente.request("DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"})
            ).status_code == 204
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(planos_galera)) == 0

    executar(verificar())


def teste_matching_nao_perde_configuracao_viavel_com_palavra_multitematica():
    import random

    from aplicacao.modulos.galera.selecao import combinar
    from testes.teste_individual import CatalogoControlado

    palavras = CatalogoControlado().itens[:2]
    palavras[0].tematicas = ["paises", "objetos"]
    palavras[1].tematicas = ["paises"]
    resultado = combinar(["paises", "objetos"], 1, palavras, set(), random.Random(7))
    assert resultado is not None
    assert resultado[0].id == palavras[1].id and resultado[1].id == palavras[0].id


def teste_nao_aceita_plano_nem_partida_de_outra_conta(base_perfil):  # noqa: F811
    import httpx

    from testes.teste_autenticacao_http import entrar

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            api.state.galera.catalogo = api.state.individual.catalogo
            plano = (
                await cliente.post("/api/partidas/galera/configuracao", json=CONFIGURACAO)
            ).json()
            estado = (
                await cliente.post("/api/partidas/galera", json={"plano_id": plano["plano_id"]})
            ).json()
            from aplicacao.modulos.autenticacao.contratos import IdentidadeGoogle
            from testes.teste_autenticacao_http import GoogleControlado

            class OutroGoogle(GoogleControlado):
                async def autenticar(self, codigo, nonce, verificador):
                    return IdentidadeGoogle("outro-sujeito", "outra-conta@example.test")

            api.state.autenticacao.provedor = OutroGoogle()
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
            ) as outro:
                sessao = await entrar(outro)
                outro.headers.update(
                    {"Origin": "http://localhost:5173", "X-Decifra-CSRF": sessao["token_csrf"]}
                )
                assert (
                    await outro.patch(
                        "/api/perfil", json={"nome_usuario": "Outro", "avatar_id": "capivara_zen"}
                    )
                ).status_code == 200
                assert (
                    await outro.get(f"/api/partidas/galera/{estado['partida_id']}")
                ).status_code == 404
                assert (
                    await outro.post("/api/partidas/galera", json={"plano_id": plano["plano_id"]})
                ).status_code == 404

    executar(verificar())
