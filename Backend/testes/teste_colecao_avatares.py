"""Recursos ilustrados públicos preservam a identidade da coleção."""

from aplicacao.modulos.jogadores.colecao import AVATARES, listar_avatares


def teste_colecao_aponta_para_ilustracoes_do_frontend_sem_mudar_identificadores():
    colecao = listar_avatares()
    assert len(colecao) == 20
    assert [(avatar["id"], avatar["nome"]) for avatar in colecao] == list(AVATARES)
    for avatar in colecao:
        assert avatar["recurso"] == f"/avatares/{avatar['id']}.webp"
