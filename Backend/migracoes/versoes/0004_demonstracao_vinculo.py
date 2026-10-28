"""Manter o vínculo com a partida após trocar seu proprietário."""

import sqlalchemy as sa
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("visitantes", sa.Column("demonstracao_id", sa.Uuid(), nullable=True))
    op.create_foreign_key(
        "fk_visitantes_demonstracao_id_partidas",
        "visitantes",
        "partidas",
        ["demonstracao_id"],
        ["id"],
    )
    op.create_unique_constraint("uq_visitantes_demonstracao_id", "visitantes", ["demonstracao_id"])
    op.execute(
        "UPDATE visitantes SET demonstracao_id = partidas.id "
        "FROM partidas WHERE partidas.visitante_id = visitantes.id"
    )


def downgrade() -> None:
    op.drop_constraint("uq_visitantes_demonstracao_id", "visitantes", type_="unique")
    op.drop_constraint("fk_visitantes_demonstracao_id_partidas", "visitantes", type_="foreignkey")
    op.drop_column("visitantes", "demonstracao_id")
