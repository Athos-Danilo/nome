"""Cinco sessões persistidas com um, dois e três participantes, sem dados reais."""

from uuid import UUID

import pytest
from sqlalchemy import func, select

from aplicacao.bancos.acoes import exposicoes_conteudo, resultados_individuais
from aplicacao.bancos.conteudo import chave_da_resposta
from aplicacao.bancos.partidas import ordens_participantes, participantes, rodadas, sessoes_galera
from testes.teste_individual import ambiente
from testes.teste_painel_galera import agir
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401


@pytest.mark.parametrize("pessoas", [1, 2, 3])
def teste_cinco_sessoes_tema_repetido_nao_repetem_palavras_nem_publicam_ranking(
    base_perfil,  # noqa: F811
    pessoas,
):
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            catalogo = api.state.individual.catalogo
            modelo = catalogo.itens[0]
            catalogo.itens = [
                modelo.model_copy(
                    update={
                        "id": f"aceite-galera-{i}",
                        "resposta": f"PALAVRA {chr(65 + i)}",
                        "resposta_chave": chave_da_resposta(f"PALAVRA {chr(65 + i)}"),
                    }
                )
                for i in range(18)
            ]
            api.state.galera.catalogo = catalogo
            configuracao = await cliente.post(
                "/api/partidas/galera/configuracao",
                json={
                    "convidados": [
                        {"nome": nome, "avatar_id": "coruja_sabia"}
                        for nome in ["Amigo48", "Parceiro48"][: pessoas - 1]
                    ],
                    "dificuldade": "facil",
                    "quantidade_sessoes": 5,
                    "modo_tematicas": "manual",
                    "tematicas": ["paises"] * 5,
                },
            )
            assert configuracao.status_code == 200 and configuracao.json()["pode_criar"]
            criacao = await cliente.post(
                "/api/partidas/galera",
                json={
                    "plano_id": configuracao.json()["plano_id"],
                },
            )
            assert criacao.status_code == 200
            estado = (await agir(cliente, criacao.json(), "iniciar")).json()
            partida_id = UUID(estado["partida_id"])
            sessoes_vistas = set()
            esperados = 0
            while estado["painel"]["estado"] == "em_andamento":
                painel = estado["painel"]
                sessao_id = UUID(painel["sessao_id"])
                sessoes_vistas.add(sessao_id)
                assert len(sessoes_vistas) <= 5
                indice = next(i for i, palavra in enumerate(painel["palavras"]) if None in palavra)
                with base_perfil.connect() as c:
                    reserva = (
                        c.execute(
                            select(rodadas).where(
                                rodadas.c.sessao_id == sessao_id,
                                rodadas.c.ordem == indice + 1,
                            )
                        )
                        .mappings()
                        .one()
                    )
                palavra = await catalogo.buscar(reserva["palavra_id"], reserva["revisao"])
                esperados += sum(c.isalnum() for c in palavra.resposta) * 100
                resposta = await agir(
                    cliente,
                    estado,
                    "palpite",
                    palavra=indice,
                    valor=palavra.resposta,
                    participante_id=painel["participante_atual"],
                )
                assert resposta.status_code == 200, resposta.text
                estado = resposta.json()
            assert estado["estado"] == "concluida" and len(sessoes_vistas) == 5
            assert sum(p["pontuacao"] for p in estado["participantes"]) == esperados
            assert len(estado["resumo_sessoes"]) == 5
            with base_perfil.connect() as c:
                ids = list(
                    c.scalars(
                        select(rodadas.c.palavra_id).where(
                            rodadas.c.partida_id == partida_id,
                        )
                    )
                )
                assert len(ids) == len(set(ids)) == pessoas * 5
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(participantes)
                        .where(
                            participantes.c.partida_id == partida_id,
                        )
                    )
                    == pessoas
                )
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(sessoes_galera)
                        .where(
                            sessoes_galera.c.partida_id == partida_id,
                        )
                    )
                    == 5
                )
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(ordens_participantes)
                        .where(
                            ordens_participantes.c.partida_id == partida_id,
                        )
                    )
                    == pessoas * 5
                )
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(exposicoes_conteudo)
                        .join(rodadas)
                        .where(rodadas.c.partida_id == partida_id)
                    )
                    == pessoas * 5
                )
                assert c.scalar(select(func.count()).select_from(resultados_individuais)) == 0
            for categoria in ["pontos", "palavras-acertadas", "partidas-concluidas"]:
                assert (await cliente.get(f"/api/rankings/{categoria}")).json()["itens"] == []

    executar(verificar())
