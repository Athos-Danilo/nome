"""estrutura inicial dos dois modos

Revisão: 0001
Revisão anterior:
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "avatares",
        sa.Column("id", sa.String(length=60), nullable=False),
        sa.Column("nome", sa.String(length=80), nullable=False),
        sa.Column("recurso", sa.String(length=250), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_avatares")),
    )
    op.create_table(
        "jogadores",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("google_sujeito", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("email_chave", sa.String(length=320), nullable=True),
        sa.Column("nome_usuario", sa.String(length=20), nullable=True),
        sa.Column("nome_chave", sa.String(length=100), nullable=True),
        sa.Column("avatar_id", sa.String(length=60), nullable=True),
        sa.Column(
            "estado", sa.String(length=20), server_default="cadastro_pendente", nullable=False
        ),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column("anonimizado_em", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            (
                "(estado = 'anonimizado' AND google_sujeito IS NULL AND email IS NULL AND"
                " email_chave IS NULL AND nome_usuario IS NULL AND nome_chave IS NULL AND"
                " avatar_id IS NULL AND anonimizado_em IS NOT NULL) OR (estado <> "
                "'anonimizado' AND google_sujeito IS NOT NULL AND email IS NOT NULL AND "
                "email_chave IS NOT NULL AND anonimizado_em IS NULL)"
            ),
            name=op.f("ck_jogadores_identidade"),
        ),
        sa.CheckConstraint(
            (
                "estado <> 'ativo' OR (nome_usuario IS NOT NULL AND nome_chave IS NOT "
                "NULL AND avatar_id IS NOT NULL)"
            ),
            name=op.f("ck_jogadores_perfil_ativo"),
        ),
        sa.CheckConstraint(
            "estado IN ('cadastro_pendente', 'ativo', 'anonimizado')",
            name=op.f("ck_jogadores_estado"),
        ),
        sa.CheckConstraint(
            "nome_usuario IS NULL OR char_length(nome_usuario) BETWEEN 3 AND 20",
            name=op.f("ck_jogadores_tamanho_nome"),
        ),
        sa.ForeignKeyConstraint(
            ["avatar_id"], ["avatares.id"], name=op.f("fk_jogadores_avatar_id_avatares")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_jogadores")),
        sa.UniqueConstraint("email_chave", name=op.f("uq_jogadores_email_chave")),
        sa.UniqueConstraint("google_sujeito", name=op.f("uq_jogadores_google_sujeito")),
        sa.UniqueConstraint("nome_chave", name=op.f("uq_jogadores_nome_chave")),
    )
    op.create_table(
        "preferencias",
        sa.Column("jogador_id", sa.Uuid(), nullable=False),
        sa.Column("tema", sa.String(length=10), server_default="claro", nullable=False),
        sa.Column("musica_id", sa.String(length=60), nullable=True),
        sa.Column("volume_musica", sa.Integer(), server_default="70", nullable=False),
        sa.Column("volume_interface", sa.Integer(), server_default="70", nullable=False),
        sa.Column("volume_eventos", sa.Integer(), server_default="70", nullable=False),
        sa.Column("silenciado", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column(
            "movimentos_reduzidos", sa.Boolean(), server_default=sa.text("false"), nullable=False
        ),
        sa.CheckConstraint("tema IN ('claro', 'escuro')", name=op.f("ck_preferencias_tema")),
        sa.CheckConstraint(
            (
                "volume_musica BETWEEN 0 AND 100 AND volume_interface BETWEEN 0 AND 100 "
                "AND volume_eventos BETWEEN 0 AND 100"
            ),
            name=op.f("ck_preferencias_volumes"),
        ),
        sa.ForeignKeyConstraint(
            ["jogador_id"], ["jogadores.id"], name=op.f("fk_preferencias_jogador_id_jogadores")
        ),
        sa.PrimaryKeyConstraint("jogador_id", name=op.f("pk_preferencias")),
    )
    op.create_table(
        "sessoes_autenticacao",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("jogador_id", sa.Uuid(), nullable=False),
        sa.Column("segredo_resumo", sa.String(length=64), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revogada_em", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("expira_em > criado_em", name=op.f("ck_sessoes_autenticacao_validade")),
        sa.ForeignKeyConstraint(
            ["jogador_id"],
            ["jogadores.id"],
            name=op.f("fk_sessoes_autenticacao_jogador_id_jogadores"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sessoes_autenticacao")),
        sa.UniqueConstraint("segredo_resumo", name=op.f("uq_sessoes_autenticacao_segredo_resumo")),
    )
    op.create_index(
        op.f("ix_sessoes_autenticacao_jogador_id"),
        "sessoes_autenticacao",
        ["jogador_id"],
        unique=False,
    )
    op.create_table(
        "visitantes",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("segredo_resumo", sa.String(length=64), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column(
            "demonstracao_utilizada", sa.Boolean(), server_default=sa.text("false"), nullable=False
        ),
        sa.Column("jogador_vinculado_id", sa.Uuid(), nullable=True),
        sa.Column("vinculado_em", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "jogador_vinculado_id IS NULL OR vinculado_em IS NOT NULL",
            name=op.f("ck_visitantes_vinculo"),
        ),
        sa.ForeignKeyConstraint(
            ["jogador_vinculado_id"],
            ["jogadores.id"],
            name=op.f("fk_visitantes_jogador_vinculado_id_jogadores"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_visitantes")),
        sa.UniqueConstraint("segredo_resumo", name=op.f("uq_visitantes_segredo_resumo")),
    )
    op.create_table(
        "partidas",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("jogador_id", sa.Uuid(), nullable=True),
        sa.Column("visitante_id", sa.Uuid(), nullable=True),
        sa.Column("modo", sa.String(length=10), nullable=False),
        sa.Column("origem", sa.String(length=15), server_default="normal", nullable=False),
        sa.Column("estado", sa.String(length=15), server_default="preparada", nullable=False),
        sa.Column("configuracao", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("versao", sa.Integer(), server_default="0", nullable=False),
        sa.Column("pontuacao", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column("encerrada_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("motivo_encerramento", sa.String(length=30), nullable=True),
        sa.Column("resultado_galera", sa.String(length=10), nullable=True),
        sa.CheckConstraint(
            "(estado IN ('concluida', 'abandonada')) = (encerrada_em IS NOT NULL)",
            name=op.f("ck_partidas_encerramento"),
        ),
        sa.CheckConstraint(
            "estado IN ('preparada', 'em_andamento', 'pausada', 'concluida', 'abandonada')",
            name=op.f("ck_partidas_estado"),
        ),
        sa.CheckConstraint(
            "modo <> 'galera' OR estado <> 'pausada'", name=op.f("ck_partidas_sem_pausa_galera")
        ),
        sa.CheckConstraint(
            "modo <> 'galera' OR jogador_id IS NOT NULL", name=op.f("ck_partidas_anfitriao")
        ),
        sa.CheckConstraint("modo IN ('individual', 'galera')", name=op.f("ck_partidas_modo")),
        sa.CheckConstraint(
            "origem <> 'demonstracao' OR modo = 'individual'", name=op.f("ck_partidas_demonstracao")
        ),
        sa.CheckConstraint("origem IN ('normal', 'demonstracao')", name=op.f("ck_partidas_origem")),
        sa.CheckConstraint(
            (
                "resultado_galera IS NULL OR (modo = 'galera' AND resultado_galera IN "
                "('vencedor', 'empate'))"
            ),
            name=op.f("ck_partidas_resultado"),
        ),
        sa.CheckConstraint(
            "visitante_id IS NULL OR origem = 'demonstracao'", name=op.f("ck_partidas_visitante")
        ),
        sa.CheckConstraint(
            "(jogador_id IS NULL) <> (visitante_id IS NULL)", name=op.f("ck_partidas_proprietario")
        ),
        sa.CheckConstraint("versao >= 0", name=op.f("ck_partidas_versao")),
        sa.ForeignKeyConstraint(
            ["jogador_id"], ["jogadores.id"], name=op.f("fk_partidas_jogador_id_jogadores")
        ),
        sa.ForeignKeyConstraint(
            ["visitante_id"], ["visitantes.id"], name=op.f("fk_partidas_visitante_id_visitantes")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_partidas")),
        sa.UniqueConstraint("visitante_id", name=op.f("uq_partidas_visitante_id")),
    )
    op.create_index(op.f("ix_partidas_jogador_id"), "partidas", ["jogador_id"], unique=False)
    op.create_index(
        "uq_individual_em_aberto",
        "partidas",
        ["jogador_id"],
        unique=True,
        postgresql_where=sa.text(
            "modo = 'individual' AND estado IN ('preparada', 'em_andamento', 'pausada')"
        ),
    )
    op.create_table(
        "acoes_processadas",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("id_acao", sa.Uuid(), nullable=False),
        sa.Column("tipo", sa.String(length=40), nullable=False),
        sa.Column("entrada_resumo", sa.String(length=64), nullable=True),
        sa.Column("resultado", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("versao_aplicada", sa.Integer(), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.CheckConstraint("versao_aplicada > 0", name=op.f("ck_acoes_processadas_versao")),
        sa.ForeignKeyConstraint(
            ["partida_id"], ["partidas.id"], name=op.f("fk_acoes_processadas_partida_id_partidas")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_acoes_processadas")),
        sa.UniqueConstraint("partida_id", "id", name=op.f("uq_acoes_processadas_partida_id_id")),
        sa.UniqueConstraint(
            "partida_id", "id_acao", name=op.f("uq_acoes_processadas_partida_id_id_acao")
        ),
    )
    op.create_table(
        "interrupcoes",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("evento_id", sa.Uuid(), nullable=False),
        sa.Column("origem", sa.String(length=30), nullable=False),
        sa.Column(
            "classificacao", sa.String(length=15), server_default="em_apuracao", nullable=False
        ),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column("avisada_em", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "classificacao IN ('em_apuracao', 'pausa', 'recarga', 'encerramento', 'ignorada')",
            name=op.f("ck_interrupcoes_classificacao"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id"], ["partidas.id"], name=op.f("fk_interrupcoes_partida_id_partidas")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_interrupcoes")),
        sa.UniqueConstraint(
            "partida_id", "evento_id", name=op.f("uq_interrupcoes_partida_id_evento_id")
        ),
        sa.UniqueConstraint("partida_id", "id", name=op.f("uq_interrupcoes_partida_id_id")),
    )
    op.create_table(
        "participantes",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("nome", sa.String(length=20), nullable=True),
        sa.Column("nome_chave", sa.String(length=100), nullable=True),
        sa.Column("avatar_id", sa.String(length=60), nullable=True),
        sa.Column("anonimizado", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("anfitriao", sa.Boolean(), nullable=False),
        sa.Column("inscricao", sa.Integer(), nullable=False),
        sa.Column("pontuacao", sa.Integer(), server_default="0", nullable=False),
        sa.CheckConstraint(
            (
                "(anonimizado AND nome IS NULL AND nome_chave IS NULL AND avatar_id IS "
                "NULL) OR (NOT anonimizado AND nome IS NOT NULL AND nome_chave IS NOT "
                "NULL AND char_length(nome) BETWEEN 3 AND 20)"
            ),
            name=op.f("ck_participantes_identidade"),
        ),
        sa.CheckConstraint("inscricao BETWEEN 1 AND 3", name=op.f("ck_participantes_limite")),
        sa.CheckConstraint(
            "pontuacao >= 0 AND mod(pontuacao, 100) = 0", name=op.f("ck_participantes_pontos")
        ),
        sa.ForeignKeyConstraint(
            ["avatar_id"], ["avatares.id"], name=op.f("fk_participantes_avatar_id_avatares")
        ),
        sa.ForeignKeyConstraint(
            ["partida_id"], ["partidas.id"], name=op.f("fk_participantes_partida_id_partidas")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_participantes")),
        sa.UniqueConstraint("partida_id", "id", name=op.f("uq_participantes_partida_id_id")),
        sa.UniqueConstraint(
            "partida_id", "inscricao", name=op.f("uq_participantes_partida_id_inscricao")
        ),
        sa.UniqueConstraint(
            "partida_id", "nome_chave", name=op.f("uq_participantes_partida_id_nome_chave")
        ),
    )
    op.create_index(
        "uq_anfitriao_partida",
        "participantes",
        ["partida_id"],
        unique=True,
        postgresql_where=sa.text("anfitriao"),
    )
    op.create_table(
        "resultados_individuais",
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("pontos", sa.Integer(), nullable=False),
        sa.Column("acertos", sa.Integer(), nullable=False),
        sa.Column("concluida", sa.Boolean(), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.CheckConstraint("acertos >= 0", name=op.f("ck_resultados_individuais_acertos")),
        sa.ForeignKeyConstraint(
            ["partida_id"],
            ["partidas.id"],
            name=op.f("fk_resultados_individuais_partida_id_partidas"),
        ),
        sa.PrimaryKeyConstraint("partida_id", name=op.f("pk_resultados_individuais")),
    )
    op.create_table(
        "penalidades",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("interrupcao_id", sa.Uuid(), nullable=False),
        sa.Column("pontos", sa.Integer(), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.CheckConstraint("pontos = -100", name=op.f("ck_penalidades_valor")),
        sa.ForeignKeyConstraint(
            ["partida_id", "interrupcao_id"],
            ["interrupcoes.partida_id", "interrupcoes.id"],
            name=op.f("fk_penalidades_partida_id_interrupcoes"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_penalidades")),
        sa.UniqueConstraint("interrupcao_id", name=op.f("uq_penalidades_interrupcao_id")),
    )
    op.create_table(
        "sessoes_galera",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("numero", sa.Integer(), nullable=False),
        sa.Column("tematica_id", sa.String(length=60), nullable=False),
        sa.Column("desempate", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("estado", sa.String(length=15), server_default="reservada", nullable=False),
        sa.Column("participante_atual_id", sa.Uuid(), nullable=True),
        sa.CheckConstraint(
            "estado IN ('reservada', 'apresentada', 'concluida', 'encerrada')",
            name=op.f("ck_sessoes_galera_estado"),
        ),
        sa.CheckConstraint(
            "numero BETWEEN 1 AND 6 AND (desempate OR numero <= 5)",
            name=op.f("ck_sessoes_galera_numero"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id", "participante_atual_id"],
            ["participantes.partida_id", "participantes.id"],
            name=op.f("fk_sessoes_galera_partida_id_participantes"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id"], ["partidas.id"], name=op.f("fk_sessoes_galera_partida_id_partidas")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sessoes_galera")),
        sa.UniqueConstraint("partida_id", "id", name=op.f("uq_sessoes_galera_partida_id_id")),
        sa.UniqueConstraint(
            "partida_id", "numero", name=op.f("uq_sessoes_galera_partida_id_numero")
        ),
    )
    op.create_index(
        "uq_desempate_partida",
        "sessoes_galera",
        ["partida_id"],
        unique=True,
        postgresql_where=sa.text("desempate"),
    )
    op.create_table(
        "letras_tentadas",
        sa.Column("sessao_id", sa.Uuid(), nullable=False),
        sa.Column("letra", sa.String(length=1), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("acao_id", sa.Uuid(), nullable=False),
        sa.Column("encontrada", sa.Boolean(), nullable=False),
        sa.CheckConstraint("letra ~ '^[A-ZÇ]$'", name=op.f("ck_letras_tentadas_familia")),
        sa.ForeignKeyConstraint(
            ["partida_id", "acao_id"],
            ["acoes_processadas.partida_id", "acoes_processadas.id"],
            name=op.f("fk_letras_tentadas_partida_id_acoes_processadas"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id", "sessao_id"],
            ["sessoes_galera.partida_id", "sessoes_galera.id"],
            name=op.f("fk_letras_tentadas_partida_id_sessoes_galera"),
        ),
        sa.PrimaryKeyConstraint("sessao_id", "letra", name=op.f("pk_letras_tentadas")),
    )
    op.create_table(
        "ordens_participantes",
        sa.Column("sessao_id", sa.Uuid(), nullable=False),
        sa.Column("participante_id", sa.Uuid(), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("posicao", sa.Integer(), nullable=False),
        sa.CheckConstraint("posicao BETWEEN 1 AND 3", name=op.f("ck_ordens_participantes_posicao")),
        sa.ForeignKeyConstraint(
            ["partida_id", "participante_id"],
            ["participantes.partida_id", "participantes.id"],
            name=op.f("fk_ordens_participantes_partida_id_participantes"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id", "sessao_id"],
            ["sessoes_galera.partida_id", "sessoes_galera.id"],
            name=op.f("fk_ordens_participantes_partida_id_sessoes_galera"),
        ),
        sa.PrimaryKeyConstraint(
            "sessao_id", "participante_id", name=op.f("pk_ordens_participantes")
        ),
        sa.UniqueConstraint(
            "sessao_id", "posicao", name=op.f("uq_ordens_participantes_sessao_id_posicao")
        ),
    )
    op.create_table(
        "rodadas",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("sessao_id", sa.Uuid(), nullable=True),
        sa.Column("ordem", sa.Integer(), nullable=False),
        sa.Column("palavra_id", sa.String(length=100), nullable=False),
        sa.Column("revisao", sa.Integer(), nullable=False),
        sa.Column("dificuldade", sa.String(length=10), nullable=False),
        sa.Column("estado", sa.String(length=12), server_default="reservada", nullable=False),
        sa.Column("dica_atual", sa.Integer(), nullable=True),
        sa.Column("apresentada_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("pontuacao", sa.Integer(), server_default="0", nullable=False),
        sa.CheckConstraint(
            "dificuldade IN ('facil', 'medio', 'dificil')", name=op.f("ck_rodadas_dificuldade")
        ),
        sa.CheckConstraint(
            "estado = 'reservada' OR apresentada_em IS NOT NULL",
            name=op.f("ck_rodadas_apresentacao"),
        ),
        sa.CheckConstraint(
            "estado IN ('reservada', 'apresentada', 'acertada', 'desistida')",
            name=op.f("ck_rodadas_estado"),
        ),
        sa.CheckConstraint(
            (
                "(sessao_id IS NULL AND dica_atual BETWEEN 1 AND 5 AND dica_atual IS NOT "
                "NULL AND pontuacao IN (0,20,40,60,80,100)) OR (sessao_id IS NOT NULL AND"
                " dica_atual IS NULL AND pontuacao >= 0 AND mod(pontuacao, 100) = 0)"
            ),
            name=op.f("ck_rodadas_modo"),
        ),
        sa.CheckConstraint("ordem > 0 AND revisao > 0", name=op.f("ck_rodadas_referencia")),
        sa.ForeignKeyConstraint(
            ["partida_id", "sessao_id"],
            ["sessoes_galera.partida_id", "sessoes_galera.id"],
            name=op.f("fk_rodadas_partida_id_sessoes_galera"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id"], ["partidas.id"], name=op.f("fk_rodadas_partida_id_partidas")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_rodadas")),
        sa.UniqueConstraint("partida_id", "id", name=op.f("uq_rodadas_partida_id_id")),
        sa.UniqueConstraint(
            "partida_id", "palavra_id", name=op.f("uq_rodadas_partida_id_palavra_id")
        ),
        sa.UniqueConstraint("sessao_id", "id", name=op.f("uq_rodadas_sessao_id_id")),
    )
    op.create_index(
        "uq_ordem_individual",
        "rodadas",
        ["partida_id", "ordem"],
        unique=True,
        postgresql_where=sa.text("sessao_id IS NULL"),
    )
    op.create_index(
        "uq_ordem_painel",
        "rodadas",
        ["sessao_id", "ordem"],
        unique=True,
        postgresql_where=sa.text("sessao_id IS NOT NULL"),
    )
    op.create_table(
        "exposicoes_conteudo",
        sa.Column("rodada_id", sa.Uuid(), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.ForeignKeyConstraint(
            ["rodada_id"], ["rodadas.id"], name=op.f("fk_exposicoes_conteudo_rodada_id_rodadas")
        ),
        sa.PrimaryKeyConstraint("rodada_id", name=op.f("pk_exposicoes_conteudo")),
    )
    op.create_table(
        "palpites",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("acao_id", sa.Uuid(), nullable=False),
        sa.Column("rodada_id", sa.Uuid(), nullable=True),
        sa.Column("participante_id", sa.Uuid(), nullable=True),
        sa.Column("tipo", sa.String(length=10), nullable=False),
        sa.Column("texto", sa.Text(), nullable=True),
        sa.Column("dica_utilizada", sa.Integer(), nullable=True),
        sa.Column("resultado", sa.String(length=10), nullable=False),
        sa.Column("pontos", sa.Integer(), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.CheckConstraint(
            "resultado IN ('acerto', 'erro', 'parcial') AND pontos >= 0",
            name=op.f("ck_palpites_resultado"),
        ),
        sa.CheckConstraint(
            "tipo <> 'letra' OR (participante_id IS NOT NULL AND rodada_id IS NULL)",
            name=op.f("ck_palpites_letra_global"),
        ),
        sa.CheckConstraint(
            "tipo <> 'palavra' OR rodada_id IS NOT NULL", name=op.f("ck_palpites_alvo")
        ),
        sa.CheckConstraint("tipo IN ('letra', 'palavra')", name=op.f("ck_palpites_tipo")),
        sa.CheckConstraint(
            "dica_utilizada IS NULL OR dica_utilizada BETWEEN 1 AND 5",
            name=op.f("ck_palpites_dica"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id", "acao_id"],
            ["acoes_processadas.partida_id", "acoes_processadas.id"],
            name=op.f("fk_palpites_partida_id_acoes_processadas"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id", "participante_id"],
            ["participantes.partida_id", "participantes.id"],
            name=op.f("fk_palpites_partida_id_participantes"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id", "rodada_id"],
            ["rodadas.partida_id", "rodadas.id"],
            name=op.f("fk_palpites_partida_id_rodadas"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id"], ["partidas.id"], name=op.f("fk_palpites_partida_id_partidas")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_palpites")),
        sa.UniqueConstraint("acao_id", name=op.f("uq_palpites_acao_id")),
    )
    op.create_table(
        "posicoes_reveladas",
        sa.Column("rodada_id", sa.Uuid(), nullable=False),
        sa.Column("posicao", sa.Integer(), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("acao_id", sa.Uuid(), nullable=False),
        sa.Column("participante_id", sa.Uuid(), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.CheckConstraint("posicao >= 0", name=op.f("ck_posicoes_reveladas_posicao")),
        sa.ForeignKeyConstraint(
            ["partida_id", "acao_id"],
            ["acoes_processadas.partida_id", "acoes_processadas.id"],
            name=op.f("fk_posicoes_reveladas_partida_id_acoes_processadas"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id", "participante_id"],
            ["participantes.partida_id", "participantes.id"],
            name=op.f("fk_posicoes_reveladas_partida_id_participantes"),
        ),
        sa.ForeignKeyConstraint(
            ["partida_id", "rodada_id"],
            ["rodadas.partida_id", "rodadas.id"],
            name=op.f("fk_posicoes_reveladas_partida_id_rodadas"),
        ),
        sa.PrimaryKeyConstraint("rodada_id", "posicao", name=op.f("pk_posicoes_reveladas")),
    )


def downgrade() -> None:
    op.drop_table("posicoes_reveladas")
    op.drop_table("palpites")
    op.drop_table("exposicoes_conteudo")
    op.drop_index(
        "uq_ordem_painel", table_name="rodadas", postgresql_where=sa.text("sessao_id IS NOT NULL")
    )
    op.drop_index(
        "uq_ordem_individual", table_name="rodadas", postgresql_where=sa.text("sessao_id IS NULL")
    )
    op.drop_table("rodadas")
    op.drop_table("ordens_participantes")
    op.drop_table("letras_tentadas")
    op.drop_index(
        "uq_desempate_partida", table_name="sessoes_galera", postgresql_where=sa.text("desempate")
    )
    op.drop_table("sessoes_galera")
    op.drop_table("penalidades")
    op.drop_table("resultados_individuais")
    op.drop_index(
        "uq_anfitriao_partida", table_name="participantes", postgresql_where=sa.text("anfitriao")
    )
    op.drop_table("participantes")
    op.drop_table("interrupcoes")
    op.drop_table("acoes_processadas")
    op.drop_index(
        "uq_individual_em_aberto",
        table_name="partidas",
        postgresql_where=sa.text(
            "modo = 'individual' AND estado IN ('preparada', 'em_andamento', 'pausada')"
        ),
    )
    op.drop_index(op.f("ix_partidas_jogador_id"), table_name="partidas")
    op.drop_table("partidas")
    op.drop_table("visitantes")
    op.drop_index(op.f("ix_sessoes_autenticacao_jogador_id"), table_name="sessoes_autenticacao")
    op.drop_table("sessoes_autenticacao")
    op.drop_table("preferencias")
    op.drop_table("jogadores")
    op.drop_table("avatares")
