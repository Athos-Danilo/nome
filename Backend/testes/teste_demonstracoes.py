"""Uma demonstração por navegador e vínculo sem cópia de progresso."""

from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import httpx
from sqlalchemy import func, insert, select, update

from aplicacao.bancos.acoes import acoes_processadas, exposicoes_conteudo, resultados_individuais
from aplicacao.bancos.identidade import visitantes
from aplicacao.bancos.partidas import partidas, rodadas
from aplicacao.nucleo.configuracoes import Configuracoes
from aplicacao.principal import criar_aplicacao
from testes.teste_autenticacao_http import GoogleControlado, entrar
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401


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

    async def sortear_controlado():
        return [
            {"id": f"teste-{i}", "revisao": 1, "dificuldade": "facil", "tematica": "animais"}
            for i in range(3)
        ]

    api.state.demonstracoes.sortear = sortear_controlado
    async with (
        api.router.lifespan_context(api),
        httpx.AsyncClient(
            transport=httpx.ASGITransport(app=api),
            base_url="http://localhost:5173",
            headers={"Origin": "http://localhost:5173"},
        ) as cliente,
    ):
        yield api, cliente


async def identificar(cliente):
    resposta = await cliente.post("/api/visitantes", json={})
    assert resposta.status_code == 200
    cliente.headers["X-Decifra-CSRF"] = resposta.json()["token_csrf"]
    return resposta.json()


def teste_visitante_persiste_sem_expor_segredo_e_recusa_origem(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente):
            resposta = await cliente.post(
                "/api/visitantes", headers={"Origin": "https://outro.example"}
            )
            assert resposta.status_code == 403
            primeiro = await identificar(cliente)
            segredo = cliente.cookies.get("decifra_visitante")
            assert segredo and segredo not in str(primeiro)
            assert primeiro["pode_iniciar"] and not primeiro["demonstracao_utilizada"]
            assert primeiro == await identificar(cliente)
            assert (
                await cliente.post("/api/visitantes", json={"pontuacao": 999})
            ).status_code == 422
            assert (await cliente.get("/api/demonstracoes/atual")).status_code == 404
            with base_perfil.connect() as conexao:
                assert conexao.scalar(select(func.count()).select_from(visitantes)) == 1
                assert conexao.scalar(select(visitantes.c.segredo_resumo)) != segredo

    executar(verificar())


def teste_criacao_recarga_repeticao_e_protecao_da_demonstracao(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente):
            await identificar(cliente)
            negada = await cliente.post(
                "/api/demonstracoes", json={}, headers={"X-Decifra-CSRF": "invalido"}
            )
            assert negada.status_code == 403
            primeira = await cliente.post("/api/demonstracoes", json={})
            assert primeira.status_code == 200
            dados = primeira.json()
            assert dados["quantidade_palavras"] == 3 and dados["dificuldade"] == "facil"
            assert not any(campo in str(dados) for campo in ["palavra_id", "resposta", "dicas"])
            assert (await cliente.post("/api/demonstracoes", json={})).json() == dados
            assert (await cliente.get("/api/demonstracoes/atual")).json() == dados
            assert not (await identificar(cliente))["pode_iniciar"]
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
            ) as outro:
                assert (await outro.get("/api/demonstracoes/atual")).status_code == 401
            with base_perfil.connect() as conexao:
                assert conexao.scalar(select(func.count()).select_from(partidas)) == 1
                registros = conexao.execute(select(rodadas)).mappings().all()
                assert len(registros) == 3 and all(r["dificuldade"] == "facil" for r in registros)
                assert all(r["estado"] == "reservada" for r in registros)

    executar(verificar())


def teste_login_no_meio_preserva_partida_e_vinculo_idempotente(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente):
            await identificar(cliente)
            inicio = (await cliente.post("/api/demonstracoes", json={})).json()
            partida_id = UUID(inicio["partida_id"])
            with base_perfil.begin() as conexao:
                conexao.execute(
                    update(partidas)
                    .where(partidas.c.id == partida_id)
                    .values(estado="em_andamento", pontuacao=80, versao=3)
                )
                rodada_id = conexao.scalar(
                    select(rodadas.c.id)
                    .where(rodadas.c.partida_id == partida_id)
                    .order_by(rodadas.c.ordem)
                )
                conexao.execute(
                    update(rodadas)
                    .where(rodadas.c.id == rodada_id)
                    .values(estado="apresentada", dica_atual=3, apresentada_em=datetime.now(UTC))
                )
                conexao.execute(insert(exposicoes_conteudo).values(rodada_id=rodada_id))
                conexao.execute(
                    insert(acoes_processadas).values(
                        partida_id=partida_id,
                        id_acao=uuid4(),
                        tipo="dica",
                        versao_aplicada=3,
                        entrada_resumo="a" * 64,
                        resultado={"dica_atual": 3},
                    )
                )
            sessao = await entrar(cliente)
            cliente.headers["X-Decifra-CSRF"] = sessao["token_csrf"]
            for _ in range(2):
                vinculo = await cliente.post("/api/demonstracoes/vinculo", json={})
                assert vinculo.status_code == 200
                assert vinculo.json()["partida_id"] == str(partida_id)
            with base_perfil.connect() as conexao:
                registro = conexao.execute(select(partidas)).mappings().one()
                assert (
                    str(registro["jogador_id"]) == sessao["jogador_id"]
                    and registro["visitante_id"] is None
                )
                assert registro["pontuacao"] == 80 and registro["versao"] == 3
                assert (
                    conexao.scalar(select(rodadas.c.dica_atual).where(rodadas.c.id == rodada_id))
                    == 3
                )
                assert conexao.scalar(select(func.count()).select_from(resultados_individuais)) == 0
                assert conexao.scalar(select(func.count()).select_from(acoes_processadas)) == 1
            assert (await cliente.get("/api/demonstracoes/atual")).status_code == 403
            await identificar(cliente)
            assert (await cliente.post("/api/demonstracoes", json={})).status_code == 409

    executar(verificar())


def teste_conflito_preserva_individual_e_finalizada_entra_sem_duplicar_resultado(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente):
            await identificar(cliente)
            demonstracao_id = UUID(
                (await cliente.post("/api/demonstracoes", json={})).json()["partida_id"]
            )
            sessao = await entrar(cliente)
            cliente.headers["X-Decifra-CSRF"] = sessao["token_csrf"]
            with base_perfil.begin() as conexao:
                existente = conexao.scalar(
                    insert(partidas)
                    .values(
                        jogador_id=UUID(sessao["jogador_id"]), modo="individual", configuracao={}
                    )
                    .returning(partidas.c.id)
                )
            conflito = await cliente.post("/api/demonstracoes/vinculo", json={})
            assert (
                conflito.status_code == 409
                and conflito.json()["erro"]["codigo"] == "INDIVIDUAL_EM_ABERTO"
            )
            with base_perfil.begin() as conexao:
                assert conexao.scalar(
                    select(partidas.c.visitante_id).where(partidas.c.id == demonstracao_id)
                )
                conexao.execute(
                    update(partidas)
                    .where(partidas.c.id == demonstracao_id)
                    .values(estado="concluida", encerrada_em=datetime.now(UTC), pontuacao=240)
                )
                conexao.execute(
                    insert(resultados_individuais).values(
                        partida_id=demonstracao_id, pontos=240, acertos=3, concluida=True
                    )
                )
            for _ in range(2):
                assert (
                    await cliente.post("/api/demonstracoes/vinculo", json={})
                ).status_code == 200
            with base_perfil.connect() as conexao:
                assert (
                    conexao.scalar(select(partidas.c.estado).where(partidas.c.id == existente))
                    == "preparada"
                )
                assert conexao.scalar(select(func.count()).select_from(resultados_individuais)) == 1
                assert conexao.scalar(select(resultados_individuais.c.pontos)) == 240

    executar(verificar())


def teste_prazo_de_sete_dias_nao_libera_nova_demonstracao(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente):
            await identificar(cliente)
            partida_id = UUID(
                (await cliente.post("/api/demonstracoes", json={})).json()["partida_id"]
            )
            with base_perfil.begin() as conexao:
                conexao.execute(
                    update(partidas)
                    .where(partidas.c.id == partida_id)
                    .values(criado_em=datetime.now(UTC) - timedelta(days=7, seconds=1))
                )
            sessao = await entrar(cliente)
            cliente.headers["X-Decifra-CSRF"] = sessao["token_csrf"]
            resposta = await cliente.post("/api/demonstracoes/vinculo", json={})
            assert (
                resposta.status_code == 409
                and resposta.json()["erro"]["codigo"] == "PRAZO_VINCULO_ENCERRADO"
            )
            situacao = await identificar(cliente)
            assert situacao["demonstracao_utilizada"] and not situacao["pode_iniciar"]

    executar(verificar())


def teste_sorteio_invalido_reverte_reserva_e_nao_consume_teste(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente):
            await identificar(cliente)

            async def insuficiente():
                return [
                    {"id": "teste-0", "revisao": 1, "dificuldade": "facil", "tematica": "animais"}
                ]

            api.state.demonstracoes.sortear = insuficiente
            assert (await cliente.post("/api/demonstracoes", json={})).status_code == 409
            with base_perfil.connect() as conexao:
                assert not conexao.scalar(select(visitantes.c.demonstracao_utilizada))
                assert conexao.scalar(select(func.count()).select_from(partidas)) == 0

    executar(verificar())


def teste_requisicoes_concorrentes_criam_e_vinculam_uma_unica_partida(base_perfil):  # noqa: F811
    import asyncio

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente):
            await identificar(cliente)
            respostas = await asyncio.gather(
                *(cliente.post("/api/demonstracoes", json={}) for _ in range(3))
            )
            assert all(r.status_code == 200 for r in respostas)
            assert len({r.json()["partida_id"] for r in respostas}) == 1
            sessao = await entrar(cliente)
            cliente.headers["X-Decifra-CSRF"] = sessao["token_csrf"]
            respostas = await asyncio.gather(
                *(cliente.post("/api/demonstracoes/vinculo", json={}) for _ in range(3))
            )
            assert all(r.status_code == 200 for r in respostas)
            with base_perfil.connect() as conexao:
                assert conexao.scalar(select(func.count()).select_from(partidas)) == 1
                assert conexao.scalar(select(func.count()).select_from(rodadas)) == 3

    executar(verificar())


def teste_exclusao_nao_permite_reivindicar_novamente_a_demonstracao(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente):
            await identificar(cliente)
            await cliente.post("/api/demonstracoes", json={})
            sessao = await entrar(cliente)
            cliente.headers["X-Decifra-CSRF"] = sessao["token_csrf"]
            assert (await cliente.post("/api/demonstracoes/vinculo", json={})).status_code == 200
            assert (
                await cliente.request("DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"})
            ).status_code == 204
            sessao = await entrar(cliente)
            cliente.headers["X-Decifra-CSRF"] = sessao["token_csrf"]
            resposta = await cliente.post("/api/demonstracoes/vinculo", json={})
            assert (
                resposta.status_code == 409
                and resposta.json()["erro"]["codigo"] == "DEMONSTRACAO_JA_VINCULADA"
            )
            assert not (await identificar(cliente))["pode_iniciar"]

    executar(verificar())
