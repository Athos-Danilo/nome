"""Ações idempotentes, posições pontuadas, interrupções e resultados."""

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.dialects.postgresql import JSONB

from aplicacao.bancos.base import criacao, identificador, metadados

acoes_processadas = Table(
    "acoes_processadas",
    metadados,
    identificador(),
    Column("partida_id", ForeignKey("partidas.id"), nullable=False),
    Column("id_acao", Uuid, nullable=False),
    Column("tipo", String(40), nullable=False),
    Column("entrada_resumo", String(64)),
    Column("resultado", JSONB),
    Column("versao_aplicada", Integer, nullable=False),
    criacao(),
    UniqueConstraint("partida_id", "id"),
    UniqueConstraint("partida_id", "id_acao"),
    CheckConstraint("versao_aplicada > 0", name="versao"),
)

palpites = Table(
    "palpites",
    metadados,
    identificador(),
    Column("partida_id", ForeignKey("partidas.id"), nullable=False),
    Column("acao_id", Uuid, nullable=False, unique=True),
    Column("rodada_id", Uuid),
    Column("participante_id", Uuid),
    Column("tipo", String(10), nullable=False),
    Column("texto", Text),
    Column("dica_utilizada", Integer),
    Column("resultado", String(10), nullable=False),
    Column("pontos", Integer, nullable=False),
    criacao(),
    ForeignKeyConstraint(
        ["partida_id", "acao_id"], ["acoes_processadas.partida_id", "acoes_processadas.id"]
    ),
    ForeignKeyConstraint(["partida_id", "rodada_id"], ["rodadas.partida_id", "rodadas.id"]),
    ForeignKeyConstraint(
        ["partida_id", "participante_id"], ["participantes.partida_id", "participantes.id"]
    ),
    CheckConstraint("tipo IN ('letra', 'palavra')", name="tipo"),
    CheckConstraint("tipo <> 'palavra' OR rodada_id IS NOT NULL", name="alvo"),
    CheckConstraint(
        "tipo <> 'letra' OR (participante_id IS NOT NULL AND rodada_id IS NULL)",
        name="letra_global",
    ),
    CheckConstraint("dica_utilizada IS NULL OR dica_utilizada BETWEEN 1 AND 5", name="dica"),
    CheckConstraint("resultado IN ('acerto', 'erro', 'parcial') AND pontos >= 0", name="resultado"),
)

posicoes_reveladas = Table(
    "posicoes_reveladas",
    metadados,
    Column("rodada_id", Uuid, primary_key=True),
    Column("posicao", Integer, primary_key=True),
    Column("partida_id", Uuid, nullable=False),
    Column("acao_id", Uuid, nullable=False),
    Column("participante_id", Uuid, nullable=False),
    criacao(),
    ForeignKeyConstraint(["partida_id", "rodada_id"], ["rodadas.partida_id", "rodadas.id"]),
    ForeignKeyConstraint(
        ["partida_id", "acao_id"], ["acoes_processadas.partida_id", "acoes_processadas.id"]
    ),
    ForeignKeyConstraint(
        ["partida_id", "participante_id"], ["participantes.partida_id", "participantes.id"]
    ),
    CheckConstraint("posicao >= 0", name="posicao"),
)

letras_tentadas = Table(
    "letras_tentadas",
    metadados,
    Column("sessao_id", Uuid, primary_key=True),
    Column("letra", String(1), primary_key=True),
    Column("partida_id", Uuid, nullable=False),
    Column("acao_id", Uuid, nullable=False),
    Column("encontrada", Boolean, nullable=False),
    ForeignKeyConstraint(
        ["partida_id", "sessao_id"], ["sessoes_galera.partida_id", "sessoes_galera.id"]
    ),
    ForeignKeyConstraint(
        ["partida_id", "acao_id"], ["acoes_processadas.partida_id", "acoes_processadas.id"]
    ),
    CheckConstraint("letra ~ '^[A-ZÇ0-9]$'", name="familia"),
)

interrupcoes = Table(
    "interrupcoes",
    metadados,
    identificador(),
    Column("partida_id", ForeignKey("partidas.id"), nullable=False),
    Column("evento_id", Uuid, nullable=False),
    Column("origem", String(30), nullable=False),
    Column("classificacao", String(15), nullable=False, server_default="em_apuracao"),
    criacao(),
    Column("avisada_em", DateTime(timezone=True)),
    UniqueConstraint("partida_id", "id"),
    UniqueConstraint("partida_id", "evento_id"),
    CheckConstraint(
        "classificacao IN ('em_apuracao', 'pausa', 'recarga', 'encerramento', 'ignorada')",
        name="classificacao",
    ),
)

penalidades = Table(
    "penalidades",
    metadados,
    identificador(),
    Column("partida_id", Uuid, nullable=False),
    Column("interrupcao_id", Uuid, nullable=False, unique=True),
    Column("pontos", Integer, nullable=False),
    criacao(),
    ForeignKeyConstraint(
        ["partida_id", "interrupcao_id"], ["interrupcoes.partida_id", "interrupcoes.id"]
    ),
    CheckConstraint("pontos = -100", name="valor"),
)

exposicoes_conteudo = Table(
    "exposicoes_conteudo",
    metadados,
    Column("rodada_id", ForeignKey("rodadas.id"), primary_key=True),
    criacao(),
)

resultados_individuais = Table(
    "resultados_individuais",
    metadados,
    Column("partida_id", ForeignKey("partidas.id"), primary_key=True),
    Column("pontos", Integer, nullable=False),
    Column("acertos", Integer, nullable=False),
    Column("concluida", Boolean, nullable=False),
    criacao(),
    CheckConstraint("acertos >= 0", name="acertos"),
)
