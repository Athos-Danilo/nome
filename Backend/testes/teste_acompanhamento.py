"""Acesso privado ao histórico e consulta pública de classificações."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import insert

from aplicacao.bancos.acoes import resultados_individuais
from aplicacao.bancos.partidas import rodadas
from testes.teste_individual import agir, ambiente, iniciar
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import (
    banco,  # noqa: F401
    criar_jogador,
    criar_partida,
)


def teste_historico_vazio_privado_e_ranking_publico(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            resposta = await cliente.get("/api/historico")
            assert resposta.status_code == 200, resposta.text
            assert resposta.json()["itens"] == []
            assert resposta.headers["Cache-Control"] == "no-store"
            estatisticas = (await cliente.get("/api/estatisticas")).json()
            assert estatisticas["resumo"]["melhor_pontuacao"] is None
            assert estatisticas["resumo"]["media_dicas"] is None
            assert estatisticas["por_tematica"] == {} and estatisticas["em_aberto"] is None
            cliente.cookies.clear()
            assert (await cliente.get("/api/historico")).status_code == 401
            assert (await cliente.get("/api/estatisticas")).status_code == 401
            ranking = await cliente.get("/api/rankings/pontos")
            assert ranking.status_code == 200, ranking.text
            assert ranking.json()["itens"] == []

    executar(verificar())


def teste_partida_real_erros_desistencia_e_publicacao_unica(base_perfil):  # noqa: F811
    from sqlalchemy import select

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            api.state.acompanhamento.catalogo = api.state.individual.catalogo
            estado = await iniciar(cliente)
            with base_perfil.connect() as c:
                palavra_id = c.scalar(
                    select(rodadas.c.palavra_id).where(
                        rodadas.c.id == UUID(estado["rodada_atual"]["rodada_id"])
                    )
                )
            palavra = await api.state.individual.catalogo.buscar(palavra_id, 1)
            estado = (
                await agir(cliente, estado, "palpites", palpite="Z" * len(palavra.resposta))
            ).json()
            estado = (await agir(cliente, estado, "palpites", palpite=palavra.resposta)).json()
            estado = (await agir(cliente, estado, "desistencia-palavra")).json()
            antes = (await cliente.get("/api/estatisticas")).json()
            assert antes["resumo"]["pontos"] == 0 and antes["em_aberto"]["pontuacao"] == 80
            estado = (await agir(cliente, estado, "encerramento")).json()
            for _ in range(2):
                dados = (await cliente.get("/api/estatisticas")).json()
                r = dados["resumo"]
                assert r["partidas_abandonadas"] == 1 and r["partidas_concluidas"] == 0
                assert r["pontos"] == r["melhor_pontuacao"] == 80
                assert r["palavras_acertadas"] == r["palavras_desistidas"] == r["erros"] == 1
                assert r["media_dicas"] == 2 and dados["em_aberto"] is None
                assert (await cliente.get("/api/rankings/palavras-acertadas")).json()["itens"][0][
                    "valor"
                ] == 1

    executar(verificar())


def teste_historico_galera_privacidade_paginacao_e_placar(base_perfil):  # noqa: F811
    from aplicacao.bancos.partidas import participantes

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            with base_perfil.begin() as c:
                titular = UUID(conta["jogador_id"])
                for _ in range(11):
                    partida = criar_partida(
                        c,
                        titular,
                        modo="galera",
                        estado="abandonada",
                        encerrada_em=datetime.now(UTC),
                        motivo_encerramento="desistencia",
                        resultado_galera="empate",
                    )
                    for inscricao, nome in enumerate(["Ana", "Bia"], 1):
                        c.execute(
                            insert(participantes).values(
                                partida_id=partida,
                                nome=nome,
                                nome_chave=nome.lower(),
                                inscricao=inscricao,
                                anfitriao=inscricao == 1,
                                pontuacao=200,
                            )
                        )
                outro = criar_jogador(c)
                criar_partida(c, outro, modo="galera")
            primeira = (await cliente.get("/api/historico?modo=galera")).json()
            segunda = (await cliente.get("/api/historico?modo=galera&pagina=2")).json()
            assert primeira["total"] == 11 and len(primeira["itens"]) == 10
            assert len(segunda["itens"]) == 1
            assert len({p["partida_id"] for p in primeira["itens"] + segunda["itens"]}) == 11
            assert primeira["itens"][0]["vencedores"] == ["Ana", "Bia"]
            assert primeira["itens"][0]["motivo_encerramento"] == "desistencia"
            assert (await cliente.get(f"/api/historico?jogador_id={outro}")).json()["total"] == 11
            assert (await cliente.get("/api/rankings/pontos")).json()["itens"] == []

    executar(verificar())


def teste_rankings_empate_negativos_nome_atual_e_anonimizacao(base_perfil):  # noqa: F811
    from sqlalchemy import update

    from aplicacao.bancos.identidade import jogadores

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            with base_perfil.begin() as c:
                titular = UUID(conta["jogador_id"])
                outro = criar_jogador(
                    c,
                    estado="ativo",
                    nome_usuario="OutraPessoa",
                    nome_chave="outrapessoa",
                    avatar_id="capivara_zen",
                )
                ids = [titular, outro]
                for i in range(10):
                    ids.append(
                        criar_jogador(
                            c,
                            estado="ativo",
                            nome_usuario=f"Pessoa_{i}",
                            nome_chave=f"pessoa_{i}",
                            avatar_id="capivara_zen",
                        )
                    )
                for i, jogador in enumerate(ids):
                    partida = criar_partida(
                        c,
                        jogador,
                        estado="abandonada",
                        pontuacao=100 if i < 2 else -100,
                        encerrada_em=datetime.now(UTC),
                    )
                    c.execute(
                        insert(resultados_individuais).values(
                            partida_id=partida,
                            pontos=100 if i < 2 else -100,
                            acertos=1 if i < 2 else 0,
                            concluida=False,
                        )
                    )
                criar_partida(c, titular, estado="em_andamento", pontuacao=10000)
            primeira = (await cliente.get("/api/rankings/pontos")).json()
            assert primeira["total"] == 12 and len(primeira["itens"]) == 10
            assert [r["posicao"] for r in primeira["itens"][:3]] == [1, 1, 3]
            assert set(primeira["itens"][0]) == {"posicao", "nome", "valor"}
            segunda = (await cliente.get("/api/rankings/pontos?pagina=2")).json()
            assert len(segunda["itens"]) == 2
            assert all(r["posicao"] == 3 for r in segunda["itens"])
            assert len({r["nome"] for r in primeira["itens"] + segunda["itens"]}) == 12
            concluidas = (await cliente.get("/api/rankings/partidas-concluidas")).json()
            assert all(r["valor"] == 0 and r["posicao"] == 1 for r in concluidas["itens"])
            with base_perfil.begin() as c:
                c.execute(
                    update(jogadores)
                    .where(jogadores.c.id == titular)
                    .values(nome_usuario="NovoNome", nome_chave="novonome")
                )
            assert "NovoNome" in str((await cliente.get("/api/rankings/pontos")).json())
            assert (
                await cliente.request("DELETE", "/api/perfil", json={"confirmacao": "EXCLUIR"})
            ).status_code == 204
            anonimo = (await cliente.get("/api/rankings/pontos")).json()
            assert "NovoNome" not in str(anonimo)
            assert any(
                r["nome"] == "Jogador excluído" and r["valor"] == 100 for r in anonimo["itens"]
            )
            assert (await cliente.get("/api/rankings/desconhecida")).status_code == 422

    executar(verificar())


def teste_estatisticas_encerradas_e_historico_filtrado(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            api.state.acompanhamento.catalogo = api.state.individual.catalogo
            api.state.individual.catalogo.itens[0].tematicas.append("objetos")
            with base_perfil.begin() as c:
                titular = UUID(conta["jogador_id"])
                for estado, pontos, acertos, concluida in [
                    ("concluida", 160, 2, True),
                    ("abandonada", -100, 0, False),
                ]:
                    partida = criar_partida(
                        c, titular, estado=estado, pontuacao=pontos, encerrada_em=datetime.now(UTC)
                    )
                    c.execute(
                        insert(resultados_individuais).values(
                            partida_id=partida, pontos=pontos, acertos=acertos, concluida=concluida
                        )
                    )
                    if concluida:
                        for ordem, estado_rodada, dica, pontuacao in [
                            (1, "acertada", 1, 100),
                            (2, "acertada", 3, 60),
                            (3, "desistida", 5, 0),
                        ]:
                            c.execute(
                                insert(rodadas).values(
                                    partida_id=partida,
                                    ordem=ordem,
                                    palavra_id=f"palavra-{ordem - 1}",
                                    revisao=1,
                                    dificuldade="facil",
                                    estado=estado_rodada,
                                    dica_atual=dica,
                                    pontuacao=pontuacao,
                                    apresentada_em=datetime.now(UTC),
                                )
                            )
                criar_partida(c, titular, estado="pausada", pontuacao=900)
                criar_partida(
                    c,
                    titular,
                    modo="galera",
                    estado="concluida",
                    pontuacao=5000,
                    encerrada_em=datetime.now(UTC),
                )
                outro = criar_jogador(c)
                criar_partida(c, outro, estado="concluida", encerrada_em=datetime.now(UTC))
            resposta = await cliente.get("/api/estatisticas")
            assert resposta.status_code == 200, resposta.text
            dados = resposta.json()
            assert dados["resumo"] == {
                "partidas_encerradas": 2,
                "partidas_concluidas": 1,
                "partidas_abandonadas": 1,
                "pontos": 60,
                "melhor_pontuacao": 160,
                "palavras_acertadas": 2,
                "palavras_desistidas": 1,
                "erros": 0,
                "media_dicas": 2.0,
            }
            assert dados["em_aberto"]["pontuacao"] == 900
            assert dados["por_tematica"]["objetos"]["palavras_acertadas"] == 1
            assert dados["por_tematica"]["paises"]["palavras_acertadas"] == 2
            assert dados["por_dificuldade"]["facil"]["palavras_desistidas"] == 1
            historico = (
                await cliente.get("/api/historico?modo=individual&estado=concluida")
            ).json()
            assert historico["total"] == 1
            assert historico["itens"][0]["acertos"] == 2
            assert "palavra_id" not in str(historico) and "resposta" not in str(historico)
            assert (await cliente.get("/api/historico?pagina=0")).status_code == 422
            assert (await cliente.get("/api/historico?modo=inexistente")).status_code == 422

    executar(verificar())
