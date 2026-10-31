"""Integração com MongoDB real, sempre em bases únicas e descartáveis de teste."""

import asyncio
import json
import os
from collections.abc import Awaitable, Callable
from contextlib import asynccontextmanager
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


def teste_correcao_cria_revisao_sem_alterar_historico_e_reexecucao_e_idempotente(rodar_mongo):
    async def verificar(catalogo):
        from aplicacao.modulos.catalogo.revisoes import PublicadorRevisoes

        original = item()
        corrigido = item(dicas=[f"Pista corrigida {n}." for n in range(5)])
        await catalogo.importar(await catalogo.planejar([original]))
        historica = await catalogo.buscar_revisao("japao", 1)
        publicador = PublicadorRevisoes(catalogo)
        plano = await publicador.planejar([original], [corrigido], 1)
        assert not plano.erros and len(plano.alteradas) == 1
        assert (await catalogo.quantidades())["total_versoes"] == 1
        assert await publicador.publicar(plano) == 1
        assert await catalogo.buscar_revisao("japao", 1) == historica
        nova = await catalogo.buscar_revisao("japao", 2)
        assert nova.dicas == corrigido.conteudo.dicas
        assert nova.lote_origem == historica.lote_origem
        plano = await publicador.planejar([original], [corrigido], 1)
        assert not plano.erros and len(plano.identicas) == 1
        assert await publicador.publicar(plano) == 0
        assert (await catalogo.quantidades())["total_versoes"] == 2
        assert (await catalogo.planejar([corrigido])).repetidos
        assert (await catalogo.planejar([original])).erros

    rodar_mongo(verificar)


def teste_correcao_recusa_lote_inteiro_se_identidade_mudar_ou_base_divergir(rodar_mongo):
    async def verificar(catalogo):
        from aplicacao.modulos.catalogo.revisoes import PublicadorRevisoes

        originais = [item(), item("brasil", "BRASIL")]
        await catalogo.importar(await catalogo.planejar(originais))
        publicador = PublicadorRevisoes(catalogo)
        for propostas in [
            [item(dicas=[f"Nova {n}" for n in range(5)]), item("brasil", "OUTRA")],
            [item()],
            [item(), item("brasil", "BRASIL", dificuldade="dificil")],
        ]:
            plano = await publicador.planejar(originais, propostas, 1)
            assert plano.erros
            with pytest.raises(ErroCatalogo):
                await publicador.publicar(plano)
        base_errada = [item(dicas=[f"Base errada {n}" for n in range(5)]), originais[1]]
        plano = await publicador.planejar(base_errada, originais, 1)
        assert plano.erros
        assert (await catalogo.quantidades())["total_versoes"] == 2
        assert (await catalogo.buscar_revisao("japao", 1)).dicas == item().conteudo.dicas

    rodar_mongo(verificar)


def teste_correcao_interrompida_recupera_reserva_sem_mudar_data(rodar_mongo, monkeypatch):
    async def verificar(catalogo):
        from aplicacao.modulos.catalogo.revisoes import PublicadorRevisoes

        original = item()
        corrigido = item(dicas=[f"Nova {n}" for n in range(5)])
        await catalogo.importar(await catalogo.planejar([original]))
        publicador = PublicadorRevisoes(catalogo)
        publicar_original = publicador.publicar_atual

        async def interromper(*args):
            raise ConnectionFailure("Interrupção simulada após reservar revisão 2.")

        monkeypatch.setattr(publicador, "publicar_atual", interromper)
        with pytest.raises(ConnectionFailure):
            await publicador.publicar(await publicador.planejar([original], [corrigido], 1))
        reservada = await catalogo.buscar_revisao("japao", 2)
        assert reservada is not None
        assert (await catalogo.palavras.find_one({"id": "japao"}))["revisao"] == 1
        monkeypatch.setattr(publicador, "publicar_atual", publicar_original)
        assert await publicador.publicar(await publicador.planejar([original], [corrigido], 1)) == 1
        assert await catalogo.buscar_revisao("japao", 2) == reservada
        assert (await catalogo.quantidades())["total_versoes"] == 2

    rodar_mongo(verificar)


def teste_correcoes_concorrentes_identicas_nao_duplicam_e_divergentes_nao_sobrescrevem(rodar_mongo):
    async def verificar(catalogo):
        from aplicacao.modulos.catalogo.revisoes import PublicadorRevisoes

        original = item()
        corrigido = item(dicas=[f"Nova {n}" for n in range(5)])
        await catalogo.importar(await catalogo.planejar([original]))
        publicador = PublicadorRevisoes(catalogo)
        planos = [await publicador.planejar([original], [corrigido], 1) for _ in range(2)]
        assert sum(await asyncio.gather(*(publicador.publicar(p) for p in planos))) == 1
        diferente = item(dicas=[f"Conflitante {n}" for n in range(5)])
        plano = await publicador.planejar([original], [diferente], 1)
        assert plano.erros
        assert (await catalogo.buscar_revisao("japao", 2)).dicas == corrigido.conteudo.dicas
        assert (await catalogo.quantidades())["total_versoes"] == 2

    rodar_mongo(verificar)


def teste_plano_antigo_nao_substitui_catalogo_que_mudou(rodar_mongo):
    async def verificar(catalogo):
        from aplicacao.modulos.catalogo.revisoes import PublicadorRevisoes

        original = item()
        corrigido = item(dicas=[f"Nova {n}" for n in range(5)])
        await catalogo.importar(await catalogo.planejar([original]))
        publicador = PublicadorRevisoes(catalogo)
        plano = await publicador.planejar([original], [corrigido], 1)
        await catalogo.palavras.update_one({"id": "japao"}, {"$set": {"revisao": 99}})
        with pytest.raises(ErroCatalogo):
            await publicador.publicar(plano)
        assert (await catalogo.palavras.find_one({"id": "japao"}))["revisao"] == 99

    rodar_mongo(verificar)


def teste_comando_conferir_e_publicar_revisoes_no_banco_isolado(rodar_mongo, tmp_path, monkeypatch):
    from comandos.revisar_catalogo import executar as revisar

    original = item()
    corrigido = item(dicas=[f"Correção pela interface de comando {n}." for n in range(5)])
    arquivos = []
    for pasta, conteudo in [("base", original), ("proposta", corrigido)]:
        diretorio = tmp_path / pasta
        diretorio.mkdir()
        caminho = diretorio / "teste-001.json"
        caminho.write_text(
            json.dumps(
                {
                    "versao_formato": 1,
                    "lote": "teste-001",
                    "palavras": [conteudo.conteudo.model_dump()],
                }
            ),
            encoding="utf-8",
        )
        arquivos.append(caminho)

    async def verificar(catalogo):
        @asynccontextmanager
        async def usar_banco_isolado(configuracoes):
            yield catalogo

        monkeypatch.setattr("comandos.revisar_catalogo.abrir_catalogo", usar_banco_isolado)
        await catalogo.importar(await catalogo.planejar([original]))
        assert await revisar(*arquivos, 1, False) == 0
        assert (await catalogo.quantidades())["total_versoes"] == 1
        assert await revisar(*arquivos, 1, True) == 0
        assert await revisar(*arquivos, 1, True) == 0
        assert (await catalogo.quantidades())["total_versoes"] == 2
        assert (await catalogo.buscar_revisao("japao", 1)).dicas == original.conteudo.dicas

    rodar_mongo(verificar)
