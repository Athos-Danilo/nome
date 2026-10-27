"""Integração com MongoDB real, sempre em bases únicas e descartáveis de teste."""

import asyncio
import os
from collections.abc import Awaitable, Callable
from pathlib import Path
from urllib.parse import urlsplit
from uuid import uuid4

import pytest
from pymongo import AsyncMongoClient
from pymongo.errors import ConnectionFailure

from aplicacao.bancos.conteudo import ConteudoPalavra
from aplicacao.modulos.catalogo.repositorio import ErroCatalogo, RepositorioCatalogo
from aplicacao.modulos.catalogo.validacao import ItemCatalogo

type Cenario = Callable[[RepositorioCatalogo], Awaitable[None]]


@pytest.fixture
def rodar_mongo() -> Callable[[Cenario], None]:
    endereco = os.environ.get("DECIFRA_MONGODB_TESTE_URL")
    if not endereco:
        pytest.skip("Defina DECIFRA_MONGODB_TESTE_URL para testar o catálogo no MongoDB.")
    url = urlsplit(endereco)
    if url.scheme != "mongodb" or url.hostname not in {"localhost", "127.0.0.1"}:
        pytest.fail("Os testes exigem uma conexão MongoDB local explícita.")

    def rodar(cenario: Cenario) -> None:
        async def executar() -> None:
            nome = f"decifra_catalogo_{uuid4().hex}_teste"
            async with AsyncMongoClient(
                endereco, tz_aware=True, serverSelectionTimeoutMS=5000
            ) as cliente:
                assert nome not in await cliente.list_database_names()
                try:
                    await cenario(RepositorioCatalogo(cliente[nome]))
                finally:
                    assert nome.startswith("decifra_catalogo_") and nome.endswith("_teste")
                    await cliente.drop_database(nome)

        asyncio.run(executar())

    return rodar


def item(identificador="japao", resposta="JAPÃO", **alteracoes) -> ItemCatalogo:
    campos = {
        "id": identificador,
        "resposta": resposta,
        "tematicas": ["paises"],
        "dificuldade": "facil",
        "dicas": [f"Pista número {n}." for n in range(1, 6)],
    }
    return ItemCatalogo(
        Path("teste-001.json"), "teste-001", 1, ConteudoPalavra.model_validate(campos | alteracoes)
    )


def teste_conferencia_nao_cria_documentos_nem_indices(rodar_mongo) -> None:
    async def verificar(catalogo: RepositorioCatalogo) -> None:
        plano = await catalogo.planejar([item()])
        assert len(plano.novos) == 1 and not plano.erros
        assert await catalogo.banco.list_collection_names() == []

    rodar_mongo(verificar)


def teste_reimportacao_preserva_acentos_expressao_e_revisao(rodar_mongo) -> None:
    async def verificar(catalogo: RepositorioCatalogo) -> None:
        entrada = item("africa-do-sul", "ÁFRICA DO SUL")
        assert await catalogo.importar(await catalogo.planejar([entrada])) == 1
        anterior = await catalogo.buscar_revisao(entrada.conteudo.id, 1)
        plano = await catalogo.planejar([entrada])
        assert len(plano.repetidos) == 1 and not plano.erros
        assert await catalogo.importar(plano) == 0
        assert await catalogo.buscar_revisao(entrada.conteudo.id, 1) == anterior
        assert anterior.resposta == "ÁFRICA DO SUL"
        assert (await catalogo.quantidades())["total_respostas"] == 1
        assert (await catalogo.quantidades())["total_versoes"] == 1

    rodar_mongo(verificar)


def teste_conflito_no_banco_recusa_toda_a_carga_planejada(rodar_mongo) -> None:
    async def verificar(catalogo: RepositorioCatalogo) -> None:
        await catalogo.importar(await catalogo.planejar([item()]))
        alterado = item(dicas=[f"Dica diferente {n}." for n in range(5)])
        plano = await catalogo.planejar([item("brasil", "BRASIL"), alterado])
        assert plano.erros
        with pytest.raises(ErroCatalogo):
            await catalogo.importar(plano)
        assert await catalogo.palavras.count_documents({}) == 1
        assert (await catalogo.buscar_revisao("japao", 1)).dicas == item().conteudo.dicas

    rodar_mongo(verificar)


def teste_resposta_com_outro_id_e_sem_acento_e_conflito(rodar_mongo) -> None:
    async def verificar(catalogo: RepositorioCatalogo) -> None:
        await catalogo.importar(await catalogo.planejar([item()]))
        plano = await catalogo.planejar([item("outro-japao", "JAPAO")])
        assert plano.erros and "resposta já reservada" in plano.erros[0]

    rodar_mongo(verificar)


def teste_carga_interrompida_recupera_sem_duplicar(rodar_mongo, monkeypatch) -> None:
    async def verificar(catalogo: RepositorioCatalogo) -> None:
        entradas = [item(), item("brasil", "BRASIL"), item("peru", "PERU")]
        publicar_original = catalogo.publicar
        chamadas = 0

        async def interromper(documento):
            nonlocal chamadas
            chamadas += 1
            if chamadas == 2:
                raise ConnectionFailure("Interrupção simulada entre revisão e publicação.")
            return await publicar_original(documento)

        monkeypatch.setattr(catalogo, "publicar", interromper)
        with pytest.raises(ConnectionFailure):
            await catalogo.importar(await catalogo.planejar(entradas))
        assert await catalogo.palavras.count_documents({}) == 1
        assert await catalogo.versoes.count_documents({}) == 2
        reservada = await catalogo.buscar_revisao("brasil", 1)
        monkeypatch.setattr(catalogo, "publicar", publicar_original)
        plano = await catalogo.planejar(entradas)
        assert [len(plano.novos), len(plano.recuperaveis), len(plano.repetidos)] == [1, 1, 1]
        assert await catalogo.importar(plano) == 2
        assert await catalogo.buscar_revisao("brasil", 1) == reservada
        assert await catalogo.palavras.count_documents({}) == 3
        assert await catalogo.versoes.count_documents({}) == 3

    rodar_mongo(verificar)


def teste_reserva_interrompida_tambem_impede_resposta_duplicada(rodar_mongo) -> None:
    async def verificar(catalogo: RepositorioCatalogo) -> None:
        await catalogo.criar_indices()
        await catalogo.registrar_versao(item())
        plano = await catalogo.planejar([item("outro-id", "JAPAO")])
        assert plano.erros
        assert await catalogo.palavras.count_documents({}) == 0

    rodar_mongo(verificar)


def teste_duas_importacoes_simultaneas_nao_duplicam(rodar_mongo) -> None:
    async def verificar(catalogo: RepositorioCatalogo) -> None:
        planos = [await catalogo.planejar([item()]), await catalogo.planejar([item()])]
        resultados = await asyncio.gather(*(catalogo.importar(plano) for plano in planos))
        assert sum(resultados) == 1
        assert await catalogo.palavras.count_documents({}) == 1
        assert await catalogo.versoes.count_documents({}) == 1

    rodar_mongo(verificar)


def teste_multitematica_conta_uma_resposta_e_duas_associacoes(rodar_mongo) -> None:
    async def verificar(catalogo: RepositorioCatalogo) -> None:
        entrada = item("teste-composto", "TESTE COMPOSTO", tematicas=["objetos", "marcas"])
        await catalogo.importar(await catalogo.planejar([entrada]))
        relatorio = await catalogo.quantidades()
        assert relatorio["total_respostas"] == 1
        assert relatorio["por_tematica"]["objetos"]["facil"] == 1
        assert relatorio["por_tematica"]["marcas"]["facil"] == 1
        assert len(await catalogo.listar("objetos", "facil")) == 1
        assert await catalogo.listar("objetos", "medio") == []
        assert await catalogo.buscar_revisao("ausente", 1) is None

    rodar_mongo(verificar)


def teste_revisao_divergente_recusa_banco_inconsistente(rodar_mongo) -> None:
    async def verificar(catalogo: RepositorioCatalogo) -> None:
        await catalogo.importar(await catalogo.planejar([item()]))
        await catalogo.palavras.update_one({"id": "japao"}, {"$set": {"lote_origem": "alterado"}})
        plano = await catalogo.planejar([item()])
        assert plano.erros and "revisão imutável" in plano.erros[0]

    rodar_mongo(verificar)
