"""Motor individual com API real, PostgreSQL isolado e catálogo controlado."""

from contextlib import asynccontextmanager
from datetime import UTC, datetime
from uuid import UUID, uuid4

import httpx
import pytest
from sqlalchemy import func, insert, select, update

from aplicacao.bancos.acoes import acoes_processadas, exposicoes_conteudo, resultados_individuais
from aplicacao.bancos.conteudo import DocumentoPalavra, chave_da_resposta
from aplicacao.bancos.partidas import partidas, planos_individuais, rodadas
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.nucleo.configuracoes import Configuracoes
from aplicacao.principal import criar_aplicacao
from testes.teste_autenticacao_http import GoogleControlado, entrar
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401


class CatalogoControlado:
    def __init__(self):
        self.itens = [
            DocumentoPalavra(
                id=f"palavra-{i}",
                resposta=r,
                tematicas=["paises"],
                dificuldade="facil",
                dicas=[f"Pista {n} do item {i}." for n in range(5)],
                resposta_chave=chave_da_resposta(r),
                revisao=1,
                lote_origem="teste-001",
                atualizado_em=datetime.now(UTC),
            )
            for i, r in enumerate(["JAPÃO", "MAÇÃ", "CASA", "ÁGUA", "CÉU", "ARARA", "PÃO"])
        ]

    async def listar(self):
        return self.itens

    async def buscar(self, identificador, revisao):
        return next(p for p in self.itens if p.id == identificador and p.revisao == revisao)


@asynccontextmanager
async def ambiente(base):
    api = criar_aplicacao(
        Configuracoes(
            _env_file=None,
            ambiente="teste",
            postgresql_url=base.url.render_as_string(hide_password=False),
        ),
        provedor_google=GoogleControlado(),
    )
    api.state.individual.catalogo = CatalogoControlado()
    async with (
        api.router.lifespan_context(api),
        httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api),
            base_url="http://localhost:5173",
            headers={"Origin": "http://localhost:5173"},
        ) as cliente,
    ):
        sessao = await entrar(cliente)
        cliente.headers["X-Decifra-CSRF"] = sessao["token_csrf"]
        assert (
            await cliente.patch(
                "/api/perfil", json={"nome_usuario": "Jogador", "avatar_id": "capivara_zen"}
            )
        ).status_code == 200
        yield api, cliente, sessao


async def iniciar(cliente, **opcoes):
    configuracao = {
        "quantidade_palavras": 3,
        "tematica": "paises",
        "dificuldades": ["facil"],
        **opcoes,
    }
    plano = await cliente.post("/api/partidas/individual/configuracao", json=configuracao)
    assert plano.status_code == 200, plano.text
    assert plano.json()["pode_iniciar"]
    resposta = await cliente.post(
        "/api/partidas/individual", json={"plano_id": plano.json()["plano_id"]}
    )
    assert resposta.status_code == 200, resposta.text
    return resposta.json()


async def agir(cliente, estado, tipo, **campos):
    return await cliente.post(
        f"/api/partidas/{estado['partida_id']}/{tipo}",
        json={
            "id_acao": str(uuid4()),
            "versao_esperada": estado["versao"],
            **(
                {"rodada_id": estado["rodada_atual"]["rodada_id"]} if tipo != "encerramento" else {}
            ),
            **campos,
        },
    )


def teste_configuracao_e_estado_publico_nao_revelam_reservas(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            assert estado["versao"] == 1 and estado["estado"] == "em_andamento"
            assert (
                estado["rodada_atual"]["dica_atual"] == 1
                and len(estado["rodada_atual"]["dicas_reveladas"]) == 1
            )
            assert "palavra_id" not in str(estado) and "resposta" not in estado["rodada_atual"]
            assert (await cliente.get(f"/api/partidas/{estado['partida_id']}")).json() == estado
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(rodadas)) == 3
                assert c.scalar(select(func.count()).select_from(exposicoes_conteudo)) == 1

    executar(verificar())


def teste_palpite_incompleto_e_acentos_errados_nao_concedem_pontos(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            with base_perfil.connect() as c:
                palavra_id = c.scalar(
                    select(rodadas.c.palavra_id).where(
                        rodadas.c.id == UUID(estado["rodada_atual"]["rodada_id"])
                    )
                )
            correta = (await api.state.individual.catalogo.buscar(palavra_id, 1)).resposta
            resposta = await agir(cliente, estado, "palpites", palpite=correta[:-1])
            assert resposta.status_code == 422
            assert (await cliente.get(f"/api/partidas/{estado['partida_id']}")).json() == estado
            errada = "Z" * len(correta)
            resposta = await agir(cliente, estado, "palpites", palpite=errada)
            assert resposta.status_code == 200
            estado = resposta.json()
            assert estado["acao"]["resultado"] == "erro" and estado["acao"]["limpar_montagem"]
            assert estado["pontuacao"] == 0 and estado["rodada_atual"]["dica_atual"] == 2
            resposta = await agir(cliente, estado, "palpites", palpite=correta.lower())
            assert resposta.status_code == 200 and resposta.json()["pontuacao"] == 80

    executar(verificar())


def teste_quinta_dica_erros_ilimitados_pontuacao_minima_e_desistencia(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            for _ in range(4):
                estado = (await agir(cliente, estado, "dicas")).json()
            assert estado["rodada_atual"]["pontos_disponiveis"] == 20
            assert (await agir(cliente, estado, "dicas")).status_code == 409
            for _ in range(3):
                estado = (
                    await agir(
                        cliente,
                        estado,
                        "palpites",
                        palpite="Z" * len(estado["rodada_atual"]["posicoes"]),
                    )
                ).json()
                assert estado["rodada_atual"]["dica_atual"] == 5
            with base_perfil.connect() as c:
                palavra_id = c.scalar(
                    select(rodadas.c.palavra_id).where(
                        rodadas.c.id == UUID(estado["rodada_atual"]["rodada_id"])
                    )
                )
            correta = (await api.state.individual.catalogo.buscar(palavra_id, 1)).resposta
            estado = (await agir(cliente, estado, "palpites", palpite=correta)).json()
            assert estado["pontuacao"] == 20
            estado = (await agir(cliente, estado, "desistencia-palavra")).json()
            assert estado["acao"]["resposta_revelada"] and estado["pontuacao"] == 20
            assert estado["rodada_atual"]["dica_atual"] == 1

    executar(verificar())


def teste_idempotencia_concorrencia_e_publicacao_unica(base_perfil):  # noqa: F811
    import asyncio

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            dados = {
                "id_acao": str(uuid4()),
                "versao_esperada": estado["versao"],
                "rodada_id": estado["rodada_atual"]["rodada_id"],
            }
            caminho = f"/api/partidas/{estado['partida_id']}/desistencia-palavra"
            respostas = await asyncio.gather(*(cliente.post(caminho, json=dados) for _ in range(3)))
            assert all(r.status_code == 200 for r in respostas)
            assert respostas[0].json() == respostas[1].json() == respostas[2].json()
            estado = respostas[0].json()
            assert (
                await cliente.post(caminho, json={**dados, "versao_esperada": 99})
            ).status_code == 409
            for _ in range(2):
                estado = (await agir(cliente, estado, "desistencia-palavra")).json()
            assert estado["estado"] == "concluida"
            assert (await agir(cliente, estado, "encerramento")).status_code == 409
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(resultados_individuais)) == 1
                assert c.scalar(select(func.count()).select_from(exposicoes_conteudo)) == 3

    executar(verificar())


def teste_falta_de_conteudo_exige_escolha_e_reducao_pode_ter_uma_palavra(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            api.state.individual.catalogo.itens = api.state.individual.catalogo.itens[:1]
            dados = {"quantidade_palavras": 3, "tematica": "paises", "dificuldades": ["facil"]}
            plano = (await cliente.post("/api/partidas/individual/configuracao", json=dados)).json()
            assert not plano["pode_iniciar"] and plano["disponiveis"] == 1
            ampliado = (
                await cliente.post(
                    "/api/partidas/individual/configuracao",
                    json={**dados, "permitir_outras_tematicas": True},
                )
            ).json()
            assert ampliado["alternativas"] == ["reduzir", "cancelar"]
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(partidas)) == 0
            estado = await iniciar(cliente, aceitar_reducao=True)
            assert estado["quantidade_palavras"] == 1

    executar(verificar())


def teste_abandono_preserva_pontos_e_libera_nova_partida(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            resposta = await agir(cliente, estado, "encerramento")
            assert resposta.status_code == 200 and resposta.json()["estado"] == "abandonada"
            assert resposta.json()["pontuacao"] == 0
            assert (await iniciar(cliente))["estado"] == "em_andamento"
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(exposicoes_conteudo)) == 2

    executar(verificar())


def teste_exclusao_remove_planos_nao_iniciados(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            r = await cliente.post(
                "/api/partidas/individual/configuracao", json={"quantidade_palavras": 3}
            )
            assert r.status_code == 200
            assert (
                await cliente.request("DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"})
            ).status_code == 204
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(planos_individuais)) == 0

    executar(verificar())


def teste_configuracao_concorrente_nao_cria_duas_individuais(base_perfil):  # noqa: F811
    import asyncio

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            planos = [
                (
                    await cliente.post(
                        "/api/partidas/individual/configuracao", json={"quantidade_palavras": 3}
                    )
                ).json()["plano_id"]
                for _ in range(2)
            ]
            respostas = await asyncio.gather(
                *(cliente.post("/api/partidas/individual", json={"plano_id": p}) for p in planos)
            )
            assert sorted(r.status_code for r in respostas) == [200, 409]
            primeira = next(r.json() for r in respostas if r.status_code == 200)
            assert (await cliente.get("/api/partidas/em-aberto")).json()["individual"] == primeira
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(partidas)) == 1

    executar(verificar())


def teste_falha_ao_carregar_proxima_rodada_reverte_toda_a_acao(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            with base_perfil.connect() as c:
                palavra_id = c.scalar(
                    select(rodadas.c.palavra_id).where(
                        rodadas.c.id == UUID(estado["rodada_atual"]["rodada_id"])
                    )
                )
            correta = (await api.state.individual.catalogo.buscar(palavra_id, 1)).resposta
            original = api.state.individual.catalogo.buscar

            async def falhar_proxima(identificador, revisao):
                if identificador != palavra_id:
                    raise FalhaAutenticacao("CATALOGO_INDISPONIVEL", "Tente novamente.", 503)
                return await original(identificador, revisao)

            api.state.individual.catalogo.buscar = falhar_proxima
            assert (await agir(cliente, estado, "palpites", palpite=correta)).status_code == 503
            with base_perfil.connect() as c:
                assert c.scalar(select(partidas.c.pontuacao)) == 0
                assert c.scalar(select(partidas.c.versao)) == 1
                assert c.scalar(select(func.count()).select_from(acoes_processadas)) == 0
                assert c.scalar(select(func.count()).select_from(exposicoes_conteudo)) == 1

    executar(verificar())


def teste_plano_expirado_e_mutacoes_sem_origem_nao_iniciam_partida(base_perfil):  # noqa: F811
    from datetime import timedelta

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            r = await cliente.post(
                "/api/partidas/individual/configuracao", json={"quantidade_palavras": 3}
            )
            plano_id = UUID(r.json()["plano_id"])
            with base_perfil.begin() as c:
                c.execute(
                    update(planos_individuais)
                    .where(planos_individuais.c.id == plano_id)
                    .values(
                        criado_em=datetime.now(UTC) - timedelta(minutes=20),
                        expira_em=datetime.now(UTC) - timedelta(minutes=10),
                    )
                )
            assert (
                await cliente.post("/api/partidas/individual", json={"plano_id": str(plano_id)})
            ).status_code == 409
            assert (
                await cliente.post(
                    "/api/partidas/individual/configuracao",
                    json={"quantidade_palavras": 3},
                    headers={"Origin": "https://outro.example"},
                )
            ).status_code == 403

    executar(verificar())


@pytest.mark.parametrize(
    "indice,errada,correta", [(0, "JAPAO", "japa\u0303o"), (1, "MACÃ", "maçã")]
)
def teste_acentos_e_cedilha_sao_obrigatorios_com_unicode_nfc(base_perfil, indice, errada, correta):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            api.state.individual.catalogo.itens = [api.state.individual.catalogo.itens[indice]]
            estado = await iniciar(cliente, aceitar_reducao=True)
            estado = (await agir(cliente, estado, "palpites", palpite=errada)).json()
            assert estado["acao"]["resultado"] == "erro" and estado["pontuacao"] == 0
            estado = (await agir(cliente, estado, "palpites", palpite=correta)).json()
            assert estado["estado"] == "concluida" and estado["pontuacao"] == 80

    executar(verificar())


def teste_acertos_publicam_soma_e_leitura_nao_expoe_reservas(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            estado = await iniciar(cliente)
            for _ in range(3):
                with base_perfil.connect() as c:
                    palavra_id = c.scalar(
                        select(rodadas.c.palavra_id).where(
                            rodadas.c.id == UUID(estado["rodada_atual"]["rodada_id"])
                        )
                    )
                palavra = await api.state.individual.catalogo.buscar(palavra_id, 1)
                estado = (await agir(cliente, estado, "palpites", palpite=palavra.resposta)).json()
            assert estado["pontuacao"] == 300 and estado["estado"] == "concluida"
            with base_perfil.connect() as c:
                resultado = c.execute(select(resultados_individuais)).mappings().one()
                assert (
                    resultado["pontos"] == 300
                    and resultado["acertos"] == 3
                    and resultado["concluida"]
                )
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
            ) as anonimo:
                assert (
                    await anonimo.get(f"/api/partidas/{estado['partida_id']}")
                ).status_code == 401

    executar(verificar())


def teste_conteudo_exibido_na_galera_e_compartilhado_com_individual(base_perfil):  # noqa: F811
    from aplicacao.bancos.partidas import sessoes_galera

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            with base_perfil.begin() as c:
                galera = c.scalar(
                    insert(partidas)
                    .values(jogador_id=UUID(sessao["jogador_id"]), modo="galera", configuracao={})
                    .returning(partidas.c.id)
                )
                painel = c.scalar(
                    insert(sessoes_galera)
                    .values(partida_id=galera, numero=1, tematica_id="paises")
                    .returning(sessoes_galera.c.id)
                )
                rodada = c.scalar(
                    insert(rodadas)
                    .values(
                        partida_id=galera,
                        sessao_id=painel,
                        ordem=1,
                        palavra_id="palavra-0",
                        revisao=1,
                        dificuldade="facil",
                        estado="apresentada",
                        apresentada_em=datetime.now(UTC),
                    )
                    .returning(rodadas.c.id)
                )
                c.execute(insert(exposicoes_conteudo).values(rodada_id=rodada))
            estado = await iniciar(cliente)
            with base_perfil.connect() as c:
                escolhidas = set(
                    c.execute(
                        select(rodadas.c.palavra_id).where(
                            rodadas.c.partida_id == UUID(estado["partida_id"])
                        )
                    ).scalars()
                )
                assert "palavra-0" not in escolhidas

    executar(verificar())


def teste_plano_antigo_nao_repete_como_inedita_palavra_exibida_depois(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, sessao):
            api.state.individual.catalogo.itens = api.state.individual.catalogo.itens[:3]
            plano = (
                await cliente.post(
                    "/api/partidas/individual/configuracao", json={"quantidade_palavras": 3}
                )
            ).json()
            estado = await iniciar(cliente)
            assert (await agir(cliente, estado, "encerramento")).status_code == 200
            r = await cliente.post("/api/partidas/individual", json={"plano_id": plano["plano_id"]})
            assert r.status_code == 409 and r.json()["erro"]["codigo"] == "PLANO_DESATUALIZADO"

    executar(verificar())
