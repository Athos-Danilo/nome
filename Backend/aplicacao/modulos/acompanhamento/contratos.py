"""Dados internos de leitura, independentes dos adaptadores de banco."""

from dataclasses import dataclass

from aplicacao.modulos.acompanhamento.esquemas import ItemHistorico, Resumo


@dataclass(frozen=True)
class GrupoRodadas:
    palavra_id: str
    revisao: int
    dificuldade: str
    estado: str
    dica: int
    quantidade: int
    pontos: int
    erros: int


@dataclass(frozen=True)
class DadosEstatisticas:
    resumo: Resumo
    em_aberto: ItemHistorico | None
    grupos: list[GrupoRodadas]
