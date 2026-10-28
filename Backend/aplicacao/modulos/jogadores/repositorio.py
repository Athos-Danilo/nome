"""Persistência de perfil e limpeza transacional da identidade."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, insert, select, update
from sqlalchemy.engine import RowMapping
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine

from aplicacao.bancos.acoes import acoes_processadas, exposicoes_conteudo, palpites
from aplicacao.bancos.identidade import jogadores, preferencias, sessoes_autenticacao, visitantes
from aplicacao.bancos.partidas import participantes, partidas, planos_individuais, rodadas
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.jogadores.esquemas import (
    AlterarPerfil,
    AlterarPreferencias,
    PerfilJogador,
    PreferenciasJogador,
    PreferenciasSalvas,
)
from aplicacao.nucleo.nomes import chave_do_nome


class JogadoresPostgresql:
    def __init__(self, motor: AsyncEngine) -> None:
        self.motor = motor

    async def titular(
        self, conexao: AsyncConnection, jogador_id: UUID, bloquear: bool = False
    ) -> RowMapping:
        consulta = select(jogadores).where(
            jogadores.c.id == jogador_id, jogadores.c.estado != "anonimizado"
        )
        if bloquear:
            consulta = consulta.with_for_update()
        dados = (await conexao.execute(consulta)).mappings().one_or_none()
        if dados is None:
            raise FalhaAutenticacao("SESSAO_EXPIRADA", "Entre novamente com sua conta Google.", 401)
        return dados

    def perfil(self, dados: RowMapping) -> PerfilJogador:
        return PerfilJogador(
            jogador_id=dados["id"],
            email=dados["email"],
            estado=dados["estado"],
            nome_usuario=dados["nome_usuario"],
            avatar_id=dados["avatar_id"],
        )

    async def ler_perfil(self, jogador_id: UUID) -> PerfilJogador:
        async with self.motor.connect() as conexao:
            return self.perfil(await self.titular(conexao, jogador_id))

    async def salvar_perfil(self, jogador_id: UUID, dados: AlterarPerfil) -> PerfilJogador:
        try:
            async with self.motor.begin() as conexao:
                await self.titular(conexao, jogador_id, bloquear=True)
                registro = (
                    (
                        await conexao.execute(
                            update(jogadores)
                            .where(jogadores.c.id == jogador_id)
                            .values(
                                nome_usuario=dados.nome_usuario,
                                nome_chave=chave_do_nome(dados.nome_usuario),
                                avatar_id=dados.avatar_id,
                                estado="ativo",
                            )
                            .returning(jogadores)
                        )
                    )
                    .mappings()
                    .one()
                )
                return self.perfil(registro)
        except IntegrityError as falha:
            if (
                getattr(getattr(falha.orig, "diag", None), "constraint_name", None)
                != "uq_jogadores_nome_chave"
            ):
                raise
            raise FalhaAutenticacao(
                "NOME_INDISPONIVEL", "Esse nome já tem dono. Experimente outro!", 409
            ) from falha

    async def preferencias_na_conexao(
        self, conexao: AsyncConnection, jogador_id: UUID
    ) -> PreferenciasSalvas:
        dados = (
            (
                await conexao.execute(
                    select(preferencias).where(preferencias.c.jogador_id == jogador_id)
                )
            )
            .mappings()
            .one_or_none()
        )
        if dados is None:
            return PreferenciasSalvas(**PreferenciasJogador().model_dump(), salvas=False)
        return PreferenciasSalvas(
            **{campo: dados[campo] for campo in PreferenciasJogador.model_fields}, salvas=True
        )

    async def ler_preferencias(self, jogador_id: UUID) -> PreferenciasSalvas:
        async with self.motor.connect() as conexao:
            await self.titular(conexao, jogador_id)
            return await self.preferencias_na_conexao(conexao, jogador_id)

    async def salvar_preferencias(
        self, jogador_id: UUID, dados: AlterarPreferencias
    ) -> PreferenciasSalvas:
        async with self.motor.begin() as conexao:
            await self.titular(conexao, jogador_id, bloquear=True)
            anterior = await self.preferencias_na_conexao(conexao, jogador_id)
            if dados.somente_se_ausentes and anterior.salvas:
                return anterior
            campos = dados.model_dump(exclude={"somente_se_ausentes"})
            if anterior.salvas:
                await conexao.execute(
                    update(preferencias)
                    .where(preferencias.c.jogador_id == jogador_id)
                    .values(**campos)
                )
            else:
                await conexao.execute(insert(preferencias).values(jogador_id=jogador_id, **campos))
            return PreferenciasSalvas(**campos, salvas=True)

    async def excluir(self, jogador_id: UUID) -> None:
        async with self.motor.begin() as conexao:
            await self.titular(conexao, jogador_id, bloquear=True)
            # Novos motores de jogo também devem bloquear o titular antes da partida.
            await conexao.execute(
                delete(planos_individuais).where(planos_individuais.c.jogador_id == jogador_id)
            )
            ids = list(
                (
                    await conexao.execute(
                        select(partidas.c.id)
                        .where(partidas.c.jogador_id == jogador_id)
                        .order_by(partidas.c.id)
                        .with_for_update()
                    )
                ).scalars()
            )
            if ids:
                rodadas_da_conta = select(rodadas.c.id).where(rodadas.c.partida_id.in_(ids))
                await conexao.execute(
                    delete(exposicoes_conteudo).where(
                        exposicoes_conteudo.c.rodada_id.in_(rodadas_da_conta)
                    )
                )
                await conexao.execute(
                    update(palpites).where(palpites.c.partida_id.in_(ids)).values(texto=None)
                )
                await conexao.execute(
                    update(acoes_processadas)
                    .where(acoes_processadas.c.partida_id.in_(ids))
                    .values(entrada_resumo=None, resultado=None)
                )
                await conexao.execute(
                    update(participantes)
                    .where(participantes.c.partida_id.in_(ids))
                    .values(nome=None, nome_chave=None, avatar_id=None, anonimizado=True)
                )
                await conexao.execute(
                    update(partidas).where(partidas.c.id.in_(ids)).values(configuracao={})
                )
            await conexao.execute(
                delete(sessoes_autenticacao).where(sessoes_autenticacao.c.jogador_id == jogador_id)
            )
            await conexao.execute(
                delete(preferencias).where(preferencias.c.jogador_id == jogador_id)
            )
            await conexao.execute(
                update(visitantes)
                .where(visitantes.c.jogador_vinculado_id == jogador_id)
                .values(jogador_vinculado_id=None)
            )
            await conexao.execute(
                update(jogadores)
                .where(jogadores.c.id == jogador_id)
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
