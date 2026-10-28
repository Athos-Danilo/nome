"""Progresso relacional dos dois modos, sem copiar o catálogo de respostas."""

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    String,
    Table,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB

from aplicacao.bancos.base import criacao, identificador, metadados

partidas = Table(
    "partidas",
    metadados,
    identificador(),
    Column("jogador_id", ForeignKey("jogadores.id"), index=True),
    Column("visitante_id", ForeignKey("visitantes.id"), unique=True),
    Column("modo", String(10), nullable=False),
    Column("origem", String(15), nullable=False, server_default="normal"),
    Column("estado", String(15), nullable=False, server_default="preparada"),
    Column("configuracao", JSONB, nullable=False),
    Column("versao", Integer, nullable=False, server_default="0"),
    Column("pontuacao", Integer, nullable=False, server_default="0"),
    criacao(),
    Column("encerrada_em", DateTime(timezone=True)),
    Column("motivo_encerramento", String(30)),
    Column("resultado_galera", String(10)),
    CheckConstraint("(jogador_id IS NULL) <> (visitante_id IS NULL)", name="proprietario"),
    CheckConstraint("modo IN ('individual', 'galera')", name="modo"),
    CheckConstraint("origem IN ('normal', 'demonstracao')", name="origem"),
    CheckConstraint("origem <> 'demonstracao' OR modo = 'individual'", name="demonstracao"),
    CheckConstraint("visitante_id IS NULL OR origem = 'demonstracao'", name="visitante"),
    CheckConstraint("modo <> 'galera' OR jogador_id IS NOT NULL", name="anfitriao"),
    CheckConstraint(
        "estado IN ('preparada', 'em_andamento', 'pausada', 'concluida', 'abandonada')",
        name="estado",
    ),
    CheckConstraint("modo <> 'galera' OR estado <> 'pausada'", name="sem_pausa_galera"),
    CheckConstraint("versao >= 0", name="versao"),
    CheckConstraint(
        "(estado IN ('concluida', 'abandonada')) = (encerrada_em IS NOT NULL)", name="encerramento"
    ),
    CheckConstraint(
        "resultado_galera IS NULL OR (modo = 'galera' AND "
        "resultado_galera IN ('vencedor', 'empate'))",
        name="resultado",
    ),
)
Index(
    "uq_individual_em_aberto",
    partidas.c.jogador_id,
    unique=True,
    postgresql_where=text(
        "modo = 'individual' AND estado IN ('preparada', 'em_andamento', 'pausada')"
    ),
)

planos_individuais = Table(
    "planos_individuais",
    metadados,
    identificador(),
    Column("jogador_id", ForeignKey("jogadores.id"), nullable=False, index=True),
    Column("configuracao", JSONB, nullable=False),
    Column("reservas", JSONB, nullable=False),
    criacao(),
    Column("expira_em", DateTime(timezone=True), nullable=False),
    Column("partida_id", ForeignKey("partidas.id"), unique=True),
    CheckConstraint("expira_em > criado_em", name="validade"),
)

participantes = Table(
    "participantes",
    metadados,
    identificador(),
    Column("partida_id", ForeignKey("partidas.id"), nullable=False),
    Column("nome", String(20)),
    Column("nome_chave", String(100)),
    Column("avatar_id", ForeignKey("avatares.id")),
    Column("anonimizado", Boolean, nullable=False, server_default=text("false")),
    Column("anfitriao", Boolean, nullable=False),
    Column("inscricao", Integer, nullable=False),
    Column("pontuacao", Integer, nullable=False, server_default="0"),
    UniqueConstraint("partida_id", "id"),
    UniqueConstraint("partida_id", "inscricao"),
    UniqueConstraint("partida_id", "nome_chave"),
    CheckConstraint("inscricao BETWEEN 1 AND 3", name="limite"),
    CheckConstraint("pontuacao >= 0 AND mod(pontuacao, 100) = 0", name="pontos"),
    CheckConstraint(
        "(anonimizado AND nome IS NULL AND nome_chave IS NULL AND avatar_id IS NULL) OR "
        "(NOT anonimizado AND nome IS NOT NULL AND nome_chave IS NOT NULL "
        "AND char_length(nome) BETWEEN 3 AND 20)",
        name="identidade",
    ),
)
Index(
    "uq_anfitriao_partida",
    participantes.c.partida_id,
    unique=True,
    postgresql_where=text("anfitriao"),
)

sessoes_galera = Table(
    "sessoes_galera",
    metadados,
    identificador(),
    Column("partida_id", ForeignKey("partidas.id"), nullable=False),
    Column("numero", Integer, nullable=False),
    Column("tematica_id", String(60), nullable=False),
    Column("desempate", Boolean, nullable=False, server_default=text("false")),
    Column("estado", String(15), nullable=False, server_default="reservada"),
    Column("participante_atual_id", Uuid),
    UniqueConstraint("partida_id", "id"),
    UniqueConstraint("partida_id", "numero"),
    ForeignKeyConstraint(
        ["partida_id", "participante_atual_id"], ["participantes.partida_id", "participantes.id"]
    ),
    CheckConstraint("numero BETWEEN 1 AND 6 AND (desempate OR numero <= 5)", name="numero"),
    CheckConstraint(
        "estado IN ('reservada', 'apresentada', 'concluida', 'encerrada')", name="estado"
    ),
)
Index(
    "uq_desempate_partida",
    sessoes_galera.c.partida_id,
    unique=True,
    postgresql_where=text("desempate"),
)

ordens_participantes = Table(
    "ordens_participantes",
    metadados,
    Column("sessao_id", Uuid, primary_key=True),
    Column("participante_id", Uuid, primary_key=True),
    Column("partida_id", Uuid, nullable=False),
    Column("posicao", Integer, nullable=False),
    ForeignKeyConstraint(
        ["partida_id", "sessao_id"], ["sessoes_galera.partida_id", "sessoes_galera.id"]
    ),
    ForeignKeyConstraint(
        ["partida_id", "participante_id"], ["participantes.partida_id", "participantes.id"]
    ),
    UniqueConstraint("sessao_id", "posicao"),
    CheckConstraint("posicao BETWEEN 1 AND 3", name="posicao"),
)

rodadas = Table(
    "rodadas",
    metadados,
    identificador(),
    Column("partida_id", ForeignKey("partidas.id"), nullable=False),
    Column("sessao_id", Uuid),
    Column("ordem", Integer, nullable=False),
    Column("palavra_id", String(100), nullable=False),
    Column("revisao", Integer, nullable=False),
    Column("dificuldade", String(10), nullable=False),
    Column("estado", String(12), nullable=False, server_default="reservada"),
    Column("dica_atual", Integer),
    Column("apresentada_em", DateTime(timezone=True)),
    Column("pontuacao", Integer, nullable=False, server_default="0"),
    UniqueConstraint("partida_id", "id"),
    UniqueConstraint("sessao_id", "id"),
    UniqueConstraint("partida_id", "palavra_id"),
    ForeignKeyConstraint(
        ["partida_id", "sessao_id"], ["sessoes_galera.partida_id", "sessoes_galera.id"]
    ),
    CheckConstraint("ordem > 0 AND revisao > 0", name="referencia"),
    CheckConstraint("dificuldade IN ('facil', 'medio', 'dificil')", name="dificuldade"),
    CheckConstraint(
        "estado IN ('reservada', 'apresentada', 'acertada', 'desistida')", name="estado"
    ),
    CheckConstraint(
        "(sessao_id IS NULL AND dica_atual BETWEEN 1 AND 5 AND "
        "dica_atual IS NOT NULL AND pontuacao IN (0,20,40,60,80,100)) OR "
        "(sessao_id IS NOT NULL AND dica_atual IS NULL AND pontuacao >= 0 "
        "AND mod(pontuacao, 100) = 0)",
        name="modo",
    ),
    CheckConstraint("estado = 'reservada' OR apresentada_em IS NOT NULL", name="apresentacao"),
)
Index(
    "uq_ordem_individual",
    rodadas.c.partida_id,
    rodadas.c.ordem,
    unique=True,
    postgresql_where=text("sessao_id IS NULL"),
)
Index(
    "uq_ordem_painel",
    rodadas.c.sessao_id,
    rodadas.c.ordem,
    unique=True,
    postgresql_where=text("sessao_id IS NOT NULL"),
)
