"""Adaptador transacional do painel; respostas continuam nas revisões do catálogo."""

import hashlib
import json
import random
from dataclasses import replace
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import insert, select, update

from aplicacao.bancos.acoes import (
    acoes_processadas,
    exposicoes_conteudo,
)
from aplicacao.bancos.partidas import (
    partidas,
    rodadas,
    sessoes_galera,
)
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.galera.contratos import CatalogoGalera
from aplicacao.modulos.galera.desempate import abrir_extra, selecionar_extra, votar
from aplicacao.modulos.galera.esquemas import AcaoGalera, ConexaoGalera, TempoGalera
from aplicacao.modulos.galera.motor import (
    AbrirExtra,
    ErroGalera,
    Jogada,
    Painel,
    VotoExtra,
    jogar,
)
from aplicacao.modulos.individual.tempo import unir_intervalos


class PainelPostgresql:
    def __init__(self, motor, titular, base):
        self.motor = motor
        self.titular = titular
        from aplicacao.modulos.galera.dados_painel import DadosPainel
        from aplicacao.modulos.galera.registro_painel import RegistroPainel

        self.dados = DadosPainel(base)
        self.gravacao = RegistroPainel(self.dados)

    async def registro(self, c, jogador_id, partida_id):
        await self.titular(c, jogador_id)
        p = (
            (
                await c.execute(
                    select(partidas)
                    .where(
                        partidas.c.id == partida_id,
                        partidas.c.jogador_id == jogador_id,
                        partidas.c.modo == "galera",
                    )
                    .with_for_update()
                )
            )
            .mappings()
            .one_or_none()
        )
        if p is None:
            raise FalhaAutenticacao(
                "PARTIDA_NAO_ENCONTRADA", "Essa partida não foi encontrada.", 404
            )
        return p

    async def consultar(self, jogador_id: UUID, partida_id: UUID, catalogo: CatalogoGalera) -> dict:
        async with self.motor.begin() as c:
            p = await self.registro(c, jogador_id, partida_id)
            return await self.dados.saida(c, p, catalogo)

    async def agir(
        self, jogador_id: UUID, partida_id: UUID, dados: AcaoGalera, catalogo: CatalogoGalera
    ) -> dict:
        async with self.motor.begin() as c:
            p = await self.registro(c, jogador_id, partida_id)
            return await self.agir_na_transacao(c, p, dados, catalogo)

    async def agir_na_transacao(self, c, p, dados, catalogo):
        jogador_id, partida_id = p["jogador_id"], p["id"]
        resumo = hashlib.sha256(
            json.dumps(dados.model_dump(mode="json"), sort_keys=True).encode()
        ).hexdigest()
        anterior = (
            (
                await c.execute(
                    select(acoes_processadas).where(
                        acoes_processadas.c.partida_id == partida_id,
                        acoes_processadas.c.id_acao == dados.id_acao,
                    )
                )
            )
            .mappings()
            .one_or_none()
        )
        if anterior:
            if anterior["entrada_resumo"] != resumo:
                raise FalhaAutenticacao(
                    "ACAO_REUTILIZADA", "Essa ação já foi usada com outros dados.", 409
                )
            return anterior["resultado"]
        if p["versao"] != dados.versao_esperada:
            raise FalhaAutenticacao("VERSAO_DESATUALIZADA", "Confira o painel atualizado.", 409)
        if p["estado"] in {"concluida", "abandonada"}:
            raise FalhaAutenticacao("PARTIDA_ENCERRADA", "Essa partida já terminou.", 409)
        if p["progresso_galera"] is None and dados.tipo != "iniciar":
            raise FalhaAutenticacao("PARTIDA_INATIVA", "Inicie o painel primeiro.", 409)
        estado = await self.dados.carregar(c, p, catalogo)
        try:
            if dados.tipo == "iniciar":
                if p["progresso_galera"] is not None:
                    raise ErroGalera("PARTIDA_INICIADA", "O painel já foi iniciado.")
                novo = replace(estado, versao=p["versao"] + 1)
            elif dados.tipo == "encerrar":
                maior = max(estado.pontos)
                novo = replace(
                    estado,
                    estado="concluida",
                    versao=estado.versao + 1,
                    lideres=tuple(
                        a
                        for a, b in zip(estado.participantes, estado.pontos, strict=True)
                        if b == maior
                    ),
                )
            elif dados.tipo == "voto":
                novo = votar(
                    estado,
                    VotoExtra(
                        str(dados.id_acao),
                        dados.versao_esperada,
                        str(dados.participante_id),
                        dados.aceita,
                    ),
                )
            elif dados.tipo == "extra":
                vistas = set(
                    (
                        await c.execute(
                            select(rodadas.c.palavra_id)
                            .join(exposicoes_conteudo)
                            .join(partidas, partidas.c.id == rodadas.c.partida_id)
                            .where(partidas.c.jogador_id == jogador_id)
                        )
                    ).scalars()
                )
                oferta = selecionar_extra(
                    estado, await catalogo.listar(), vistas, random.SystemRandom(), dados.tematica
                )
                if oferta is None:
                    raise ErroGalera(
                        "CONTEUDO_INSUFICIENTE", "Escolha outra temática ou encerre empatado."
                    )
                tema, palavras = oferta
                novo = abrir_extra(
                    estado,
                    AbrirExtra(
                        str(dados.id_acao),
                        dados.versao_esperada,
                        Painel(tema, tuple(a.resposta for a in palavras)),
                    ),
                )
                sessao_id = await c.scalar(
                    insert(sessoes_galera)
                    .values(
                        partida_id=partida_id,
                        numero=len(novo.paineis),
                        tematica_id=tema,
                        desempate=True,
                    )
                    .returning(sessoes_galera.c.id)
                )
                for i, palavra in enumerate(palavras, 1):
                    await c.execute(
                        insert(rodadas).values(
                            partida_id=partida_id,
                            sessao_id=sessao_id,
                            ordem=i,
                            palavra_id=palavra.id,
                            revisao=palavra.revisao,
                            dificuldade=estado.dificuldade,
                        )
                    )
            else:
                novo = jogar(
                    estado,
                    Jogada(
                        str(dados.id_acao),
                        dados.versao_esperada,
                        str(dados.participante_id),
                        dados.tipo,
                        dados.valor,
                        dados.palavra or 0,
                    ),
                )
        except ErroGalera as erro:
            raise FalhaAutenticacao(erro.codigo, str(erro), 409) from erro
        acao_id = await self.gravacao.gravar(c, p, estado, novo, dados, resumo)
        p = await self.registro(c, jogador_id, partida_id)
        resultado = await self.dados.saida(c, p, catalogo, novo)
        await c.execute(
            update(acoes_processadas)
            .where(acoes_processadas.c.id == acao_id)
            .values(resultado=resultado)
        )
        return resultado

    async def tempo(
        self,
        jogador_id: UUID,
        partida_id: UUID,
        dados: TempoGalera | None,
        catalogo: CatalogoGalera,
    ) -> dict:
        async with self.motor.begin() as c:
            p = await self.registro(c, jogador_id, partida_id)
            if dados:
                sessao = (
                    (
                        await c.execute(
                            select(sessoes_galera).where(
                                sessoes_galera.c.id == dados.sessao_id,
                                sessoes_galera.c.partida_id == partida_id,
                            )
                        )
                    )
                    .mappings()
                    .one_or_none()
                )
                if p["estado"] != "em_andamento" or not sessao or sessao["estado"] != "apresentada":
                    raise FalhaAutenticacao(
                        "SESSAO_INATIVA", "O relógio dessa sessão está suspenso.", 409
                    )
                intervalos = unir_intervalos(
                    sessao["intervalos_tempo"],
                    dados.inicio_ms,
                    dados.fim_ms,
                    int(datetime.now(UTC).timestamp() * 1000),
                )
                await c.execute(
                    update(sessoes_galera)
                    .where(sessoes_galera.c.id == sessao["id"])
                    .values(intervalos_tempo=intervalos)
                )
            resultado = await self.dados.saida(c, p, catalogo)
            return {**resultado, "relogio_servidor_ms": int(datetime.now(UTC).timestamp() * 1000)}

    async def conexao(
        self, jogador_id: UUID, partida_id: UUID, dados: ConexaoGalera, catalogo: CatalogoGalera
    ) -> dict:
        from aplicacao.modulos.galera.conexao import conectar

        async with self.motor.begin() as c:
            p = await self.registro(c, jogador_id, partida_id)
            return await conectar(self, c, p, dados, catalogo)
