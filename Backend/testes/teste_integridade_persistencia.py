"""Tentativas hostis e falhas transacionais em bases exclusivas de teste."""

from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import httpx
import pytest
from sqlalchemy import func, select, text, update

from aplicacao.bancos.acoes import acoes_processadas
from aplicacao.bancos.identidade import sessoes_autenticacao
from aplicacao.bancos.partidas import partidas, planos_individuais
from aplicacao.modulos.autenticacao.contratos import IdentidadeGoogle
from aplicacao.modulos.individual.catalogo import CatalogoIndividualMongo
from aplicacao.nucleo.configuracoes import Configuracoes
from testes.teste_autenticacao_http import GoogleControlado, entrar
from testes.teste_individual import ambiente, iniciar
from testes.teste_painel_galera import agir as agir_galera
from testes.teste_painel_galera import preparar as preparar_galera
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401


def teste_outra_conta_nao_consulta_joga_nem_exclui_titular(base_perfil):  # noqa: F811
    class OutroGoogle(GoogleControlado):
        async def autenticar(self, codigo, nonce, verificador):
            return IdentidadeGoogle("outro-integridade", "outro-integridade@example.test")

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            galera = await preparar_galera(api, cliente)
            galera = (await agir_galera(cliente, galera, "iniciar")).json()
            individual = await iniciar(cliente)
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
                        "/api/perfil",
                        json={"nome_usuario": "OutraConta", "avatar_id": "capivara_zen"},
                    )
                ).status_code == 200
                for caminho in [
                    f"/api/partidas/{individual['partida_id']}",
                    f"/api/partidas/galera/{galera['partida_id']}/painel",
                    f"/api/partidas/galera/{galera['partida_id']}/tempo",
                ]:
                    assert (await outro.get(caminho)).status_code == 404
                resposta = await outro.post(
                    f"/api/partidas/{individual['partida_id']}/dicas",
                    json={
                        "id_acao": str(uuid4()),
                        "versao_esperada": individual["versao"],
                        "rodada_id": individual["rodada_atual"]["rodada_id"],
                    },
                )
                assert resposta.status_code == 404
                assert (await agir_galera(outro, galera, "encerrar")).status_code == 404
                assert (
                    await outro.request(
                        "DELETE",
                        "/api/perfil",
                        json={"confirmacao": "EXCLUIR", "jogador_id": conta["jogador_id"]},
                    )
                ).status_code == 422
                assert (await outro.get(f"/api/historico?jogador_id={conta['jogador_id']}")).json()[
                    "total"
                ] == 0
                assert (await outro.get(f"/api/perfil?jogador_id={conta['jogador_id']}")).json()[
                    "jogador_id"
                ] == sessao["jogador_id"]
            assert (await cliente.get("/api/perfil")).json()["jogador_id"] == conta["jogador_id"]
            assert (
                await cliente.get(f"/api/partidas/{individual['partida_id']}")
            ).json() == individual
            assert (
                await cliente.get(f"/api/partidas/galera/{galera['partida_id']}/painel")
            ).json() == galera

    executar(verificar())


@pytest.mark.parametrize("modo", ["individual", "galera"])
def teste_falha_sql_reverte_acao_e_reenvio_nao_duplica(base_perfil, modo, caplog):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            if modo == "individual":
                estado = await iniciar(cliente)
                url = f"/api/partidas/{estado['partida_id']}/dicas"
                consulta = f"/api/partidas/{estado['partida_id']}"
                dados = {"rodada_id": estado["rodada_atual"]["rodada_id"]}
            else:
                estado = await preparar_galera(api, cliente)
                estado = (await agir_galera(cliente, estado, "iniciar")).json()
                url = f"/api/partidas/galera/{estado['partida_id']}/acoes"
                consulta = f"/api/partidas/galera/{estado['partida_id']}/painel"
                dados = {
                    "tipo": "letra",
                    "valor": "A",
                    "participante_id": estado["painel"]["participante_atual"],
                }
            dados.update(id_acao=str(uuid4()), versao_esperada=estado["versao"])
            adulterada = await cliente.post(url, json={**dados, "pontuacao": 999999})
            assert adulterada.status_code == 422
            assert (await cliente.get(consulta)).json() == estado
            identificador = UUID(estado["partida_id"])
            with base_perfil.begin() as c:
                anteriores = c.scalar(select(func.count()).select_from(acoes_processadas))
                c.execute(
                    text(
                        "CREATE FUNCTION falhar_integridade() RETURNS trigger LANGUAGE plpgsql "
                        "AS $$ BEGIN RAISE EXCEPTION 'segredo-ficticio-fase43'; END $$"
                    )
                )
                c.execute(
                    text(
                        "CREATE TRIGGER falha_integridade BEFORE UPDATE ON partidas "
                        "FOR EACH ROW WHEN (NEW.versao > OLD.versao) "
                        "EXECUTE FUNCTION falhar_integridade()"
                    )
                )
            resposta = await cliente.post(url, json=dados)
            assert resposta.status_code == 503
            assert resposta.json()["erro"]["codigo"] == "DADOS_INDISPONIVEIS"
            assert "segredo-ficticio-fase43" not in resposta.text + caplog.text
            assert resposta.headers["Cache-Control"] == "no-store"
            assert (await cliente.get(consulta)).json() == estado
            with base_perfil.begin() as c:
                assert (
                    c.scalar(select(partidas.c.versao).where(partidas.c.id == identificador))
                    == estado["versao"]
                )
                assert c.scalar(select(func.count()).select_from(acoes_processadas)) == anteriores
                c.execute(text("DROP TRIGGER falha_integridade ON partidas"))
            recuperada = await cliente.post(url, json=dados)
            assert recuperada.status_code == 200, recuperada.text
            repetida = await cliente.post(url, json=dados)
            assert repetida.status_code == 200 and repetida.json() == recuperada.json()
            with base_perfil.connect() as c:
                assert (
                    c.scalar(select(func.count()).select_from(acoes_processadas)) == anteriores + 1
                )

    executar(verificar())


def teste_exclusao_repetida_nao_reutiliza_sessao_nem_altera_resultado(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            await iniciar(cliente)
            cookie = cliente.cookies.get("decifra_sessao")
            resposta = await cliente.request(
                "DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"}
            )
            assert resposta.status_code == 204
            cliente.cookies.set("decifra_sessao", cookie)
            repetida = await cliente.request(
                "DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"}
            )
            assert repetida.status_code == 401
            assert (await cliente.get("/api/historico")).status_code == 401
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(sessoes_autenticacao)) == 0
                assert c.scalar(select(func.count()).select_from(acoes_processadas)) == 0

    executar(verificar())


def teste_mongo_indisponivel_nao_reserva_plano_nem_expoe_conexao(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            catalogo = api.state.individual.catalogo
            api.state.individual.catalogo = CatalogoIndividualMongo(
                Configuracoes(
                    _env_file=None,
                    ambiente="teste",
                    mongodb_url="mongodb://127.0.0.1:1/?serverSelectionTimeoutMS=100",
                )
            )
            resposta = await cliente.post(
                "/api/partidas/individual/configuracao",
                json={
                    "quantidade_palavras": 3,
                    "tematica": "paises",
                    "dificuldades": ["facil"],
                },
            )
            assert resposta.status_code == 503
            assert resposta.json()["erro"]["codigo"] == "CATALOGO_INDISPONIVEL"
            assert "mongodb" not in resposta.text.lower() and "127.0.0.1" not in resposta.text
            with base_perfil.connect() as c:
                assert c.scalar(select(func.count()).select_from(planos_individuais)) == 0
                assert c.scalar(select(func.count()).select_from(partidas)) == 0
            api.state.individual.catalogo = catalogo
            assert (await iniciar(cliente))["estado"] == "em_andamento"

    executar(verificar())


def teste_sessao_expirada_nao_le_nem_altera_progresso(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            estado = await iniciar(cliente)
            with base_perfil.begin() as c:
                c.execute(
                    update(sessoes_autenticacao)
                    .where(sessoes_autenticacao.c.jogador_id == UUID(conta["jogador_id"]))
                    .values(
                        criado_em=datetime.now(UTC) - timedelta(days=8),
                        expira_em=datetime.now(UTC) - timedelta(seconds=1),
                    )
                )
            for caminho in [
                "/api/perfil",
                "/api/preferencias",
                "/api/historico",
                "/api/estatisticas",
                f"/api/partidas/{estado['partida_id']}",
            ]:
                assert (await cliente.get(caminho)).status_code == 401
            assert (
                await cliente.request("DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"})
            ).status_code == 401
            with base_perfil.connect() as c:
                assert c.scalar(select(partidas.c.versao)) == estado["versao"]
                assert c.scalar(select(partidas.c.pontuacao)) == 0

    executar(verificar())
