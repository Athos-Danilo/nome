"""Conexões persistidas e rascunho da rodada individual."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("rodadas", sa.Column("rascunho", JSONB(), nullable=True))
    op.create_table(
        "conexoes_individuais",
        sa.Column("partida_id", sa.Uuid(), nullable=False),
        sa.Column("aba_id", sa.Uuid(), nullable=False),
        sa.Column("documento_id", sa.Uuid(), nullable=False),
        sa.Column(
            "ultimo_sinal",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("evento_pendente_id", sa.Uuid(), nullable=True),
        sa.Column("persistido", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.PrimaryKeyConstraint("partida_id", "aba_id", name="pk_conexoes_individuais"),
        sa.ForeignKeyConstraint(
            ["partida_id"], ["partidas.id"], name="fk_conexoes_individuais_partida_id_partidas"
        ),
    )


def downgrade() -> None:
    op.drop_table("conexoes_individuais")
    op.drop_column("rodadas", "rascunho")
