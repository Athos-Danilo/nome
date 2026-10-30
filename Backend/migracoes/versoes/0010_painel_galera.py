"""Progresso sem respostas e cronômetro por sessão da galera."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("partidas", sa.Column("progresso_galera", JSONB()))
    op.add_column("sessoes_galera", sa.Column("intervalos_tempo", JSONB()))
    op.drop_constraint(op.f("ck_letras_tentadas_familia"), "letras_tentadas", type_="check")
    op.create_check_constraint(
        op.f("ck_letras_tentadas_familia"), "letras_tentadas", "letra ~ '^[A-ZÇ0-9]$'"
    )


def downgrade() -> None:
    # Não descartar letras numéricas já tentadas para simular reversão sem perda.
    op.drop_constraint(op.f("ck_letras_tentadas_familia"), "letras_tentadas", type_="check")
    op.create_check_constraint(
        op.f("ck_letras_tentadas_familia"), "letras_tentadas", "letra ~ '^[A-ZÇ]$'"
    )
    op.drop_column("sessoes_galera", "intervalos_tempo")
    op.drop_column("partidas", "progresso_galera")
