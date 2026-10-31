"""Preferência independente da trilha do menu."""

import sqlalchemy as sa
from alembic import op

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "preferencias",
        sa.Column("musica_menu_ativa", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade() -> None:
    op.drop_column("preferencias", "musica_menu_ativa")
