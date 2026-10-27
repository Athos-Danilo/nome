"""Executar em Backend: python -m comandos.catalogo --help."""

import argparse
import asyncio
import json
from pathlib import Path

from pymongo.errors import PyMongoError

from aplicacao.bancos.mongo import abrir_catalogo
from aplicacao.modulos.catalogo.repositorio import ErroCatalogo
from aplicacao.modulos.catalogo.validacao import validar_arquivos
from aplicacao.nucleo.configuracoes import Configuracoes


def criar_argumentos() -> argparse.ArgumentParser:
    argumentos = argparse.ArgumentParser(description="Validar e importar o catálogo do Decifra.")
    argumentos.add_argument("operacao", choices=["validar", "conferir", "importar", "quantidades"])
    argumentos.add_argument(
        "arquivos",
        nargs="*",
        type=Path,
        help="Arquivos JSON ou pastas de lotes, sem busca recursiva.",
    )
    return argumentos


async def executar(operacao: str, caminhos: list[Path]) -> int:
    arquivos: list[Path] = []
    for caminho in caminhos:
        arquivos.extend(sorted(caminho.glob("*.json")) if caminho.is_dir() else [caminho])
    if operacao == "quantidades" and caminhos:
        print("A operação quantidades não recebe arquivos.")
        return 2
    validacao = None if operacao == "quantidades" else validar_arquivos(arquivos)
    if validacao is not None:
        if validacao.erros:
            for erro in validacao.erros:
                print(erro)
            print("Validação reprovada. Nenhuma gravação realizada.")
            return 2
        print(
            f"Validação aprovada: {len(validacao.itens)} respostas e "
            f"{len(validacao.itens) * 5} dicas."
        )
        if operacao == "validar":
            print("Conferência apenas dos arquivos, sem acessar o MongoDB.")
            return 0
    try:
        async with abrir_catalogo(Configuracoes()) as catalogo:
            if operacao == "quantidades":
                print(json.dumps(await catalogo.quantidades(), ensure_ascii=False, indent=2))
                return 0
            assert validacao is not None
            plano = await catalogo.planejar(validacao.itens)
            if plano.erros:
                for erro in plano.erros:
                    print(erro)
                print("Conflitos encontrados. Nenhuma gravação realizada.")
                return 2
            print(
                f"Novos: {len(plano.novos)}; recuperáveis: {len(plano.recuperaveis)}; "
                f"já existentes e idênticos: {len(plano.repetidos)}."
            )
            if operacao == "conferir":
                print("Conferência com o banco concluída, sem gravar documentos ou índices.")
                return 0
            publicados = await catalogo.importar(plano)
            print(f"Carga concluída: {publicados} respostas publicadas, sem sobrescritas.")
            return 0
    except ErroCatalogo as falha:
        print(f"Carga recusada: {falha}")
    except (PyMongoError, ValueError):
        print(
            "Não foi possível concluir a operação. Confira conexão, permissões e índices. "
            "Após corrigir, execute conferir e repita importar; registros válidos são preservados."
        )
    return 3


def principal() -> int:
    argumentos = criar_argumentos().parse_args()
    return asyncio.run(executar(argumentos.operacao, argumentos.arquivos))


if __name__ == "__main__":
    raise SystemExit(principal())
