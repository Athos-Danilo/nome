"""Intervalos ativos informativos, sem reconstruir tempos antigos."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("rodadas", sa.Column("intervalos_tempo", JSONB(), nullable=True))


def downgrade() -> None:
    op.drop_column("rodadas", "intervalos_tempo")
