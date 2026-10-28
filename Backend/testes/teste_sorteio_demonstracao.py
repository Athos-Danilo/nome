"""Integração do sorteio com catálogo publicado e revisões reais descartáveis."""

import os

from aplicacao.modulos.demonstracoes.catalogo import SorteioMongo
from aplicacao.nucleo.configuracoes import Configuracoes
from testes.teste_catalogo_mongo import item, rodar_mongo  # noqa: F401


def teste_sorteia_tres_faceis_distintas_sem_expor_solucoes(rodar_mongo):  # noqa: F811
    async def verificar(catalogo):
        entradas = [item(f"facil-{i}", f"RESPOSTA {i}") for i in range(5)]
        entradas.append(item("dificil", "COMPLEXA", dificuldade="dificil"))
        await catalogo.importar(await catalogo.planejar(entradas))
        sorteio = SorteioMongo(
            Configuracoes(
                _env_file=None,
                ambiente="teste",
                mongodb_url=os.environ["DECIFRA_MONGODB_TESTE_URL"],
                mongodb_banco=catalogo.banco.name,
            )
        )
        reservas = await sorteio.sortear()
        assert len(reservas) == 3 and len({r["id"] for r in reservas}) == 3
        assert all(r["dificuldade"] == "facil" and r["revisao"] == 1 for r in reservas)
        assert all(set(r) == {"id", "revisao", "dificuldade", "tematica"} for r in reservas)
        assert (await catalogo.quantidades())["total_respostas"] == 6

    rodar_mongo(verificar)
