import asyncio
import json
from pathlib import Path

import pytest

from aplicacao.modulos.catalogo.validacao import validar_arquivos
from comandos.catalogo import executar


def teste_comando_revisao_exige_validacao_dos_dois_arquivos_antes_de_abrir_banco(
    tmp_path, capsys, monkeypatch
):
    from comandos.revisar_catalogo import executar as executar_revisao

    def proibir_conexao(*argumentos):
        pytest.fail("Arquivos inválidos não devem abrir conexão.")

    monkeypatch.setattr("comandos.revisar_catalogo.abrir_catalogo", proibir_conexao)
    valido = gravar_lote(tmp_path, [palavra()])
    ausente = tmp_path / "ausente.json"
    assert asyncio.run(executar_revisao(valido, ausente, 1, False)) == 2
    assert "Nenhuma gravação" in capsys.readouterr().out


def palavra(identificador="japao", resposta="JAPÃO") -> dict:
    return {
        "id": identificador,
        "resposta": resposta,
        "tematicas": ["paises"],
        "dificuldade": "facil",
        "dicas": [f"Pista número {n}." for n in range(1, 6)],
    }


def gravar_lote(pasta: Path, itens: list[dict], nome="teste-001", **campos) -> Path:
    arquivo = pasta / f"{nome}.json"
    arquivo.write_text(
        json.dumps(
            {"versao_formato": 1, "lote": nome, "palavras": itens} | campos, ensure_ascii=False
        ),
        encoding="utf-8",
    )
    return arquivo


@pytest.mark.parametrize(
    "campo,valor",
    [
        ("resposta", "Japão"),
        ("resposta", " JAPÃO"),
        ("resposta", "JAPA\u0303O"),
        ("dicas", ["Falta o restante"]),
        ("dicas", ["Repetida"] * 5),
        ("tematicas", ["inventada"]),
        ("dificuldade", "media"),
        ("id", "Japão"),
        ("dicas", [" Dica com espaço"] + [f"Outra {n}" for n in range(4)]),
    ],
)
def teste_erro_de_item_tem_arquivo_e_posicao(tmp_path: Path, campo: str, valor: object) -> None:
    arquivo = gravar_lote(tmp_path, [palavra() | {campo: valor}])
    resultado = validar_arquivos([arquivo])
    assert resultado.erros
    assert all(str(arquivo) in erro and "palavras.1" in erro for erro in resultado.erros)


@pytest.mark.parametrize("versao", [2, "1", True, 1.0])
def teste_rejeita_versao_incorreta(tmp_path: Path, versao: object) -> None:
    arquivo = gravar_lote(tmp_path, [palavra()], versao_formato=versao)
    assert validar_arquivos([arquivo]).erros


def teste_erros_de_campos_ausentes_e_desconhecidos(tmp_path: Path) -> None:
    item = palavra()
    del item["dicas"]
    arquivo = gravar_lote(tmp_path, [item | {"surpresa": "não permitido"}])
    erros = validar_arquivos([arquivo]).erros
    assert any("Campo obrigatório ausente" in erro for erro in erros)
    assert any("Campo não previsto" in erro for erro in erros)


def teste_duplicatas_entre_arquivos_ignoram_acentos(tmp_path: Path) -> None:
    primeiro = gravar_lote(tmp_path, [palavra()])
    segundo = gravar_lote(tmp_path, [palavra("outro-japao", "JAPAO")], "teste-002")
    assert any(
        "duplicidade de resposta normalizada" in erro
        for erro in validar_arquivos([primeiro, segundo]).erros
    )


def teste_duplicatas_internas_e_nome_do_lote(tmp_path: Path) -> None:
    arquivo = gravar_lote(tmp_path, [palavra(), palavra()], lote="nome-diferente")
    erros = validar_arquivos([arquivo]).erros
    assert any("duplicidade de identificador" in erro for erro in erros)
    assert any("nome do arquivo" in erro for erro in erros)


@pytest.mark.parametrize("texto", ['{"lote":"a","lote":"b"}', '{"incompleto":'])
def teste_rejeita_json_invalido_ou_com_chaves_repetidas(tmp_path: Path, texto: str) -> None:
    arquivo = tmp_path / "teste-001.json"
    arquivo.write_text(texto, encoding="utf-8")
    assert validar_arquivos([arquivo]).erros


def teste_expressao_com_acentos_preservada_e_validacao_offline(tmp_path: Path, capsys) -> None:
    arquivo = gravar_lote(tmp_path, [palavra("africa-do-sul", "ÁFRICA DO SUL")])
    resultado = validar_arquivos([arquivo])
    assert not resultado.erros
    assert resultado.itens[0].conteudo.resposta == "ÁFRICA DO SUL"
    assert asyncio.run(executar("validar", [arquivo])) == 0
    assert "sem acessar o MongoDB" in capsys.readouterr().out


def teste_importacao_invalida_nao_abre_conexao(tmp_path: Path, monkeypatch) -> None:
    def proibir_conexao(*argumentos):
        pytest.fail("Validação inválida não deve abrir conexão.")

    monkeypatch.setattr("comandos.catalogo.abrir_catalogo", proibir_conexao)
    arquivo = gravar_lote(tmp_path, [palavra(), palavra() | {"dicas": []}])
    assert asyncio.run(executar("importar", [arquivo])) == 2


def teste_todos_lotes_reais_respeitam_contrato_completo() -> None:
    pasta = Path(__file__).resolve().parents[2] / "Data/palavras"
    resultado = validar_arquivos(sorted(pasta.glob("*.json")))
    assert resultado.itens
    assert resultado.erros == []
