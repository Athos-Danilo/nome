"""Leitura do catálogo publicado e de revisões imutáveis; sem escrita."""

from pymongo.errors import PyMongoError

from aplicacao.bancos.conteudo import DocumentoPalavra
from aplicacao.bancos.mongo import abrir_catalogo
from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao
from aplicacao.modulos.catalogo.repositorio import ErroCatalogo, ler_documento
from aplicacao.nucleo.configuracoes import Configuracoes


class CatalogoIndividualMongo:
    def __init__(self, configuracoes: Configuracoes):
        self.configuracoes = configuracoes

    async def listar(self) -> list[DocumentoPalavra]:
        try:
            async with abrir_catalogo(self.configuracoes) as catalogo:
                return [ler_documento(dados) async for dados in catalogo.palavras.find({})]
        except (PyMongoError, ErroCatalogo) as falha:
            raise FalhaAutenticacao(
                "CATALOGO_INDISPONIVEL", "As palavras estão indisponíveis. Tente novamente.", 503
            ) from falha

    async def buscar(self, identificador: str, revisao: int) -> DocumentoPalavra:
        try:
            async with abrir_catalogo(self.configuracoes) as catalogo:
                documento = await catalogo.buscar_revisao(identificador, revisao)
                if documento is not None:
                    return documento
        except (PyMongoError, ErroCatalogo) as falha:
            raise FalhaAutenticacao(
                "CATALOGO_INDISPONIVEL", "Não foi possível recuperar a palavra.", 503
            ) from falha
        raise FalhaAutenticacao(
            "CATALOGO_INDISPONIVEL", "Não foi possível recuperar a palavra.", 503
        )
