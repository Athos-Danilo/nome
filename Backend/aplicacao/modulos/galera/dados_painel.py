"""Reconstrução do progresso e projeção pública, sem copiar o catálogo."""

from sqlalchemy import select

from aplicacao.bancos.acoes import (
    letras_tentadas,
    posicoes_reveladas,
)
from aplicacao.bancos.partidas import (
    ordens_participantes,
    participantes,
    rodadas,
    sessoes_galera,
)
from aplicacao.modulos.galera.motor import (
    EstadoGalera,
    Painel,
    iniciar,
    publicar,
)
from aplicacao.modulos.individual.tempo import duracao


class DadosPainel:
    def __init__(self, base):
        self.base = base

    async def estrutura(self, c, partida_id):
        grupo = (
            (
                await c.execute(
                    select(participantes)
                    .where(participantes.c.partida_id == partida_id)
                    .order_by(participantes.c.inscricao)
                )
            )
            .mappings()
            .all()
        )
        sessoes = (
            (
                await c.execute(
                    select(sessoes_galera)
                    .where(sessoes_galera.c.partida_id == partida_id)
                    .order_by(sessoes_galera.c.numero)
                )
            )
            .mappings()
            .all()
        )
        reservas = (
            (
                await c.execute(
                    select(rodadas)
                    .join(sessoes_galera, sessoes_galera.c.id == rodadas.c.sessao_id)
                    .where(rodadas.c.partida_id == partida_id)
                    .order_by(sessoes_galera.c.numero, rodadas.c.ordem)
                )
            )
            .mappings()
            .all()
        )
        return grupo, sessoes, reservas

    async def carregar(self, c, p, catalogo):
        grupo, sessoes, reservas = await self.estrutura(c, p["id"])
        conteudos = [await catalogo.buscar(r["palavra_id"], r["revisao"]) for r in reservas]
        paineis = tuple(
            Painel(
                s["tematica_id"],
                tuple(
                    d.resposta
                    for r, d in zip(reservas, conteudos, strict=True)
                    if r["sessao_id"] == s["id"]
                ),
            )
            for s in sessoes
        )
        ids = tuple(str(g["id"]) for g in grupo)
        progresso = p["progresso_galera"]
        if progresso is None:
            ordem = tuple(
                str(i)
                for i in (
                    await c.execute(
                        select(ordens_participantes.c.participante_id)
                        .where(ordens_participantes.c.sessao_id == sessoes[0]["id"])
                        .order_by(ordens_participantes.c.posicao)
                    )
                ).scalars()
            )
            return iniciar(ids, paineis, ordem, dificuldade=p["configuracao"]["dificuldade"])
        sessao = progresso["sessao"]
        posicoes = (
            (
                await c.execute(
                    select(posicoes_reveladas).where(posicoes_reveladas.c.partida_id == p["id"])
                )
            )
            .mappings()
            .all()
        )
        atuais = [r for r in reservas if r["sessao_id"] == sessoes[sessao]["id"]]
        tentadas = frozenset(
            (
                await c.execute(
                    select(letras_tentadas.c.letra).where(
                        letras_tentadas.c.sessao_id == sessoes[sessao]["id"]
                    )
                )
            ).scalars()
        )
        return EstadoGalera(
            participantes=ids,
            paineis=paineis,
            pontos=tuple(g["pontuacao"] for g in grupo),
            ordem=tuple(progresso["ordem"]),
            reveladas=tuple(
                frozenset(a["posicao"] for a in posicoes if a["rodada_id"] == r["id"])
                for r in atuais
            ),
            sessao=sessao,
            vez=progresso["vez"],
            versao=p["versao"],
            estado=progresso["estado"],
            tentadas=tentadas,
            lideres=tuple(progresso["lideres"]),
            extra=progresso["extra"],
            concordantes=tuple(progresso["concordantes"]),
            dificuldade=p["configuracao"]["dificuldade"],
        )

    async def saida(self, c, p, catalogo, estado=None):
        base = await self.base(c, p["jogador_id"], p["id"])
        if p["progresso_galera"] is None:
            return {
                **base,
                "painel": None,
                "resumo_sessoes": [],
                "tempo_total_ms": 0,
                "resultado_galera": None,
                "motivo_encerramento": None,
            }
        estado = estado or await self.carregar(c, p, catalogo)
        painel = publicar(estado)
        _, sessoes, _ = await self.estrutura(c, p["id"])
        atual = sessoes[estado.sessao]
        if p["estado"] == "abandonada":
            painel["palavras"] = [list(r) for r in estado.paineis[estado.sessao].respostas]
        painel["sessao_id"] = str(atual["id"])
        painel["tempo_ativo_ms"] = duracao(atual["intervalos_tempo"]) or 0
        resumo = [
            {
                "numero": s["numero"],
                "tematica": s["tematica_id"],
                "desempate": s["desempate"],
                "estado": s["estado"],
                "tempo_ativo_ms": duracao(s["intervalos_tempo"]) or 0,
            }
            for s in sessoes
            if s["estado"] != "reservada"
        ]
        return {
            **base,
            "painel": painel,
            "resumo_sessoes": resumo,
            "tempo_total_ms": sum(s["tempo_ativo_ms"] for s in resumo),
            "resultado_galera": p["resultado_galera"],
            "motivo_encerramento": p["motivo_encerramento"],
        }
