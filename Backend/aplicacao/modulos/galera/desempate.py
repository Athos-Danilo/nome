"""Consentimento dos líderes e abertura de uma única sessão extra."""

import random
from dataclasses import replace

from aplicacao.bancos.conteudo import TEMATICAS, DocumentoPalavra, chave_da_resposta
from aplicacao.modulos.galera.motor import (
    AbrirExtra,
    ErroGalera,
    EstadoGalera,
    Sorteador,
    VotoExtra,
    conferir_ordem,
    conferir_reenvio,
    sortear_ordem,
)
from aplicacao.modulos.galera.selecao import combinar


def conferir_desempate(estado: EstadoGalera) -> None:
    if estado.estado != "aguardando_desempate" or estado.extra:
        raise ErroGalera("DESEMPATE_INDISPONIVEL", "Essa partida não aceita uma sessão extra.")


def selecionar_extra(
    estado: EstadoGalera,
    palavras: list[DocumentoPalavra],
    vistas: set[str],
    sorteio: random.Random,
    tematica: str | None = None,
) -> tuple[str, list[DocumentoPalavra]] | None:
    """Ausência de oferta preserva o empate e permite mudar apenas a temática."""
    conferir_desempate(estado)
    if tematica is not None and tematica not in TEMATICAS:
        raise ErroGalera("TEMATICA_INVALIDA", "Escolha uma temática válida.")
    usadas = {chave_da_resposta(r) for p in estado.paineis for r in p.respostas}
    elegiveis = [
        p
        for p in palavras
        if p.dificuldade == estado.dificuldade and chave_da_resposta(p.resposta) not in usadas
    ]
    temas = [tematica] if tematica else sorted(TEMATICAS)
    sorteio.shuffle(temas)
    for tema in temas:
        novas = combinar(
            [tema],
            len(estado.lideres),
            [p for p in elegiveis if p.id not in vistas],
            set(),
            sorteio,
        )
        oferta = novas or combinar([tema], len(estado.lideres), elegiveis, vistas, sorteio)
        if oferta:
            return tema, oferta
    return None


def votar(estado: EstadoGalera, voto: VotoExtra) -> EstadoGalera:
    if not conferir_reenvio(estado, voto):
        return estado
    conferir_desempate(estado)
    if voto.participante not in estado.lideres:
        raise ErroGalera("PARTICIPANTE_INVALIDO", "Somente os líderes podem decidir o desempate.")
    if type(voto.aceita) is not bool:
        raise ErroGalera("VOTO_INVALIDO", "Informe se aceita a sessão extra.")
    if voto.aceita and voto.participante in estado.concordantes:
        raise ErroGalera("VOTO_REGISTRADO", "Esse participante já concordou com a sessão extra.")
    return replace(
        estado,
        estado=estado.estado if voto.aceita else "concluida",
        concordantes=(*estado.concordantes, voto.participante)
        if voto.aceita
        else estado.concordantes,
        versao=estado.versao + 1,
        acoes=(*estado.acoes, voto),
    )


def abrir_extra(
    estado: EstadoGalera, acao: AbrirExtra, *, sortear: Sorteador = sortear_ordem
) -> EstadoGalera:
    """O painel vem do catálogo no servidor, nunca das respostas enviadas pelo cliente."""
    if not conferir_reenvio(estado, acao):
        return estado
    conferir_desempate(estado)
    if set(estado.concordantes) != set(estado.lideres):
        raise ErroGalera("CONSENSO_PENDENTE", "Todos os líderes precisam concordar.")
    painel = acao.painel
    if len(painel.respostas) != len(estado.lideres):
        raise ErroGalera("CONTEUDO_INSUFICIENTE", "Escolha outra temática ou encerre empatado.")
    usadas = {chave_da_resposta(r) for p in estado.paineis for r in p.respostas}
    novas = {chave_da_resposta(r) for r in painel.respostas}
    if len(novas) != len(painel.respostas) or usadas & novas:
        raise ErroGalera(
            "CONTEUDO_REPETIDO", "A sessão extra precisa de respostas novas na partida."
        )
    # Reutiliza apenas a validação estrutural, sem iniciar ou zerar a partida original.
    from aplicacao.modulos.galera.motor import iniciar

    ordem = sortear(estado.lideres)
    conferir_ordem(ordem, estado.lideres)
    iniciar(estado.lideres, (painel,), ordem=ordem)
    return replace(
        estado,
        paineis=(*estado.paineis, painel),
        sessao=len(estado.paineis),
        ordem=ordem,
        vez=0,
        extra=True,
        estado="em_andamento",
        lideres=(),
        tentadas=frozenset(),
        reveladas=tuple(frozenset() for _ in painel.respostas),
        versao=estado.versao + 1,
        acoes=(*estado.acoes, acao),
    )
