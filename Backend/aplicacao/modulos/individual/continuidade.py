"""Rascunhos e evidências de conexão sem presumir fechamento por ausência."""

import unicodedata
from datetime import UTC, datetime
from typing import Protocol
from uuid import uuid4

from sqlalchemy import insert, select, update
from sqlalchemy.ext.asyncio import AsyncConnection

from aplicacao.bancos.acoes import interrupcoes
from aplicacao.bancos.partidas import conexoes_individuais, rodadas
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.individual.contratos import CatalogoIndividual
from aplicacao.modulos.individual.esquemas import (
    AcaoIndividual,
    ConectarIndividual,
    SalvarRascunho,
    SinalIndividual,
)


class PortaContinuidade(Protocol):
    async def estado(
        self, conexao: AsyncConnection, registro, catalogo: CatalogoIndividual
    ) -> dict: ...
    async def agir_na_transacao(
        self,
        conexao: AsyncConnection,
        registro,
        tipo: str,
        dados: AcaoIndividual,
        catalogo: CatalogoIndividual,
    ) -> dict: ...


class ContinuidadeIndividual:
    def __init__(self, motor: PortaContinuidade):
        self.motor = motor

    async def aplicar(
        self,
        conexao: AsyncConnection,
        registro,
        operacao: str,
        dados: SalvarRascunho | ConectarIndividual | SinalIndividual,
        catalogo: CatalogoIndividual,
    ) -> dict:
        if operacao == "rascunho" and isinstance(dados, SalvarRascunho):
            await self.salvar_rascunho(conexao, registro, dados, catalogo)
        elif operacao == "conexoes" and isinstance(dados, ConectarIndividual):
            return await self.conectar(conexao, registro, dados, catalogo)
        elif operacao == "sinais" and isinstance(dados, SinalIndividual):
            return await self.sinalizar(conexao, registro, dados, catalogo)
        else:
            raise FalhaAutenticacao("ACAO_INVALIDA", "Operação de continuidade inválida.", 422)
        return await self.motor.estado(conexao, registro, catalogo)

    async def salvar_rascunho(self, conexao, registro, dados, catalogo):
        if registro["estado"] != "em_andamento" or registro["versao"] != dados.versao_esperada:
            raise FalhaAutenticacao(
                "VERSAO_DESATUALIZADA", "Confira a partida antes de salvar a montagem.", 409
            )
        rodada = (
            (
                await conexao.execute(
                    select(rodadas).where(
                        rodadas.c.partida_id == registro["id"],
                        rodadas.c.id == dados.rodada_id,
                        rodadas.c.estado == "apresentada",
                    )
                )
            )
            .mappings()
            .one_or_none()
        )
        if rodada is None:
            raise FalhaAutenticacao(
                "RODADA_INVALIDA", "A montagem não pertence à rodada atual.", 409
            )
        palavra = await catalogo.buscar(rodada["palavra_id"], rodada["revisao"])
        letras = [unicodedata.normalize("NFC", c).upper() for c in dados.letras]
        if len(letras) != len(palavra.resposta) or dados.selecionada >= len(letras):
            raise FalhaAutenticacao("RASCUNHO_INVALIDO", "A montagem tem posições inválidas.", 422)
        for c, oficial in zip(letras, palavra.resposta, strict=True):
            if (not oficial.isalnum() and c != oficial) or (
                oficial.isalnum()
                and c != ""
                and (len(c) != 1 or not (c.isalpha() or c in "0123456789"))
            ):
                raise FalhaAutenticacao(
                    "RASCUNHO_INVALIDO", "Confira letras, números e sinais fixos.", 422
                )
        anterior = rodada["rascunho"]
        revisao = anterior["revisao"] if anterior else 0
        if revisao != dados.revisao_esperada:
            if (
                anterior
                and revisao == dados.revisao_esperada + 1
                and anterior["letras"] == letras
                and anterior["selecionada"] == dados.selecionada
            ):
                return
            raise FalhaAutenticacao(
                "RASCUNHO_DESATUALIZADO",
                "A montagem mudou em outra aba. Recarregue as letras salvas.",
                409,
            )
        await conexao.execute(
            update(rodadas)
            .where(rodadas.c.id == rodada["id"])
            .values(
                rascunho={
                    "letras": letras,
                    "selecionada": dados.selecionada,
                    "revisao": revisao + 1,
                }
            )
        )

    async def conexao(self, conexao, registro, aba_id):
        return (
            (
                await conexao.execute(
                    select(conexoes_individuais).where(
                        conexoes_individuais.c.partida_id == registro["id"],
                        conexoes_individuais.c.aba_id == aba_id,
                    )
                )
            )
            .mappings()
            .one_or_none()
        )

    async def resolver_pendente(self, conexao, registro, anterior, classificacao):
        if anterior and anterior["evento_pendente_id"]:
            await conexao.execute(
                update(interrupcoes)
                .where(
                    interrupcoes.c.partida_id == registro["id"],
                    interrupcoes.c.evento_id == anterior["evento_pendente_id"],
                    interrupcoes.c.classificacao == "em_apuracao",
                )
                .values(classificacao=classificacao)
            )

    async def sair_pelo_historico(self, conexao, registro, anterior, catalogo):
        return await self.motor.agir_na_transacao(
            conexao,
            registro,
            "saida",
            AcaoIndividual(
                id_acao=anterior["evento_pendente_id"] or uuid4(),
                versao_esperada=registro["versao"],
            ),
            catalogo,
        )

    async def conectar(self, conexao, registro, dados, catalogo):
        anterior = await self.conexao(conexao, registro, dados.aba_id)
        if registro["estado"] != "em_andamento":
            return await self.motor.estado(conexao, registro, catalogo)
        historico = anterior and (
            (anterior["documento_id"] != dados.documento_id and dados.navegacao == "back_forward")
            or (anterior["documento_id"] == dados.documento_id and anterior["persistido"])
        )
        if historico:
            return await self.sair_pelo_historico(conexao, registro, anterior, catalogo)
        if anterior and anterior["documento_id"] != dados.documento_id:
            await self.resolver_pendente(
                conexao,
                registro,
                anterior,
                "recarga" if dados.navegacao == "reload" else "ignorada",
            )
        campos = dict(
            documento_id=dados.documento_id,
            ultimo_sinal=datetime.now(UTC),
            evento_pendente_id=None,
            persistido=False,
        )
        if anterior:
            await conexao.execute(
                update(conexoes_individuais)
                .where(
                    conexoes_individuais.c.partida_id == registro["id"],
                    conexoes_individuais.c.aba_id == dados.aba_id,
                )
                .values(**campos)
            )
        else:
            await conexao.execute(
                insert(conexoes_individuais).values(
                    partida_id=registro["id"], aba_id=dados.aba_id, **campos
                )
            )
        return await self.motor.estado(conexao, registro, catalogo)

    async def sinalizar(self, conexao, registro, dados, catalogo):
        anterior = await self.conexao(conexao, registro, dados.aba_id)
        if (
            registro["estado"] != "em_andamento"
            or registro["versao"] != dados.versao_esperada
            or not anterior
            or anterior["documento_id"] != dados.documento_id
        ):
            return await self.motor.estado(conexao, registro, catalogo)
        if dados.tipo == "pageshow" and dados.persistido and anterior["persistido"]:
            return await self.sair_pelo_historico(conexao, registro, anterior, catalogo)
        campos = {"ultimo_sinal": datetime.now(UTC)}
        if dados.tipo == "pagehide":
            existente = await conexao.scalar(
                select(interrupcoes.c.id).where(
                    interrupcoes.c.partida_id == registro["id"],
                    interrupcoes.c.evento_id == dados.evento_id,
                )
            )
            if not existente:
                await conexao.execute(
                    insert(interrupcoes).values(
                        partida_id=registro["id"],
                        evento_id=dados.evento_id,
                        origem="pagehide",
                        classificacao="em_apuracao",
                    )
                )
            campos.update(evento_pendente_id=dados.evento_id, persistido=dados.persistido)
        await conexao.execute(
            update(conexoes_individuais)
            .where(
                conexoes_individuais.c.partida_id == registro["id"],
                conexoes_individuais.c.aba_id == dados.aba_id,
            )
            .values(**campos)
        )
        return await self.motor.estado(conexao, registro, catalogo)
