"""Leitura do catálogo usado pelo motor contra MongoDB isolado."""

import os

from aplicacao.modulos.individual.catalogo import CatalogoIndividualMongo
from aplicacao.nucleo.configuracoes import Configuracoes
from testes.teste_catalogo_mongo import item, rodar_mongo  # noqa: F401


def teste_catalogo_individual_recupera_revisao_e_nao_escreve(rodar_mongo):  # noqa: F811
    async def verificar(catalogo):
        await catalogo.importar(await catalogo.planejar([item()]))
        consulta = CatalogoIndividualMongo(
            Configuracoes(
                _env_file=None,
                ambiente="teste",
                mongodb_url=os.environ["DECIFRA_MONGODB_TESTE_URL"],
                mongodb_banco=catalogo.banco.name,
            )
        )
        palavras = await consulta.listar()
        assert len(palavras) == 1 and palavras[0].resposta == "JAPÃO"
        assert (await consulta.buscar("japao", 1)).dicas == palavras[0].dicas
        assert (await catalogo.quantidades())["total_versoes"] == 1

    rodar_mongo(verificar)
