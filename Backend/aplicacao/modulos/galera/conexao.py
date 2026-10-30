"""Reconcilia evidência de navegação; ausência sozinha não encerra o painel."""

from uuid import uuid4

from sqlalchemy import update

from aplicacao.bancos.acoes import interrupcoes
from aplicacao.bancos.partidas import partidas
from aplicacao.modulos.galera.esquemas import AcaoGalera


async def conectar(painel, c, p, dados, catalogo):
    if p["estado"] != "em_andamento" or p["progresso_galera"] is None:
        return await painel.dados.saida(c, p, catalogo)
    progresso = dict(p["progresso_galera"])
    conexoes = dict(progresso.get("conexoes", {}))
    chave = str(dados.aba_id)
    anterior = conexoes.get(chave)
    mesmo = anterior and anterior["documento_id"] == str(dados.documento_id)
    historico = anterior and (
        (dados.tipo == "conectar" and dados.navegacao == "back_forward" and not mesmo)
        or (dados.tipo in {"conectar", "pageshow"} and mesmo and anterior.get("persistido"))
    )
    if historico:
        evento = anterior.get("evento_id") or str(uuid4())
        await c.execute(
            update(interrupcoes)
            .where(interrupcoes.c.partida_id == p["id"], interrupcoes.c.evento_id == evento)
            .values(classificacao="encerramento")
        )
        return await painel.agir_na_transacao(
            c, p, AcaoGalera(tipo="encerrar", id_acao=evento, versao_esperada=p["versao"]), catalogo
        )
    if dados.tipo == "conectar":
        if anterior and anterior.get("evento_id"):
            await c.execute(
                update(interrupcoes)
                .where(
                    interrupcoes.c.partida_id == p["id"],
                    interrupcoes.c.evento_id == anterior["evento_id"],
                    interrupcoes.c.classificacao == "em_apuracao",
                )
                .values(classificacao="recarga" if dados.navegacao == "reload" else "ignorada")
            )
        conexoes[chave] = {
            "documento_id": str(dados.documento_id),
            "persistido": False,
            "evento_id": None,
        }
    elif mesmo and dados.tipo == "pagehide" and dados.versao_esperada == p["versao"]:
        from sqlalchemy.dialects.postgresql import insert as inserir_pg

        evento = dados.evento_id or uuid4()
        await c.execute(
            inserir_pg(interrupcoes)
            .values(
                partida_id=p["id"],
                evento_id=evento,
                origem="pagehide",
                classificacao="em_apuracao",
            )
            .on_conflict_do_nothing()
        )
        conexoes[chave] = {**anterior, "persistido": dados.persistido, "evento_id": str(evento)}
    progresso["conexoes"] = conexoes
    await c.execute(
        update(partidas).where(partidas.c.id == p["id"]).values(progresso_galera=progresso)
    )
    return await painel.dados.saida(c, p, catalogo)
