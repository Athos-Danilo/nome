"""Restrições reais do PostgreSQL em base explicitamente destinada a testes."""

import os
from collections.abc import Iterator
from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import Connection, Engine, create_engine, insert, update
from sqlalchemy.engine import make_url
from sqlalchemy.exc import IntegrityError

from aplicacao.bancos.acoes import acoes_processadas, interrupcoes, penalidades
from aplicacao.bancos.esquema import metadados
from aplicacao.bancos.identidade import jogadores
from aplicacao.bancos.partidas import participantes, partidas, rodadas


@pytest.fixture(scope="module")
def banco() -> Iterator[Engine]:
    endereco = os.environ.get("DECIFRA_POSTGRESQL_TESTE_URL")
    if not endereco:
        pytest.skip("Defina DECIFRA_POSTGRESQL_TESTE_URL para executar testes no PostgreSQL.")
    url = make_url(endereco)
    if url.host not in {"localhost", "127.0.0.1"} or not (url.database or "").endswith("_teste"):
        pytest.fail("Os testes exigem banco local com nome terminado em _teste.")
    anterior = os.environ.get("DECIFRA_POSTGRESQL_URL")
    os.environ["DECIFRA_POSTGRESQL_URL"] = endereco
    try:
        command.upgrade(Config("alembic.ini"), "head")
        motor = create_engine(url.set(drivername="postgresql+psycopg"))
        try:
            yield motor
        finally:
            motor.dispose()
    finally:
        if anterior is None:
            os.environ.pop("DECIFRA_POSTGRESQL_URL", None)
        else:
            os.environ["DECIFRA_POSTGRESQL_URL"] = anterior


@pytest.fixture
def conexao(banco: Engine) -> Iterator[Connection]:
    with banco.connect() as aberta, aberta.begin() as transacao:
        yield aberta
        transacao.rollback()


def criar_jogador(conexao: Connection, **campos) -> UUID:
    chave = uuid4().hex
    return conexao.execute(
        insert(jogadores)
        .values(
            google_sujeito=chave,
            email=f"{chave}@example.test",
            email_chave=chave,
            **campos,
        )
        .returning(jogadores.c.id)
    ).scalar_one()


def criar_partida(conexao: Connection, jogador_id: UUID, modo="individual", **campos) -> UUID:
    return conexao.execute(
        insert(partidas)
        .values(
            jogador_id=jogador_id,
            modo=modo,
            configuracao={},
            **campos,
        )
        .returning(partidas.c.id)
    ).scalar_one()


def teste_migracao_equivale_ao_modelo(conexao: Connection) -> None:
    contexto = MigrationContext.configure(conexao, opts={"compare_type": True})
    assert compare_metadata(contexto, metadados) == []


def teste_so_uma_individual_em_aberto_mas_permite_galera(conexao: Connection) -> None:
    jogador = criar_jogador(conexao)
    criar_partida(conexao, jogador)
    criar_partida(conexao, jogador, "galera")
    with pytest.raises(IntegrityError), conexao.begin_nested():
        criar_partida(conexao, jogador)


def teste_pontos_negativos_e_nova_partida_apos_encerrar(conexao: Connection) -> None:
    jogador = criar_jogador(conexao)
    criar_partida(
        conexao, jogador, estado="abandonada", pontuacao=-200, encerrada_em=datetime.now(UTC)
    )
    criar_partida(conexao, jogador)


def teste_anonimizacao_remove_identidade_e_libera_novo_google(conexao: Connection) -> None:
    jogador = criar_jogador(conexao)
    original = conexao.execute(jogadores.select().where(jogadores.c.id == jogador)).mappings().one()
    partida = criar_partida(conexao, jogador)
    with pytest.raises(IntegrityError), conexao.begin_nested():
        conexao.execute(
            update(jogadores)
            .where(jogadores.c.id == jogador)
            .values(estado="anonimizado", anonimizado_em=datetime.now(UTC))
        )
    conexao.execute(
        update(jogadores)
        .where(jogadores.c.id == jogador)
        .values(
            estado="anonimizado",
            anonimizado_em=datetime.now(UTC),
            google_sujeito=None,
            email=None,
            email_chave=None,
            nome_usuario=None,
            nome_chave=None,
            avatar_id=None,
        )
    )
    novo = conexao.execute(
        insert(jogadores)
        .values(
            google_sujeito=original["google_sujeito"],
            email=original["email"],
            email_chave=original["email_chave"],
        )
        .returning(jogadores.c.id)
    ).scalar_one()
    assert novo != jogador
    assert (
        conexao.execute(partidas.select().where(partidas.c.id == partida))
        .mappings()
        .one()["jogador_id"]
        == jogador
    )


def teste_nome_normalizado_unico(conexao: Connection) -> None:
    criar_jogador(conexao, nome_usuario="José", nome_chave="jose")
    with pytest.raises(IntegrityError), conexao.begin_nested():
        criar_jogador(conexao, nome_usuario="JOSE", nome_chave="jose")


def teste_nao_repete_conteudo_na_partida(conexao: Connection) -> None:
    partida = criar_partida(conexao, criar_jogador(conexao))
    campos = dict(
        partida_id=partida, palavra_id="girafa", revisao=1, dificuldade="facil", dica_atual=1
    )
    conexao.execute(insert(rodadas).values(ordem=1, **campos))
    with pytest.raises(IntegrityError), conexao.begin_nested():
        conexao.execute(insert(rodadas).values(ordem=2, **campos))


def teste_acao_e_penalidade_nao_duplicam(conexao: Connection) -> None:
    partida = criar_partida(conexao, criar_jogador(conexao))
    campos = dict(partida_id=partida, id_acao=uuid4(), tipo="pausa", versao_aplicada=1)
    conexao.execute(insert(acoes_processadas).values(**campos))
    with pytest.raises(IntegrityError), conexao.begin_nested():
        conexao.execute(insert(acoes_processadas).values(**campos))
    interrupcao = conexao.execute(
        insert(interrupcoes)
        .values(partida_id=partida, evento_id=uuid4(), origem="botao", classificacao="pausa")
        .returning(interrupcoes.c.id)
    ).scalar_one()
    campos = dict(partida_id=partida, interrupcao_id=interrupcao, pontos=-100)
    conexao.execute(insert(penalidades).values(**campos))
    with pytest.raises(IntegrityError), conexao.begin_nested():
        conexao.execute(insert(penalidades).values(**campos))


def teste_participante_de_outra_partida_nao_pode_receber_vez(conexao: Connection) -> None:
    from aplicacao.bancos.partidas import sessoes_galera

    jogador = criar_jogador(conexao)
    primeira = criar_partida(conexao, jogador, "galera")
    segunda = criar_partida(conexao, jogador, "galera")
    participante = conexao.execute(
        insert(participantes)
        .values(partida_id=primeira, nome="Ana", nome_chave="ana", anfitriao=True, inscricao=1)
        .returning(participantes.c.id)
    ).scalar_one()
    with pytest.raises(IntegrityError), conexao.begin_nested():
        conexao.execute(
            insert(sessoes_galera).values(
                partida_id=segunda,
                numero=1,
                tematica_id="animais",
                participante_atual_id=participante,
            )
        )


def teste_mesma_posicao_nao_pode_pontuar_duas_vezes(conexao: Connection) -> None:
    from aplicacao.bancos.acoes import posicoes_reveladas
    from aplicacao.bancos.partidas import sessoes_galera

    partida = criar_partida(conexao, criar_jogador(conexao), "galera")
    participante = conexao.execute(
        insert(participantes)
        .values(partida_id=partida, nome="Ana", nome_chave="ana", anfitriao=True, inscricao=1)
        .returning(participantes.c.id)
    ).scalar_one()
    sessao = conexao.execute(
        insert(sessoes_galera)
        .values(partida_id=partida, numero=1, tematica_id="animais")
        .returning(sessoes_galera.c.id)
    ).scalar_one()
    rodada = conexao.execute(
        insert(rodadas)
        .values(
            partida_id=partida,
            sessao_id=sessao,
            ordem=1,
            palavra_id="girafa",
            revisao=1,
            dificuldade="facil",
        )
        .returning(rodadas.c.id)
    ).scalar_one()
    for numero in range(2):
        acao = conexao.execute(
            insert(acoes_processadas)
            .values(partida_id=partida, id_acao=uuid4(), tipo="letra", versao_aplicada=numero + 1)
            .returning(acoes_processadas.c.id)
        ).scalar_one()
        comando = insert(posicoes_reveladas).values(
            partida_id=partida,
            rodada_id=rodada,
            posicao=0,
            participante_id=participante,
            acao_id=acao,
        )
        if numero == 0:
            conexao.execute(comando)
        else:
            with pytest.raises(IntegrityError), conexao.begin_nested():
                conexao.execute(comando)


def teste_resultado_individual_so_e_publicado_uma_vez(conexao: Connection) -> None:
    from aplicacao.bancos.acoes import resultados_individuais

    partida = criar_partida(
        conexao, criar_jogador(conexao), estado="concluida", encerrada_em=datetime.now(UTC)
    )
    comando = insert(resultados_individuais).values(
        partida_id=partida, pontos=-100, acertos=1, concluida=True
    )
    conexao.execute(comando)
    with pytest.raises(IntegrityError), conexao.begin_nested():
        conexao.execute(comando)
