"""Configuração privada da conexão usada pelas migrações."""

from sqlalchemy.engine import URL, make_url

from aplicacao.nucleo.configuracoes import Configuracoes


def url_postgresql() -> URL:
    segredo = Configuracoes().postgresql_url
    if segredo is None:
        raise ValueError("Configure DECIFRA_POSTGRESQL_URL antes de executar migrações.")
    endereco = make_url(segredo.get_secret_value())
    if endereco.drivername not in {"postgresql", "postgresql+psycopg"}:
        raise ValueError("A conexão deve utilizar PostgreSQL com Psycopg 3.")
    return endereco.set(drivername="postgresql+psycopg")
