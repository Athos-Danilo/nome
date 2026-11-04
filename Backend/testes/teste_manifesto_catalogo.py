"""Detecta divergência entre a entrega auditada e os lotes editados depois dela."""

import hashlib
import json
from collections import Counter
from pathlib import Path

from aplicacao.bancos.conteudo import TEMATICAS
from aplicacao.modulos.catalogo.validacao import validar_arquivos

RAIZ = Path(__file__).resolve().parents[2]
MANIFESTO = RAIZ / "Data/manifestos/catalogo-primeira-entrega.json"


def resumo_canonico(dados: object) -> str:
    texto = json.dumps(dados, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def teste_manifesto_corresponde_integralmente_aos_arquivos_aprovados():
    manifesto = json.loads(MANIFESTO.read_text(encoding="utf-8"))
    arquivos = sorted((RAIZ / "Data/palavras").glob("*.json"))
    validacao = validar_arquivos(arquivos)
    assert validacao.erros == []
    assert manifesto["versao_manifesto"] == 1
    assert len(arquivos) == len(manifesto["arquivos"]) == 20
    registros = {item["arquivo"]: item for item in manifesto["arquivos"]}
    assert set(registros) == {arquivo.relative_to(RAIZ).as_posix() for arquivo in arquivos}
    for arquivo in arquivos:
        dados = json.loads(arquivo.read_text(encoding="utf-8"))
        registro = registros[arquivo.relative_to(RAIZ).as_posix()]
        assert registro["sha256_json_canonico"] == resumo_canonico(dados)
        assert registro["quantidade_respostas"] == len(dados["palavras"]) == 25
    itens = {item["id"]: item for item in manifesto["respostas"]}
    assert len(itens) == len(manifesto["respostas"]) == len(validacao.itens) == 500
    conteudos = []
    for item in validacao.itens:
        conteudo = item.conteudo.model_dump()
        registro = itens[item.conteudo.id]
        assert registro["arquivo"] == item.arquivo.relative_to(RAIZ).as_posix()
        assert registro["posicao"] == item.posicao
        assert registro["resposta"] == item.conteudo.resposta
        assert registro["tematicas"] == item.conteudo.tematicas
        assert registro["dificuldade"] == item.conteudo.dificuldade
        assert registro["sha256_conteudo"] == resumo_canonico(conteudo)
        conteudos.append(conteudo)
    assert manifesto["sha256_catalogo"] == resumo_canonico(
        sorted(conteudos, key=lambda item: item["id"])
    )


def teste_manifesto_conta_tematica_principal_sem_inflar_total_por_associacoes():
    manifesto = json.loads(MANIFESTO.read_text(encoding="utf-8"))
    respostas = manifesto["respostas"]
    principais = Counter(item["tematica_principal"] for item in respostas)
    assert set(principais) == TEMATICAS
    assert all(quantidade == 100 for quantidade in principais.values())
    assert sum(principais.values()) == manifesto["total_respostas"] == 500
    assert manifesto["total_dicas"] == 2500
    assert Counter(item["dificuldade"] for item in respostas) == {
        "facil": 200,
        "medio": 175,
        "dificil": 125,
    }
    for item in respostas:
        principal = Path(item["arquivo"]).stem.rsplit("-", 1)[0]
        assert item["tematica_principal"] == principal
        assert principal in item["tematicas"]
    for tematica in TEMATICAS:
        assert Counter(
            item["dificuldade"] for item in respostas if item["tematica_principal"] == tematica
        ) == {
            "facil": 40,
            "medio": 35,
            "dificil": 25,
        }
