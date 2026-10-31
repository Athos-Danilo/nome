"""Conferir/publicar correções aprovadas, informando a base e o conteúdo proposto."""

import argparse
import asyncio
from pathlib import Path

from pymongo.errors import PyMongoError

from aplicacao.bancos.mongo import abrir_catalogo
from aplicacao.modulos.catalogo.repositorio import ErroCatalogo
from aplicacao.modulos.catalogo.revisoes import PublicadorRevisoes
from aplicacao.modulos.catalogo.validacao import validar_arquivos
from aplicacao.nucleo.configuracoes import Configuracoes


async def executar(base: Path, proposta: Path, revisao_base: int, publicar: bool) -> int:
    anterior = validar_arquivos([base])
    posterior = validar_arquivos([proposta])
    erros = anterior.erros + posterior.erros
    if revisao_base < 1:
        erros.append("A revisão base deve ser positiva.")
    if erros:
        for erro in erros:
            print(erro)
        print("Nenhuma gravação realizada; corrija os arquivos e a revisão base.")
        return 2
    try:
        async with abrir_catalogo(Configuracoes()) as catalogo:
            publicador = PublicadorRevisoes(catalogo)
            plano = await publicador.planejar(anterior.itens, posterior.itens, revisao_base)
            if plano.erros:
                for erro in plano.erros:
                    print(erro)
                print("Nenhuma gravação realizada; o plano contém conflitos.")
                return 2
            print(f"Correções: {len(plano.alteradas)}; já conferidas: {len(plano.identicas)}.")
            for alteracao in plano.alteradas:
                print(f"{alteracao.base.id}: revisão {revisao_base} → {revisao_base + 1}.")
            if not publicar:
                print("Conferência concluída sem gravar documentos ou índices.")
                return 0
            quantidade = await publicador.publicar(plano)
            print(f"Publicação concluída: {quantidade} revisões; histórico preservado.")
            return 0
    except ErroCatalogo as falha:
        print(f"Revisão recusada: {falha}")
    except (PyMongoError, ValueError):
        print(
            "Falha na revisão. Confira conexão e permissões; repita a conferência para recuperar."
        )
    return 3


def principal() -> int:
    argumentos = argparse.ArgumentParser(description="Revisar somente dicas do catálogo aprovado.")
    argumentos.add_argument("base", type=Path, help="Lote com o conteúdo da revisão base.")
    argumentos.add_argument("proposta", type=Path, help="Lote com as correções aprovadas.")
    argumentos.add_argument("--revisao-base", required=True, type=int)
    argumentos.add_argument(
        "--publicar",
        action="store_true",
        help="Gravar explicitamente as revisões; padrão só confere.",
    )
    opcoes = argumentos.parse_args()
    return asyncio.run(executar(opcoes.base, opcoes.proposta, opcoes.revisao_base, opcoes.publicar))


if __name__ == "__main__":
    raise SystemExit(principal())
