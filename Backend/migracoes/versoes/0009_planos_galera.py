"""Planos privados de configuração da galera, sem expor reservas."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "planos_galera",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("jogador_id", sa.Uuid(), nullable=False),
        sa.Column("configuracao", JSONB(), nullable=False),
        sa.Column("reservas", JSONB(), nullable=False),
        sa.Column(
            "criado_em", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False),
        sa.Column("partida_id", sa.Uuid()),
        sa.PrimaryKeyConstraint("id", name="pk_planos_galera"),
        sa.ForeignKeyConstraint(
            ["jogador_id"], ["jogadores.id"], name="fk_planos_galera_jogador_id_jogadores"
        ),
        sa.ForeignKeyConstraint(
            ["partida_id"], ["partidas.id"], name="fk_planos_galera_partida_id_partidas"
        ),
        sa.UniqueConstraint("partida_id", name="uq_planos_galera_partida_id"),
        sa.CheckConstraint("expira_em > criado_em", name=op.f("ck_planos_galera_validade")),
    )
    op.create_index("ix_planos_galera_jogador_id", "planos_galera", ["jogador_id"])


def downgrade() -> None:
    op.drop_index("ix_planos_galera_jogador_id", table_name="planos_galera")
    op.drop_table("planos_galera")
