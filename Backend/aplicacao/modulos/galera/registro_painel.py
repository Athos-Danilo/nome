"""Grava posições, placar, turnos e recibos na transação da partida."""

import unicodedata
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import insert, update
from sqlalchemy.dialects.postgresql import insert as inserir_pg

from aplicacao.bancos.acoes import (
    acoes_processadas,
    exposicoes_conteudo,
    letras_tentadas,
    palpites,
    posicoes_reveladas,
)
from aplicacao.bancos.partidas import (
    ordens_participantes,
    participantes,
    partidas,
    rodadas,
    sessoes_galera,
)
from aplicacao.modulos.galera.motor import (
    familia,
)


class RegistroPainel:
    def __init__(self, dados):
        self.dados = dados

    async def gravar(self, c, p, anterior, novo, dados, resumo):
        acao_id = await c.scalar(
            insert(acoes_processadas)
            .values(
                partida_id=p["id"],
                id_acao=dados.id_acao,
                tipo="galera_" + dados.tipo,
                entrada_resumo=resumo,
                versao_aplicada=novo.versao,
            )
            .returning(acoes_processadas.c.id)
        )
        _, sessoes, reservas = await self.dados.estrutura(c, p["id"])
        agora = datetime.now(UTC)
        if dados.tipo in {"letra", "palpite"}:
            antigas = [r for r in reservas if r["sessao_id"] == sessoes[anterior.sessao]["id"]]
            mudou = novo.sessao != anterior.sessao
            reveladas = (
                tuple(
                    frozenset(i for i, c in enumerate(r) if c.isalnum())
                    for r in anterior.paineis[anterior.sessao].respostas
                )
                if mudou
                else novo.reveladas
            )
            ganho = sum(novo.pontos) - sum(anterior.pontos)
            for r, antes, depois in zip(antigas, anterior.reveladas, reveladas, strict=True):
                for posicao in depois - antes:
                    await c.execute(
                        insert(posicoes_reveladas).values(
                            rodada_id=r["id"],
                            posicao=posicao,
                            partida_id=p["id"],
                            acao_id=acao_id,
                            participante_id=dados.participante_id,
                        )
                    )
                await c.execute(
                    update(rodadas)
                    .where(rodadas.c.id == r["id"])
                    .values(
                        pontuacao=len(depois) * 100,
                        estado="acertada"
                        if len(depois)
                        == sum(
                            a.isalnum()
                            for a in anterior.paineis[anterior.sessao].respostas[r["ordem"] - 1]
                        )
                        else "apresentada",
                    )
                )
            await c.execute(
                insert(palpites).values(
                    partida_id=p["id"],
                    acao_id=acao_id,
                    participante_id=dados.participante_id,
                    tipo="letra" if dados.tipo == "letra" else "palavra",
                    texto=dados.valor,
                    rodada_id=antigas[dados.palavra]["id"] if dados.tipo == "palpite" else None,
                    resultado="acerto"
                    if ganho
                    and (
                        dados.tipo == "letra"
                        or anterior.paineis[anterior.sessao].respostas[dados.palavra]
                        == unicodedata.normalize("NFC", dados.valor).upper()
                    )
                    else ("parcial" if ganho else "erro"),
                    pontos=ganho,
                )
            )
            if dados.tipo == "letra":
                letra = familia(unicodedata.normalize("NFC", dados.valor).upper())
                await c.execute(
                    insert(letras_tentadas).values(
                        sessao_id=sessoes[anterior.sessao]["id"],
                        letra=letra,
                        partida_id=p["id"],
                        acao_id=acao_id,
                        encontrada=ganho > 0,
                    )
                )
        for pessoa, pontos in zip(novo.participantes, novo.pontos, strict=True):
            await c.execute(
                update(participantes)
                .where(participantes.c.id == UUID(pessoa))
                .values(pontuacao=pontos)
            )
        for i, sessao in enumerate(sessoes):
            if i > novo.sessao:
                continue
            final = i < novo.sessao or novo.estado != "em_andamento"
            await c.execute(
                update(sessoes_galera)
                .where(sessoes_galera.c.id == sessao["id"])
                .values(
                    estado="encerrada"
                    if dados.tipo == "encerrar" and i == novo.sessao
                    else ("concluida" if final else "apresentada"),
                    participante_atual_id=UUID(novo.ordem[novo.vez])
                    if i == novo.sessao and not final
                    else None,
                )
            )
            if i == novo.sessao:
                for posicao, pessoa in enumerate(novo.ordem, 1):
                    await c.execute(
                        inserir_pg(ordens_participantes)
                        .values(
                            sessao_id=sessao["id"],
                            participante_id=UUID(pessoa),
                            partida_id=p["id"],
                            posicao=posicao,
                        )
                        .on_conflict_do_nothing()
                    )
                for r in reservas:
                    if r["sessao_id"] == sessao["id"] and r["estado"] == "reservada":
                        await c.execute(
                            update(rodadas)
                            .where(rodadas.c.id == r["id"])
                            .values(estado="apresentada", apresentada_em=agora)
                        )
                        await c.execute(
                            inserir_pg(exposicoes_conteudo)
                            .values(rodada_id=r["id"])
                            .on_conflict_do_nothing()
                        )
        if dados.tipo == "encerrar":
            await c.execute(
                update(rodadas)
                .where(
                    rodadas.c.sessao_id == sessoes[novo.sessao]["id"],
                    rodadas.c.estado == "apresentada",
                )
                .values(estado="desistida")
            )
        encerrada = novo.estado == "concluida"
        progresso = {
            k: getattr(novo, k)
            for k in ("sessao", "vez", "ordem", "estado", "lideres", "extra", "concordantes")
        }
        progresso["conexoes"] = (p["progresso_galera"] or {}).get("conexoes", {})
        await c.execute(
            update(partidas)
            .where(partidas.c.id == p["id"])
            .values(
                estado="abandonada"
                if dados.tipo == "encerrar"
                else ("concluida" if encerrada else "em_andamento"),
                versao=novo.versao,
                progresso_galera=progresso,
                pontuacao=sum(novo.pontos),
                encerrada_em=agora if encerrada else None,
                motivo_encerramento=("desistencia" if dados.tipo == "encerrar" else "conclusao")
                if encerrada
                else None,
                resultado_galera=("empate" if len(novo.lideres) > 1 else "vencedor")
                if encerrada
                else None,
            )
        )
        return acao_id
