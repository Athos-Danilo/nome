"""Fluxo HTTP e persistência reais em banco local isolado de testes."""

import asyncio
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import httpx
from pydantic import SecretStr
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import create_async_engine

from aplicacao.bancos.identidade import jogadores, sessoes_autenticacao, tentativas_login
from aplicacao.modulos.autenticacao.contratos import IdentidadeGoogle, TentativaLogin
from aplicacao.modulos.autenticacao.repositorio import AutenticacaoPostgresql
from aplicacao.nucleo.configuracoes import Configuracoes
from aplicacao.principal import criar_aplicacao
from testes.teste_autenticacao_http import GoogleControlado, entrar, iniciar
from testes.teste_persistencia import banco  # noqa: F401


def teste_google_persiste_sessao_rotaciona_e_rejeita_email_de_outra_identidade(banco):  # noqa: F811
    chave = uuid4().hex

    class GoogleDeTeste(GoogleControlado):
        async def autenticar(self, codigo, nonce, verificador):
            return IdentidadeGoogle(self.sujeito, f"{chave}@example.test")

    async def executar():
        google = GoogleDeTeste()
        google.sujeito = chave
        api = criar_aplicacao(
            Configuracoes(
                _env_file=None,
                ambiente="teste",
                postgresql_url=SecretStr(banco.url.render_as_string(hide_password=False)),
                google_cliente_id="cliente-de-teste",
                google_cliente_segredo=SecretStr("segredo-ficticio"),
            ),
            provedor_google=google,
        )
        async with (
            api.router.lifespan_context(api),
            httpx.AsyncClient(
                transport=httpx.ASGITransport(app=api), base_url="http://localhost:5173"
            ) as cliente,
        ):
            conta = await entrar(cliente)
            with banco.connect() as conexao:
                persistida = (
                    conexao.execute(
                        select(sessoes_autenticacao)
                        .join(jogadores, jogadores.c.id == sessoes_autenticacao.c.jogador_id)
                        .where(jogadores.c.google_sujeito == chave)
                    )
                    .mappings()
                    .one()
                )
                assert persistida["segredo_resumo"] != cliente.cookies.get("decifra_sessao")
            segunda = await entrar(cliente)
            assert segunda["jogador_id"] == conta["jogador_id"]
            google.sujeito = "outro-" + chave
            estado = await iniciar(cliente)
            resposta = await cliente.get(
                "/api/autenticacao/google/retorno", params={"state": estado, "code": "codigo-teste"}
            )
            assert resposta.status_code == 409
            assert resposta.json()["erro"]["codigo"] == "EMAIL_INDISPONIVEL"
            assert (await cliente.get("/api/autenticacao/sessao")).json()["jogador_id"] == conta[
                "jogador_id"
            ]
            with banco.begin() as conexao:
                conexao.execute(
                    update(sessoes_autenticacao)
                    .where(
                        sessoes_autenticacao.c.segredo_resumo != persistida["segredo_resumo"],
                        sessoes_autenticacao.c.jogador_id == persistida["jogador_id"],
                    )
                    .values(
                        criado_em=datetime.now(UTC) - timedelta(days=2),
                        expira_em=datetime.now(UTC) - timedelta(days=1),
                    )
                )
            assert (await cliente.get("/api/autenticacao/sessao")).status_code == 401

    try:
        asyncio.run(executar(), loop_factory=asyncio.SelectorEventLoop)
    finally:
        with banco.begin() as conexao:
            ids = select(jogadores.c.id).where(
                jogadores.c.google_sujeito.in_([chave, "outro-" + chave])
            )
            conexao.execute(
                delete(sessoes_autenticacao).where(sessoes_autenticacao.c.jogador_id.in_(ids))
            )
            conexao.execute(
                delete(jogadores).where(jogadores.c.google_sujeito.in_([chave, "outro-" + chave]))
            )


def teste_concorrencia_consumo_unico_e_mesma_conta_google(banco):  # noqa: F811
    chave = uuid4().hex
    estado, navegador = chave * 2, uuid4().hex * 2
    resumos = [uuid4().hex * 2, uuid4().hex * 2]

    async def executar():
        motor = create_async_engine(banco.url)
        repositorio = AutenticacaoPostgresql(motor)
        agora = datetime.now(UTC)
        try:
            await repositorio.guardar_tentativa(
                TentativaLogin(
                    estado, navegador, "nonce", "verificador", agora + timedelta(minutes=10)
                )
            )
            assert await repositorio.consumir_tentativa(estado, "outro", agora) is None
            resultados = await asyncio.gather(
                repositorio.consumir_tentativa(estado, navegador, agora),
                repositorio.consumir_tentativa(estado, navegador, agora),
            )
            assert sum(resultado is not None for resultado in resultados) == 1
            identidade = IdentidadeGoogle(chave, f"{chave}@example.test")
            await asyncio.gather(
                *(
                    repositorio.abrir_sessao(
                        identidade, resumo, None, agora, agora + timedelta(days=7)
                    )
                    for resumo in resumos
                )
            )
            contas = [await repositorio.consultar_sessao(resumo, agora) for resumo in resumos]
            assert contas[0].jogador_id == contas[1].jogador_id
            assert await repositorio.consultar_sessao("desconhecida", agora) is None
            await repositorio.revogar_sessao(resumos[0], agora)
            assert await repositorio.consultar_sessao(resumos[0], agora) is None
            assert await repositorio.consultar_sessao(resumos[1], agora) is not None
        finally:
            await motor.dispose()

    try:
        asyncio.run(executar(), loop_factory=asyncio.SelectorEventLoop)
    finally:
        with banco.begin() as conexao:
            conexao.execute(
                delete(tentativas_login).where(tentativas_login.c.estado_resumo == estado)
            )
            ids = select(jogadores.c.id).where(jogadores.c.google_sujeito == chave)
            conexao.execute(
                delete(sessoes_autenticacao).where(sessoes_autenticacao.c.jogador_id.in_(ids))
            )
            conexao.execute(delete(jogadores).where(jogadores.c.google_sujeito == chave))


def teste_identidade_anonimizada_nao_autoriza_e_novo_login_comeca_do_zero(banco):  # noqa: F811
    chave = uuid4().hex
    resumos = [uuid4().hex * 2, uuid4().hex * 2]
    ids = []

    async def executar():
        motor = create_async_engine(banco.url)
        repositorio = AutenticacaoPostgresql(motor)
        agora = datetime.now(UTC)
        identidade = IdentidadeGoogle(chave, f"{chave}@example.test")
        try:
            await repositorio.abrir_sessao(
                identidade, resumos[0], None, agora, agora + timedelta(days=7)
            )
            anterior = await repositorio.consultar_sessao(resumos[0], agora)
            ids.append(anterior.jogador_id)
            # Simula o estado final aprovado; o serviço de exclusão pertence à fase 17.
            with banco.begin() as conexao:
                conexao.execute(
                    update(jogadores)
                    .where(jogadores.c.id == anterior.jogador_id)
                    .values(
                        estado="anonimizado",
                        anonimizado_em=agora,
                        google_sujeito=None,
                        email=None,
                        email_chave=None,
                        nome_usuario=None,
                        nome_chave=None,
                        avatar_id=None,
                    )
                )
            assert await repositorio.consultar_sessao(resumos[0], agora) is None
            await repositorio.abrir_sessao(
                identidade, resumos[1], None, agora, agora + timedelta(days=7)
            )
            nova = await repositorio.consultar_sessao(resumos[1], agora)
            ids.append(nova.jogador_id)
            assert nova.jogador_id != anterior.jogador_id
            assert nova.estado == "cadastro_pendente"
            assert nova.nome_usuario is None
        finally:
            await motor.dispose()

    try:
        asyncio.run(executar(), loop_factory=asyncio.SelectorEventLoop)
    finally:
        with banco.begin() as conexao:
            conexao.execute(
                delete(sessoes_autenticacao).where(sessoes_autenticacao.c.jogador_id.in_(ids))
            )
            conexao.execute(delete(jogadores).where(jogadores.c.id.in_(ids)))
