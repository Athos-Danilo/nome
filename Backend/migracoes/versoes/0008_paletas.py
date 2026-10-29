"""Preferência de paleta independente do tema claro/escuro."""

import sqlalchemy as sa
from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "preferencias",
        sa.Column("paleta", sa.String(10), nullable=False, server_default="original"),
    )
    op.create_check_constraint(
        op.f("ck_preferencias_paleta"),
        "preferencias",
        "paleta IN ('original', 'azul', 'roxa', 'grafite')",
    )


def downgrade() -> None:
    op.drop_constraint(op.f("ck_preferencias_paleta"), "preferencias", type_="check")
    op.drop_column("preferencias", "paleta")
