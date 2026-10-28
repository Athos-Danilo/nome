"""Sorteio somente de conteúdo fácil publicado e com revisão imutável."""

import secrets

from pymongo.errors import PyMongoError

from aplicacao.bancos.mongo import abrir_catalogo
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.nucleo.configuracoes import Configuracoes


class SorteioMongo:
    def __init__(self, configuracoes: Configuracoes):
        self.configuracoes = configuracoes

    async def sortear(self) -> list[dict]:
        try:
            async with abrir_catalogo(self.configuracoes) as catalogo:
                cursor = await catalogo.palavras.aggregate(
                    [
                        {"$match": {"dificuldade": "facil"}},
                        {"$sample": {"size": 3}},
                        {
                            "$project": {
                                "_id": 0,
                                "id": 1,
                                "revisao": 1,
                                "dificuldade": 1,
                                "tematicas": 1,
                            }
                        },
                    ]
                )
                itens = []
                async for item in cursor:
                    revisao = await catalogo.buscar_revisao(item["id"], item["revisao"])
                    if revisao is None or revisao.dificuldade != "facil":
                        raise FalhaAutenticacao(
                            "CATALOGO_INDISPONIVEL", "Não foi possível preparar as palavras.", 503
                        )
                    itens.append(
                        {
                            "id": revisao.id,
                            "revisao": revisao.revisao,
                            "dificuldade": revisao.dificuldade,
                            "tematica": secrets.choice(revisao.tematicas),
                        }
                    )
                return itens
        except PyMongoError as falha:
            raise FalhaAutenticacao(
                "CATALOGO_INDISPONIVEL", "As palavras estão indisponíveis. Tente novamente.", 503
            ) from falha
