"""Validação completa antes de permitir qualquer gravação no MongoDB."""

import json
from dataclasses import dataclass, field
from pathlib import Path

from pydantic import ValidationError

from aplicacao.bancos.conteudo import ConteudoPalavra, LotePalavras, chave_da_resposta


@dataclass(frozen=True)
class ItemCatalogo:
    arquivo: Path
    lote: str
    posicao: int
    conteudo: ConteudoPalavra


@dataclass
class ValidacaoCatalogo:
    itens: list[ItemCatalogo] = field(default_factory=list)
    erros: list[str] = field(default_factory=list)


def mensagem_de_validacao(erro: dict) -> str:
    if erro["type"] == "value_error":
        return str(erro.get("ctx", {}).get("error", "Valor inválido."))
    mensagens = {
        "missing": "Campo obrigatório ausente.",
        "extra_forbidden": "Campo não previsto no contrato.",
        "literal_error": "Valor fora das opções permitidas.",
        "string_type": "O valor deve ser um texto.",
        "list_type": "O valor deve ser uma lista.",
        "string_pattern_mismatch": "Identificador fora do padrão permitido.",
        "too_short": "Texto ou lista abaixo do tamanho mínimo permitido.",
        "too_long": "Texto ou lista acima do tamanho máximo permitido.",
    }
    return mensagens.get(erro["type"], "Valor incompatível com o contrato do catálogo.")


def objeto_sem_campos_repetidos(pares: list[tuple[str, object]]) -> dict:
    objeto = {}
    for chave, valor in pares:
        if chave in objeto:
            raise ValueError(f"Campo JSON repetido: {chave}.")
        objeto[chave] = valor
    return objeto


def validar_arquivos(arquivos: list[Path]) -> ValidacaoCatalogo:
    resultado = ValidacaoCatalogo()
    identificadores: dict[str, str] = {}
    respostas: dict[str, str] = {}
    lotes: set[str] = set()
    if not arquivos:
        resultado.erros.append("Nenhum arquivo JSON foi selecionado.")
    for arquivo in arquivos:
        try:
            dados = json.loads(
                arquivo.read_text(encoding="utf-8"), object_pairs_hook=objeto_sem_campos_repetidos
            )
            lote = LotePalavras.model_validate(dados)
        except ValidationError as falha:
            for erro in falha.errors(include_url=False, include_input=False):
                caminho = ".".join(
                    str(parte + 1) if isinstance(parte, int) else str(parte)
                    for parte in erro["loc"]
                )
                resultado.erros.append(f"{arquivo}: {caminho}: {mensagem_de_validacao(erro)}")
            continue
        except (OSError, ValueError) as falha:
            resultado.erros.append(f"{arquivo}: JSON/arquivo inválido ({falha}).")
            continue
        if lote.lote != arquivo.stem:
            resultado.erros.append(f"{arquivo}: lote deve corresponder ao nome do arquivo.")
        if lote.lote in lotes:
            resultado.erros.append(f"{arquivo}: identificador de lote repetido: {lote.lote}.")
        lotes.add(lote.lote)
        for posicao, conteudo in enumerate(lote.palavras, start=1):
            origem = f"{arquivo}: palavras.{posicao} ({conteudo.id})"
            for valor, anteriores, nome in (
                (conteudo.id, identificadores, "identificador"),
                (chave_da_resposta(conteudo.resposta), respostas, "resposta normalizada"),
            ):
                if valor in anteriores:
                    resultado.erros.append(
                        f"{origem}: duplicidade de {nome}; anterior: {anteriores[valor]}."
                    )
                else:
                    anteriores[valor] = origem
            resultado.itens.append(ItemCatalogo(arquivo, lote.lote, posicao, conteudo))
    return resultado
