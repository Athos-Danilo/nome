"""Painel da galera por HTTP real e PostgreSQL isolado."""

import asyncio
from uuid import UUID, uuid4

from sqlalchemy import func, select

from aplicacao.bancos.acoes import exposicoes_conteudo, penalidades, posicoes_reveladas
from aplicacao.bancos.conteudo import chave_da_resposta
from aplicacao.bancos.partidas import rodadas
from testes.teste_individual import ambiente
from testes.teste_perfil import base_perfil, executar  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401


def teste_esquema_guarda_progresso_e_tempo_por_sessao():
    from aplicacao.bancos.partidas import partidas, sessoes_galera

    assert "progresso_galera" in partidas.c
    assert "intervalos_tempo" in sessoes_galera.c


async def preparar(api, cliente, sessoes=1, pessoas=2, respostas=None):
    catalogo = api.state.individual.catalogo
    respostas = respostas or ["CASA", "MADEIRA", "PÃO", "MAÇÃ", "DADO", "FITA"]
    catalogo.itens = [
        p.model_copy(update={"resposta": r, "resposta_chave": chave_da_resposta(r)})
        for p, r in zip(catalogo.itens, respostas, strict=False)
    ]
    api.state.galera.catalogo = catalogo
    plano = (
        await cliente.post(
            "/api/partidas/galera/configuracao",
            json={
                "convidados": [
                    {"nome": n, "avatar_id": "coruja_sabia"}
                    for n in ["Amigo", "Parceiro"][: pessoas - 1]
                ],
                "dificuldade": "facil",
                "quantidade_sessoes": sessoes,
                "modo_tematicas": "manual",
                "tematicas": ["paises"] * sessoes,
            },
        )
    ).json()
    return (await cliente.post("/api/partidas/galera", json={"plano_id": plano["plano_id"]})).json()


async def agir(cliente, e, tipo, **campos):
    return await cliente.post(
        f"/api/partidas/galera/{e['partida_id']}/acoes",
        json={
            "id_acao": str(uuid4()),
            "versao_esperada": e["versao"],
            "tipo": tipo,
            **campos,
        },
    )


def teste_inicia_revela_so_sessao_atual_e_recupera_pontos(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            e = await preparar(api, cliente, 2)
            r = await agir(cliente, e, "iniciar")
            assert r.status_code == 200, r.text
            e = r.json()
            assert e["painel"]["sessao"] == 1 and e["estado"] == "em_andamento"
            assert e["painel"]["participante_atual"] in e["ordem_primeira_sessao"]
            assert "dicas" not in str(e) and "reservas" not in e
            assert len(e["resumo_sessoes"]) == 1
            p = e["painel"]["participante_atual"]
            r = await agir(cliente, e, "letra", participante_id=p, valor="A")
            assert r.status_code == 200, r.text
            novo = r.json()
            assert (
                next(x["pontuacao"] for x in novo["participantes"] if x["participante_id"] == p) > 0
            )
            assert (
                await cliente.get(f"/api/partidas/galera/{e['partida_id']}/painel")
            ).json() == novo
            with base_perfil.connect() as c:
                id = UUID(e["partida_id"])
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(exposicoes_conteudo)
                        .join(rodadas)
                        .where(rodadas.c.partida_id == id)
                    )
                    == 2
                )
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(posicoes_reveladas)
                        .where(posicoes_reveladas.c.partida_id == id)
                    )
                    > 0
                )
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(penalidades)
                        .where(penalidades.c.partida_id == id)
                    )
                    == 0
                )

    executar(verificar())


def teste_tres_participantes_duas_sessoes_terminam_sem_resultado_individual(base_perfil):  # noqa: F811
    from aplicacao.bancos.acoes import resultados_individuais

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            e = await preparar(api, cliente, 2, 3)
            e = (await agir(cliente, e, "iniciar")).json()
            id = UUID(e["partida_id"])
            anteriores = set()
            total = 0
            while e["painel"]["estado"] == "em_andamento":
                painel = e["painel"]
                sessao = UUID(painel["sessao_id"])
                anteriores.add(sessao)
                indice = next(i for i, p in enumerate(painel["palavras"]) if None in p)
                with base_perfil.connect() as c:
                    r = (
                        c.execute(
                            select(rodadas).where(
                                rodadas.c.sessao_id == sessao, rodadas.c.ordem == indice + 1
                            )
                        )
                        .mappings()
                        .one()
                    )
                conteudo = await api.state.galera.catalogo.buscar(r["palavra_id"], r["revisao"])
                total += sum(a.isalnum() for a in conteudo.resposta) * 100
                resposta = await agir(
                    cliente,
                    e,
                    "palpite",
                    palavra=indice,
                    valor=conteudo.resposta,
                    participante_id=painel["participante_atual"],
                )
                assert resposta.status_code == 200, resposta.text
                e = resposta.json()
            if e["painel"]["estado"] == "aguardando_desempate":
                e = (
                    await agir(
                        cliente, e, "voto", participante_id=e["painel"]["lideres"][0], aceita=False
                    )
                ).json()
            assert e["estado"] == "concluida" and len(anteriores) == 2
            assert sum(a["pontuacao"] for a in e["participantes"]) == total
            with base_perfil.connect() as c:
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(exposicoes_conteudo)
                        .join(rodadas)
                        .where(rodadas.c.partida_id == id)
                    )
                    == 6
                )
                assert (
                    c.scalar(
                        select(func.count())
                        .select_from(resultados_individuais)
                        .where(resultados_individuais.c.partida_id == id)
                    )
                    == 0
                )

    executar(verificar())


def teste_reenvio_concorrente_nao_duplica_e_outra_pessoa_nao_joga(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            e = await preparar(api, cliente)
            e = (await agir(cliente, e, "iniciar")).json()
            p = e["painel"]["participante_atual"]
            outro = next(
                x["participante_id"] for x in e["participantes"] if x["participante_id"] != p
            )
            assert (
                await agir(cliente, e, "letra", participante_id=outro, valor="A")
            ).status_code == 409
            dados = {
                "id_acao": str(uuid4()),
                "versao_esperada": e["versao"],
                "tipo": "letra",
                "participante_id": p,
                "valor": "A",
            }
            url = f"/api/partidas/galera/{e['partida_id']}/acoes"
            a, b = await asyncio.gather(
                cliente.post(url, json=dados), cliente.post(url, json=dados)
            )
            assert a.status_code == b.status_code == 200
            assert a.json() == b.json()
            assert (await cliente.post(url, json={**dados, "valor": "B"})).status_code == 409
            assert (
                await agir(cliente, e, "letra", participante_id=p, valor="B")
            ).status_code == 409

    executar(verificar())


def teste_desistencia_revela_atual_preserva_futuras_e_nao_tem_retomada(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            e = await preparar(api, cliente, 2)
            e = (await agir(cliente, e, "iniciar")).json()
            e = (await agir(cliente, e, "encerrar")).json()
            assert e["estado"] == "abandonada" and e["resultado_galera"] == "empate"
            assert all(c is not None for palavra in e["painel"]["palavras"] for c in palavra)
            assert len(e["resumo_sessoes"]) == 1
            assert (await agir(cliente, e, "iniciar")).status_code == 409
            with base_perfil.connect() as c:
                itens = (
                    c.execute(select(rodadas).where(rodadas.c.partida_id == UUID(e["partida_id"])))
                    .mappings()
                    .all()
                )
                assert sum(r["apresentada_em"] is not None for r in itens) == 2
                assert sum(r["estado"] == "reservada" for r in itens) == 2
                assert sum(r["estado"] == "desistida" for r in itens) == 2

    executar(verificar())


def teste_palpite_unicode_equivalente_registra_acerto_no_livro_de_jogadas(base_perfil):  # noqa: F811
    import unicodedata

    from aplicacao.bancos.acoes import palpites

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            e = await preparar(api, cliente, pessoas=1, respostas=["MAÇÃ"])
            e = (await agir(cliente, e, "iniciar")).json()
            r = await agir(
                cliente,
                e,
                "palpite",
                valor=unicodedata.normalize("NFD", "maçã"),
                palavra=0,
                participante_id=e["painel"]["participante_atual"],
            )
            assert r.status_code == 200, r.text
            assert (
                r.json()["estado"] == "concluida"
                and r.json()["participantes"][0]["pontuacao"] == 400
            )
            with base_perfil.connect() as c:
                assert (
                    c.scalar(
                        select(palpites.c.resultado).where(
                            palpites.c.partida_id == UUID(e["partida_id"])
                        )
                    )
                    == "acerto"
                )

    executar(verificar())


def teste_tempo_sobreposto_e_recarga_gratuita_historico_encerra(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            e = await preparar(api, cliente)
            e = (await agir(cliente, e, "iniciar")).json()
            base = f"/api/partidas/galera/{e['partida_id']}"
            tempo = (await cliente.get(base + "/tempo")).json()
            agora = tempo["relogio_servidor_ms"]
            dados = {
                "sessao_id": e["painel"]["sessao_id"],
                "inicio_ms": agora - 1000,
                "fim_ms": agora,
            }
            a = await cliente.post(base + "/tempo", json=dados)
            b = await cliente.post(base + "/tempo", json=dados)
            assert a.status_code == b.status_code == 200
            assert b.json()["tempo_total_ms"] == 1000 and b.json()["versao"] == e["versao"]
            aba = str(uuid4())
            doc = str(uuid4())
            conexao = {
                "tipo": "conectar",
                "aba_id": aba,
                "documento_id": doc,
                "navegacao": "navigate",
                "versao_esperada": e["versao"],
            }
            r = await cliente.post(base + "/conexoes", json=conexao)
            assert r.status_code == 200, r.text
            evento = {**conexao, "tipo": "pagehide", "evento_id": str(uuid4()), "persistido": False}
            assert (await cliente.post(base + "/conexoes", json=evento)).status_code == 200
            recarga = {**conexao, "documento_id": str(uuid4()), "navegacao": "reload"}
            r = await cliente.post(base + "/conexoes", json=recarga)
            assert r.json()["estado"] == "em_andamento" and r.json()["tempo_total_ms"] == 1000
            r = await cliente.post(
                base + "/conexoes",
                json={**recarga, "documento_id": str(uuid4()), "navegacao": "back_forward"},
            )
            assert r.json()["estado"] == "abandonada"

    executar(verificar())


def teste_extra_com_consenso_mantem_nivel_e_nao_repete_conteudo(base_perfil):  # noqa: F811
    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            e = await preparar(api, cliente, respostas=["CASA", "DADO", "FITA", "TETO"])
            e = (await agir(cliente, e, "iniciar")).json()
            id = UUID(e["partida_id"])
            with base_perfil.connect() as c:
                usadas = (
                    c.execute(
                        select(rodadas).where(rodadas.c.partida_id == id).order_by(rodadas.c.ordem)
                    )
                    .mappings()
                    .all()
                )
            for i, r in enumerate(usadas):
                palavra = await api.state.galera.catalogo.buscar(r["palavra_id"], r["revisao"])
                resposta = await agir(
                    cliente,
                    e,
                    "palpite",
                    participante_id=e["painel"]["participante_atual"],
                    palavra=i,
                    valor=palavra.resposta,
                )
                assert resposta.status_code == 200, resposta.text
                e = resposta.json()
                if i == 0:
                    e = (
                        await agir(
                            cliente,
                            e,
                            "letra",
                            participante_id=e["painel"]["participante_atual"],
                            valor="W",
                        )
                    ).json()
            assert e["painel"]["estado"] == "aguardando_desempate"
            assert (await agir(cliente, e, "extra")).status_code == 409
            for lider in e["painel"]["lideres"]:
                e = (await agir(cliente, e, "voto", participante_id=lider, aceita=True)).json()
            assert (await agir(cliente, e, "extra", tematica="animais")).status_code == 409
            resposta = await agir(cliente, e, "extra", tematica="paises")
            assert resposta.status_code == 200, resposta.text
            e = resposta.json()
            assert e["painel"]["extra"] and e["painel"]["sessao"] == 2
            assert e["configuracao"]["dificuldade"] == "facil" and len(e["painel"]["ordem"]) == 2
            with base_perfil.connect() as c:
                todas = (
                    c.execute(select(rodadas).where(rodadas.c.partida_id == id)).mappings().all()
                )
                assert len(todas) == len({r["palavra_id"] for r in todas}) == 4
            for i, r in enumerate(
                sorted(
                    (r for r in todas if r["sessao_id"] == UUID(e["painel"]["sessao_id"])),
                    key=lambda r: r["ordem"],
                )
            ):
                palavra = await api.state.galera.catalogo.buscar(r["palavra_id"], r["revisao"])
                e = (
                    await agir(
                        cliente,
                        e,
                        "palpite",
                        participante_id=e["painel"]["participante_atual"],
                        palavra=i,
                        valor=palavra.resposta,
                    )
                ).json()
            assert e["estado"] == "concluida" and e["resultado_galera"] == "vencedor"
            assert (await agir(cliente, e, "extra")).status_code == 409

    executar(verificar())


def teste_rotas_do_painel_exigem_csrf_e_propriedade(base_perfil):  # noqa: F811
    from sqlalchemy import update

    from aplicacao.bancos.partidas import partidas
    from testes.teste_persistencia import criar_jogador

    async def verificar():
        async with ambiente(base_perfil) as (api, cliente, conta):
            e = await preparar(api, cliente)
            base = f"/api/partidas/galera/{e['partida_id']}"
            r = await cliente.post(
                base + "/acoes",
                json={"id_acao": str(uuid4()), "versao_esperada": e["versao"], "tipo": "iniciar"},
                headers={"X-Decifra-CSRF": "errado"},
            )
            assert r.status_code == 403
            with base_perfil.begin() as c:
                outro = criar_jogador(c)
                c.execute(
                    update(partidas)
                    .where(partidas.c.id == UUID(e["partida_id"]))
                    .values(jogador_id=outro)
                )
            assert (await cliente.get(base + "/painel")).status_code == 404
            assert (await agir(cliente, e, "iniciar")).status_code == 404

    executar(verificar())
