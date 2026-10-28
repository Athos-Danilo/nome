"""Configuração confirmável sem sortear novamente no início da partida."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "planos_individuais",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("jogador_id", sa.Uuid(), nullable=False),
        sa.Column("configuracao", JSONB(), nullable=False),
        sa.Column("reservas", JSONB(), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False),
        sa.Column("partida_id", sa.Uuid(), nullable=True),
        sa.PrimaryKeyConstraint("id", name="pk_planos_individuais"),
        sa.ForeignKeyConstraint(
            ["jogador_id"], ["jogadores.id"], name="fk_planos_individuais_jogador_id_jogadores"
        ),
        sa.ForeignKeyConstraint(
            ["partida_id"], ["partidas.id"], name="fk_planos_individuais_partida_id_partidas"
        ),
        sa.UniqueConstraint("partida_id", name="uq_planos_individuais_partida_id"),
        sa.CheckConstraint("expira_em > criado_em", name="ck_planos_individuais_validade"),
    )
    op.create_index("ix_planos_individuais_jogador_id", "planos_individuais", ["jogador_id"])


def downgrade() -> None:
    op.drop_index("ix_planos_individuais_jogador_id", table_name="planos_individuais")
    op.drop_table("planos_individuais")
