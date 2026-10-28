"""Tentativas OIDC temporárias, vinculadas ao navegador e consumidas uma única vez."""

import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tentativas_login",
        sa.Column("estado_resumo", sa.String(64), nullable=False),
        sa.Column("navegador_resumo", sa.String(64), nullable=False),
        sa.Column("nonce", sa.String(128), nullable=False),
        sa.Column("verificador", sa.String(128), nullable=False),
        sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("estado_resumo", name="pk_tentativas_login"),
    )
    op.create_index("ix_tentativas_login_expira_em", "tentativas_login", ["expira_em"])


def downgrade() -> None:
    op.drop_index("ix_tentativas_login_expira_em", table_name="tentativas_login")
    op.drop_table("tentativas_login")
