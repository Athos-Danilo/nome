"""Persistência transacional; tokens de sessão e estado são guardados como resumos."""

from dataclasses import asdict
from datetime import datetime

from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.dialects.postgresql import insert as inserir_postgresql
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncEngine

from aplicacao.bancos.identidade import jogadores, sessoes_autenticacao, tentativas_login
from aplicacao.modulos.autenticacao.contratos import (
    ContaAutenticada,
    FalhaAutenticacao,
    IdentidadeGoogle,
    TentativaLogin,
)


class AutenticacaoPostgresql:
    def __init__(self, motor: AsyncEngine) -> None:
        self.motor = motor

    async def guardar_tentativa(self, tentativa: TentativaLogin) -> None:
        async with self.motor.begin() as conexao:
            await conexao.execute(
                delete(tentativas_login).where(
                    tentativas_login.c.expira_em <= datetime.now(tentativa.expira_em.tzinfo)
                )
            )
            await conexao.execute(insert(tentativas_login).values(**asdict(tentativa)))

    async def consumir_tentativa(
        self, estado_resumo: str, navegador_resumo: str, agora: datetime
    ) -> TentativaLogin | None:
        async with self.motor.begin() as conexao:
            resultado = await conexao.execute(
                delete(tentativas_login)
                .where(
                    tentativas_login.c.estado_resumo == estado_resumo,
                    tentativas_login.c.navegador_resumo == navegador_resumo,
                    tentativas_login.c.expira_em > agora,
                )
                .returning(tentativas_login)
            )
            registro = resultado.mappings().one_or_none()
            return TentativaLogin(**registro) if registro else None

    async def abrir_sessao(
        self,
        identidade: IdentidadeGoogle,
        resumo: str,
        anterior: str | None,
        agora: datetime,
        expira_em: datetime,
    ) -> None:
        try:
            async with self.motor.begin() as conexao:
                # Duas primeiras entradas da mesma identidade podem disputar também
                # o índice de e-mail, fora do alvo do ON CONFLICT. Serializar por
                # sujeito mantém a criação e a abertura da sessão na mesma transação.
                await conexao.execute(
                    select(func.pg_advisory_xact_lock(func.hashtextextended(identidade.sujeito, 0)))
                )
                comando = inserir_postgresql(jogadores).values(
                    google_sujeito=identidade.sujeito,
                    email=identidade.email,
                    email_chave=identidade.email.strip().casefold(),
                )
                jogador_id = (
                    await conexao.execute(
                        comando.on_conflict_do_update(
                            index_elements=[jogadores.c.google_sujeito],
                            set_={
                                "email": comando.excluded.email,
                                "email_chave": comando.excluded.email_chave,
                            },
                        ).returning(jogadores.c.id)
                    )
                ).scalar_one()
                if anterior:
                    await conexao.execute(
                        update(sessoes_autenticacao)
                        .where(
                            sessoes_autenticacao.c.segredo_resumo == anterior,
                            sessoes_autenticacao.c.revogada_em.is_(None),
                        )
                        .values(revogada_em=agora)
                    )
                await conexao.execute(
                    insert(sessoes_autenticacao).values(
                        jogador_id=jogador_id,
                        segredo_resumo=resumo,
                        criado_em=agora,
                        expira_em=expira_em,
                    )
                )
        except IntegrityError as falha:
            diagnostico = getattr(falha.orig, "diag", None)
            if getattr(diagnostico, "constraint_name", None) != "uq_jogadores_email_chave":
                raise
            raise FalhaAutenticacao(
                "EMAIL_INDISPONIVEL", "Não foi possível vincular esta conta Google.", 409
            ) from falha

    async def consultar_sessao(self, resumo: str, agora: datetime) -> ContaAutenticada | None:
        async with self.motor.connect() as conexao:
            resultado = await conexao.execute(
                select(
                    jogadores.c.id.label("jogador_id"),
                    jogadores.c.email,
                    jogadores.c.estado,
                    jogadores.c.nome_usuario,
                    jogadores.c.avatar_id,
                    sessoes_autenticacao.c.expira_em,
                )
                .join(sessoes_autenticacao, jogadores.c.id == sessoes_autenticacao.c.jogador_id)
                .where(
                    sessoes_autenticacao.c.segredo_resumo == resumo,
                    sessoes_autenticacao.c.revogada_em.is_(None),
                    sessoes_autenticacao.c.expira_em > agora,
                    jogadores.c.estado != "anonimizado",
                )
            )
            registro = resultado.mappings().one_or_none()
            return ContaAutenticada(**registro) if registro else None

    async def revogar_sessao(self, resumo: str, agora: datetime) -> None:
        async with self.motor.begin() as conexao:
            await conexao.execute(
                update(sessoes_autenticacao)
                .where(
                    sessoes_autenticacao.c.segredo_resumo == resumo,
                    sessoes_autenticacao.c.revogada_em.is_(None),
                )
                .values(revogada_em=agora)
            )
