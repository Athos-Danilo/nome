"""Identidade removível separada dos resultados que podem permanecer anônimos."""

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Uuid,
    text,
)

from aplicacao.bancos.base import criacao, identificador, metadados

avatares = Table(
    "avatares",
    metadados,
    Column("id", String(60), primary_key=True),
    Column("nome", String(80), nullable=False),
    Column("recurso", String(250), nullable=False),
)

jogadores = Table(
    "jogadores",
    metadados,
    identificador(),
    Column("google_sujeito", String(255), unique=True),
    Column("email", String(320)),
    Column("email_chave", String(320), unique=True),
    Column("nome_usuario", String(20)),
    Column("nome_chave", String(100), unique=True),
    Column("avatar_id", ForeignKey("avatares.id")),
    Column("estado", String(20), nullable=False, server_default="cadastro_pendente"),
    criacao(),
    Column("anonimizado_em", DateTime(timezone=True)),
    CheckConstraint("estado IN ('cadastro_pendente', 'ativo', 'anonimizado')", name="estado"),
    CheckConstraint(
        "(estado = 'anonimizado' AND google_sujeito IS NULL AND email IS NULL "
        "AND email_chave IS NULL AND nome_usuario IS NULL AND nome_chave IS NULL "
        "AND avatar_id IS NULL AND anonimizado_em IS NOT NULL) OR "
        "(estado <> 'anonimizado' AND google_sujeito IS NOT NULL AND email IS NOT NULL "
        "AND email_chave IS NOT NULL AND anonimizado_em IS NULL)",
        name="identidade",
    ),
    CheckConstraint(
        "estado <> 'ativo' OR (nome_usuario IS NOT NULL AND nome_chave IS NOT NULL "
        "AND avatar_id IS NOT NULL)",
        name="perfil_ativo",
    ),
    CheckConstraint(
        "nome_usuario IS NULL OR char_length(nome_usuario) BETWEEN 3 AND 20", name="tamanho_nome"
    ),
)

preferencias = Table(
    "preferencias",
    metadados,
    Column("jogador_id", ForeignKey("jogadores.id"), primary_key=True),
    Column("tema", String(10), nullable=False, server_default="claro"),
    Column("paleta", String(10), nullable=False, server_default="original"),
    CheckConstraint("paleta IN ('original', 'azul', 'roxa', 'grafite')", name="paleta"),
    Column("musica_id", String(60)),
    Column("volume_musica", Integer, nullable=False, server_default="70"),
    Column("volume_interface", Integer, nullable=False, server_default="70"),
    Column("volume_eventos", Integer, nullable=False, server_default="70"),
    Column("silenciado", Boolean, nullable=False, server_default=text("false")),
    Column("movimentos_reduzidos", Boolean, nullable=False, server_default=text("false")),
    CheckConstraint("tema IN ('claro', 'escuro')", name="tema"),
    CheckConstraint(
        "volume_musica BETWEEN 0 AND 100 AND volume_interface BETWEEN 0 AND 100 "
        "AND volume_eventos BETWEEN 0 AND 100",
        name="volumes",
    ),
)

sessoes_autenticacao = Table(
    "sessoes_autenticacao",
    metadados,
    identificador(),
    Column("jogador_id", ForeignKey("jogadores.id"), nullable=False, index=True),
    Column("segredo_resumo", String(64), nullable=False, unique=True),
    criacao(),
    Column("expira_em", DateTime(timezone=True), nullable=False),
    Column("revogada_em", DateTime(timezone=True)),
    CheckConstraint("expira_em > criado_em", name="validade"),
)

tentativas_login = Table(
    "tentativas_login",
    metadados,
    Column("estado_resumo", String(64), primary_key=True),
    Column("navegador_resumo", String(64), nullable=False),
    Column("nonce", String(128), nullable=False),
    Column("verificador", String(128), nullable=False),
    Column("expira_em", DateTime(timezone=True), nullable=False, index=True),
)

visitantes = Table(
    "visitantes",
    metadados,
    identificador(),
    Column("segredo_resumo", String(64), nullable=False, unique=True),
    criacao(),
    Column("demonstracao_utilizada", Boolean, nullable=False, server_default=text("false")),
    Column("demonstracao_id", Uuid, ForeignKey("partidas.id", use_alter=True), unique=True),
    Column("jogador_vinculado_id", Uuid, ForeignKey("jogadores.id", ondelete="SET NULL")),
    Column("vinculado_em", DateTime(timezone=True)),
    CheckConstraint("jogador_vinculado_id IS NULL OR vinculado_em IS NOT NULL", name="vinculo"),
)
