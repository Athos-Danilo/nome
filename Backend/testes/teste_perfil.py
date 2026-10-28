"""Perfil, preferências e anonimização em bases exclusivas de cada teste."""

import asyncio
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from uuid import uuid4

import httpx
import psycopg
import pytest
from alembic import command
from alembic.config import Config
from psycopg import sql
from pydantic import SecretStr
from sqlalchemy import create_engine, insert, select, text

from aplicacao.bancos.acoes import (
    acoes_processadas,
    exposicoes_conteudo,
    palpites,
    resultados_individuais,
)
from aplicacao.bancos.identidade import jogadores, preferencias, sessoes_autenticacao, visitantes
from aplicacao.bancos.partidas import participantes, partidas, rodadas
from aplicacao.modulos.autenticacao.contratos import IdentidadeGoogle
from aplicacao.nucleo.configuracoes import Configuracoes
from aplicacao.principal import criar_aplicacao
from testes.teste_autenticacao_http import GoogleControlado, entrar
from testes.teste_persistencia import banco  # noqa: F401


@pytest.fixture
def base_perfil(banco, monkeypatch):  # noqa: F811
    nome = f"decifra_perfil_{uuid4().hex}_teste"
    url = banco.url.set(database=nome)
    parametros = dict(
        host=url.host,
        port=url.port,
        user=url.username,
        password=url.password,
        dbname=banco.url.database,
        autocommit=True,
    )
    with psycopg.connect(**parametros) as administrativa:
        administrativa.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(nome)))
    motor = create_engine(url)
    try:
        monkeypatch.setenv("DECIFRA_POSTGRESQL_URL", url.render_as_string(hide_password=False))
        command.upgrade(Config("alembic.ini"), "head")
        yield motor
    finally:
        motor.dispose()
        assert nome.startswith("decifra_perfil_") and nome.endswith("_teste")
        with psycopg.connect(**parametros) as administrativa:
            administrativa.execute(
                sql.SQL("DROP DATABASE {} WITH (FORCE)").format(sql.Identifier(nome))
            )


@asynccontextmanager
async def contexto(base):
    class GoogleDePerfil(GoogleControlado):
        sujeito = uuid4().hex

        async def autenticar(self, codigo, nonce, verificador):
            return IdentidadeGoogle(self.sujeito, f"{self.sujeito}@example.test")

    google = GoogleDePerfil()
    api = criar_aplicacao(
        Configuracoes(
            _env_file=None,
            ambiente="teste",
            postgresql_url=SecretStr(base.url.render_as_string(hide_password=False)),
        ),
        provedor_google=google,
    )
    async with (
        api.router.lifespan_context(api),
        httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
        ) as cliente,
    ):
        sessao = await entrar(cliente)
        cliente.headers.update(
            {"Origin": "http://localhost:5173", "X-Decifra-CSRF": sessao["token_csrf"]}
        )
        yield cliente, api, google, sessao


def executar(corrotina):
    return asyncio.run(corrotina, loop_factory=asyncio.SelectorEventLoop)


def teste_colecao_e_primeiro_acesso_privado(base_perfil):
    async def verificar():
        async with contexto(base_perfil) as (cliente, api, google, sessao):
            resposta = await cliente.get("/api/avatares")
            assert resposta.status_code == 200
            avatares = resposta.json()
            assert len(avatares) == 20
            assert len({a["id"] for a in avatares}) == 20
            recurso = await cliente.get(avatares[0]["recurso"])
            assert recurso.status_code == 200 and "<svg" in recurso.text
            perfil = await cliente.get("/api/perfil")
            assert perfil.status_code == 200
            assert perfil.json()["estado"] == "cadastro_pendente"
            resposta = await cliente.patch(
                "/api/perfil", json={"nome_usuario": "José_42", "avatar_id": "capivara_zen"}
            )
            assert resposta.status_code == 200
            assert resposta.json()["estado"] == "ativo"
            assert resposta.json()["nome_usuario"] == "José_42"
            assert (await cliente.get("/api/autenticacao/sessao")).json()["estado"] == "ativo"
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
            ) as anonimo:
                assert (await anonimo.get("/api/perfil")).status_code == 401
                assert (await anonimo.get("/api/preferencias")).status_code == 401
                assert (await anonimo.get("/api/avatares")).status_code == 200
            assert (await cliente.get("/api/perfil?jogador_id=outro")).json()[
                "jogador_id"
            ] == sessao["jogador_id"]

    executar(verificar())


def teste_nomes_unicos_entrada_estrita_e_protecao_csrf(base_perfil):
    async def verificar():
        async with contexto(base_perfil) as (cliente, api, google, sessao):
            dados = {"nome_usuario": "José_42", "avatar_id": "capivara_zen"}
            assert (await cliente.patch("/api/perfil", json=dados)).status_code == 200
            for invalido in [
                dict(dados, email="outro@example.test"),
                dict(dados, jogador_id=str(uuid4())),
                dict(dados, nome_usuario="Ana Maria"),
                dict(dados, nome_usuario="ab"),
                dict(dados, avatar_id="avatar-inventado"),
            ]:
                assert (await cliente.patch("/api/perfil", json=invalido)).status_code == 422
            google.sujeito = uuid4().hex
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
            ) as outro:
                segunda = await entrar(outro)
                outro.headers.update(
                    {"Origin": "http://localhost:5173", "X-Decifra-CSRF": segunda["token_csrf"]}
                )
                resposta = await outro.patch(
                    "/api/perfil", json=dict(dados, nome_usuario="JOSE_42")
                )
                assert resposta.status_code == 409
                assert resposta.json()["erro"]["codigo"] == "NOME_INDISPONIVEL"
                assert (await outro.get("/api/perfil")).json()["nome_usuario"] is None
            cliente.headers["X-Decifra-CSRF"] = "invalido"
            assert (await cliente.patch("/api/perfil", json=dados)).status_code == 403

    executar(verificar())


def teste_preferencias_primeiro_login_nao_sobrescreve_conta_e_volta_em_outro_dispositivo(
    base_perfil,
):
    async def verificar():
        async with contexto(base_perfil) as (cliente, api, google, sessao):
            resposta = await cliente.get("/api/preferencias")
            assert resposta.status_code == 200 and resposta.json()["salvas"] is False
            dados = {
                "tema": "escuro",
                "musica_id": None,
                "volume_musica": 20,
                "volume_interface": 35,
                "volume_eventos": 40,
                "silenciado": True,
                "movimentos_reduzidos": True,
            }
            resposta = await cliente.put(
                "/api/preferencias", json=dict(dados, somente_se_ausentes=True)
            )
            assert resposta.status_code == 200 and resposta.json()["salvas"] is True
            assert resposta.json()["tema"] == "escuro"
            resposta = await cliente.put(
                "/api/preferencias", json=dict(dados, tema="claro", somente_se_ausentes=True)
            )
            assert resposta.json()["tema"] == "escuro"
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
            ) as dispositivo:
                await entrar(dispositivo)
                assert (await dispositivo.get("/api/preferencias")).json()["volume_musica"] == 20
            for invalido in [
                dict(dados, volume_musica=101),
                dict(dados, volume_musica=True),
                dict(dados, musica_id="inexistente"),
                dict(dados, silenciado="sim"),
                dict(dados, jogador_id=str(uuid4())),
            ]:
                assert (await cliente.put("/api/preferencias", json=invalido)).status_code == 422

    executar(verificar())


def preencher_historico(base, jogador_id):
    from uuid import UUID

    jogador_id = UUID(jogador_id)
    with base.begin() as conexao:
        partida = conexao.execute(
            insert(partidas)
            .values(
                jogador_id=jogador_id,
                modo="individual",
                configuracao={"nome": "pessoal"},
                estado="concluida",
                encerrada_em=datetime.now(UTC),
            )
            .returning(partidas.c.id)
        ).scalar_one()
        rodada = conexao.execute(
            insert(rodadas)
            .values(
                partida_id=partida,
                ordem=1,
                palavra_id="girafa",
                revisao=1,
                dificuldade="facil",
                dica_atual=1,
            )
            .returning(rodadas.c.id)
        ).scalar_one()
        conexao.execute(insert(exposicoes_conteudo).values(rodada_id=rodada))
        acao = conexao.execute(
            insert(acoes_processadas)
            .values(
                partida_id=partida,
                id_acao=uuid4(),
                tipo="palpite",
                entrada_resumo="a" * 64,
                resultado={"nome": "pessoal"},
                versao_aplicada=1,
            )
            .returning(acoes_processadas.c.id)
        ).scalar_one()
        conexao.execute(
            insert(palpites).values(
                partida_id=partida,
                acao_id=acao,
                rodada_id=rodada,
                tipo="palavra",
                texto="texto pessoal",
                resultado="erro",
                pontos=0,
            )
        )
        conexao.execute(
            insert(resultados_individuais).values(
                partida_id=partida, pontos=100, acertos=1, concluida=True
            )
        )
        conexao.execute(
            insert(participantes).values(
                partida_id=partida,
                nome="Convidado",
                nome_chave="convidado",
                anfitriao=True,
                inscricao=1,
            )
        )
        conexao.execute(
            insert(visitantes).values(
                segredo_resumo="v" * 64,
                jogador_vinculado_id=jogador_id,
                vinculado_em=datetime.now(UTC),
                demonstracao_utilizada=True,
            )
        )
    return jogador_id, partida


def teste_excluir_exige_confirmacao_remove_identidade_e_preserva_resultados(base_perfil):
    async def verificar():
        async with contexto(base_perfil) as (cliente, api, google, sessao):
            titular, partida = preencher_historico(base_perfil, sessao["jogador_id"])
            assert (
                await cliente.patch(
                    "/api/perfil", json={"nome_usuario": "Athos", "avatar_id": "capivara_zen"}
                )
            ).status_code == 200
            for corpo in [
                {},
                {"confirmacao": "excluir"},
                {"confirmacao": "EXCLUIR", "jogador_id": str(titular)},
            ]:
                resposta = await cliente.request("DELETE", "/api/perfil", json=corpo)
                assert resposta.status_code == 422
            assert (await cliente.get("/api/perfil")).status_code == 200
            resposta = await cliente.request(
                "DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"}
            )
            assert resposta.status_code == 204
            assert (await cliente.get("/api/perfil")).status_code == 401
            with base_perfil.connect() as conexao:
                conta = (
                    conexao.execute(select(jogadores).where(jogadores.c.id == titular))
                    .mappings()
                    .one()
                )
                assert conta["estado"] == "anonimizado"
                assert all(
                    conta[campo] is None
                    for campo in [
                        "google_sujeito",
                        "email",
                        "email_chave",
                        "nome_usuario",
                        "nome_chave",
                        "avatar_id",
                    ]
                )
                assert not conexao.execute(select(sessoes_autenticacao)).all()
                assert not conexao.execute(select(preferencias)).all()
                assert not conexao.execute(select(exposicoes_conteudo)).all()
                assert conexao.execute(select(partidas.c.configuracao)).scalar_one() == {}
                assert conexao.execute(select(palpites.c.texto)).scalar_one() is None
                assert conexao.execute(select(acoes_processadas.c.resultado)).scalar_one() is None
                assert (
                    conexao.execute(select(acoes_processadas.c.entrada_resumo)).scalar_one() is None
                )
                assert conexao.execute(select(resultados_individuais.c.pontos)).scalar_one() == 100
                convidado = conexao.execute(select(participantes)).mappings().one()
                assert (
                    convidado["anonimizado"]
                    and convidado["nome"] is None
                    and convidado["avatar_id"] is None
                )
                visitante = conexao.execute(select(visitantes)).mappings().one()
                assert (
                    visitante["jogador_vinculado_id"] is None
                    and visitante["demonstracao_utilizada"]
                    and visitante["vinculado_em"]
                )
            nova = await entrar(cliente)
            assert nova["jogador_id"] != str(titular) and nova["estado"] == "cadastro_pendente"

    executar(verificar())


def teste_falha_na_exclusao_reverte_limpeza_e_preserva_outra_conta(base_perfil):
    async def verificar():
        async with contexto(base_perfil) as (cliente, api, google, sessao):
            titular, partida = preencher_historico(base_perfil, sessao["jogador_id"])
            with base_perfil.begin() as conexao:
                outra = conexao.execute(
                    insert(jogadores)
                    .values(
                        google_sujeito="outra-conta",
                        email="outra@example.test",
                        email_chave="outra@example.test",
                    )
                    .returning(jogadores.c.id)
                ).scalar_one()
                conexao.execute(
                    text(
                        "CREATE FUNCTION impedir_anonimizacao() RETURNS trigger LANGUAGE plpgsql "
                        "AS $$ BEGIN IF NEW.estado = 'anonimizado' THEN "
                        "RAISE EXCEPTION 'Falha controlada apenas no teste'; "
                        "END IF; RETURN NEW; END $$"
                    )
                )
                conexao.execute(
                    text(
                        "CREATE TRIGGER falha_controlada BEFORE UPDATE ON jogadores "
                        "FOR EACH ROW EXECUTE FUNCTION impedir_anonimizacao()"
                    )
                )
            resposta = await cliente.request(
                "DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"}
            )
            assert resposta.status_code == 503
            assert (await cliente.get("/api/perfil")).status_code == 200
            with base_perfil.connect() as conexao:
                assert conexao.execute(select(palpites.c.texto)).scalar_one() == "texto pessoal"
                assert conexao.execute(select(exposicoes_conteudo)).all()
                assert conexao.execute(select(participantes.c.nome)).scalar_one() == "Convidado"
            with base_perfil.begin() as conexao:
                conexao.execute(text("DROP TRIGGER falha_controlada ON jogadores"))
            assert (
                await cliente.request("DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"})
            ).status_code == 204
            with base_perfil.connect() as conexao:
                assert (
                    conexao.execute(
                        select(jogadores.c.email).where(jogadores.c.id == outra)
                    ).scalar_one()
                    == "outra@example.test"
                )

    executar(verificar())


def teste_exclusao_concorrente_nao_recria_preferencias_nem_publica_partida_ativa(base_perfil):
    async def verificar():
        async with contexto(base_perfil) as (cliente, api, google, sessao):
            from uuid import UUID

            with base_perfil.begin() as conexao:
                conexao.execute(
                    insert(partidas).values(
                        jogador_id=UUID(sessao["jogador_id"]),
                        modo="individual",
                        configuracao={"nome": "privado"},
                    )
                )
            apagar, salvar = await asyncio.gather(
                cliente.request("DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"}),
                cliente.put("/api/preferencias", json={"tema": "escuro"}),
            )
            assert apagar.status_code == 204
            assert salvar.status_code in {200, 401}
            with base_perfil.connect() as conexao:
                assert not conexao.execute(select(preferencias)).all()
                assert not conexao.execute(select(resultados_individuais)).all()
                assert conexao.execute(select(partidas.c.estado)).scalar_one() == "preparada"
                assert conexao.execute(select(partidas.c.configuracao)).scalar_one() == {}

    executar(verificar())
