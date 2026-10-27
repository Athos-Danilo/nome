"""Entrada exigida pelo Alembic; conexão obtida do ambiente privado."""

from alembic import context
from sqlalchemy import create_engine, pool

from aplicacao.bancos.conexao import url_postgresql
from aplicacao.bancos.esquema import metadados


def migrar_sem_conexao() -> None:
    context.configure(
        dialect_name="postgresql",
        target_metadata=metadados,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def migrar_com_conexao() -> None:
    with create_engine(url_postgresql(), poolclass=pool.NullPool).connect() as conexao:
        context.configure(connection=conexao, target_metadata=metadados, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    migrar_sem_conexao()
else:
    migrar_com_conexao()
