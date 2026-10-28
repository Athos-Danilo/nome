"""Coleção oficial de vinte avatares da primeira entrega."""

import sqlalchemy as sa
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

REGISTROS = [
    {
        "id": "aurelio_apresentador",
        "nome": "Aurélio apresentador",
        "recurso": "/api/avatares/recursos/aurelio_apresentador.svg",
    },
    {
        "id": "aurelio_oculos",
        "nome": "Aurélio de óculos",
        "recurso": "/api/avatares/recursos/aurelio_oculos.svg",
    },
    {
        "id": "aurelio_detetive",
        "nome": "Aurélio detetive",
        "recurso": "/api/avatares/recursos/aurelio_detetive.svg",
    },
    {
        "id": "aurelio_comemorando",
        "nome": "Aurélio comemorando",
        "recurso": "/api/avatares/recursos/aurelio_comemorando.svg",
    },
    {
        "id": "coruja_sabia",
        "nome": "Coruja sábia",
        "recurso": "/api/avatares/recursos/coruja_sabia.svg",
    },
    {
        "id": "onca_pintada",
        "nome": "Onça pintada",
        "recurso": "/api/avatares/recursos/onca_pintada.svg",
    },
    {
        "id": "capivara_zen",
        "nome": "Capivara zen",
        "recurso": "/api/avatares/recursos/capivara_zen.svg",
    },
    {
        "id": "tucano_tropical",
        "nome": "Tucano tropical",
        "recurso": "/api/avatares/recursos/tucano_tropical.svg",
    },
    {
        "id": "lampada_ideia",
        "nome": "Lâmpada de ideias",
        "recurso": "/api/avatares/recursos/lampada_ideia.svg",
    },
    {
        "id": "lupa_misterio",
        "nome": "Lupa do mistério",
        "recurso": "/api/avatares/recursos/lupa_misterio.svg",
    },
    {
        "id": "livro_encantado",
        "nome": "Livro encantado",
        "recurso": "/api/avatares/recursos/livro_encantado.svg",
    },
    {
        "id": "pena_tinteiro",
        "nome": "Pena e tinteiro",
        "recurso": "/api/avatares/recursos/pena_tinteiro.svg",
    },
    {
        "id": "claquete_cinema",
        "nome": "Claquete de cinema",
        "recurso": "/api/avatares/recursos/claquete_cinema.svg",
    },
    {
        "id": "pipoca_divertida",
        "nome": "Pipoca divertida",
        "recurso": "/api/avatares/recursos/pipoca_divertida.svg",
    },
    {
        "id": "trofeu_campeao",
        "nome": "Troféu de campeão",
        "recurso": "/api/avatares/recursos/trofeu_campeao.svg",
    },
    {
        "id": "cartola_magica",
        "nome": "Cartola mágica",
        "recurso": "/api/avatares/recursos/cartola_magica.svg",
    },
    {
        "id": "controle_arcade",
        "nome": "Controle arcade",
        "recurso": "/api/avatares/recursos/controle_arcade.svg",
    },
    {
        "id": "fita_cassete",
        "nome": "Fita cassete",
        "recurso": "/api/avatares/recursos/fita_cassete.svg",
    },
    {
        "id": "disco_vinil",
        "nome": "Disco de vinil",
        "recurso": "/api/avatares/recursos/disco_vinil.svg",
    },
    {
        "id": "dado_da_sorte",
        "nome": "Dado da sorte",
        "recurso": "/api/avatares/recursos/dado_da_sorte.svg",
    },
]


def upgrade() -> None:
    tabela = sa.table(
        "avatares",
        sa.column("id", sa.String),
        sa.column("nome", sa.String),
        sa.column("recurso", sa.String),
    )
    op.bulk_insert(tabela, REGISTROS)


def downgrade() -> None:
    tabela = sa.table("avatares", sa.column("id", sa.String))
    op.execute(tabela.delete().where(tabela.c.id.in_([registro["id"] for registro in REGISTROS])))
