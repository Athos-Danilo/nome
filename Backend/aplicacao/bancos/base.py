"""Convenções e tipos comuns ao esquema relacional."""

from sqlalchemy import Column, DateTime, MetaData, Uuid, func, text

metadados = MetaData(
    naming_convention={
        "ix": "ix_%(table_name)s_%(column_0_name)s",
        "uq": "uq_%(table_name)s_%(column_0_N_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }
)


def identificador() -> Column:
    return Column("id", Uuid, primary_key=True, server_default=text("gen_random_uuid()"))


def criacao() -> Column:
    return Column("criado_em", DateTime(timezone=True), nullable=False, server_default=func.now())
