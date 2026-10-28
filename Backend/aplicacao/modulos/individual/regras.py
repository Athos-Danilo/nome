"""Regras puras de conferência de palpites e faixas de pontuação."""

import unicodedata
from dataclasses import dataclass

from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao


def pontos_da_dica(dica: int) -> int:
    return (100, 80, 60, 40, 20)[dica - 1]


def conferir_palpite(palpite: str, resposta: str) -> tuple[str, bool]:
    texto = unicodedata.normalize("NFC", palpite).upper()
    if len(texto) != len(resposta) or any(
        (oficial == " " and letra != " ") or (oficial != " " and not letra.isalpha())
        for letra, oficial in zip(texto, resposta, strict=True)
    ):
        raise FalhaAutenticacao(
            "PALPITE_INCOMPLETO", "Preencha todos os quadradinhos de letras antes de enviar.", 422
        )
    return texto, texto == resposta


@dataclass(frozen=True)
class DecisaoJogada:
    resultado: str
    pontos: int = 0
    encerra_rodada: bool = False
    dica_destino: int | None = None
    palpite: str | None = None
    resposta_revelada: str | None = None
    limpar_montagem: bool = False


def avaliar_jogada(tipo: str, dica: int, resposta: str, palpite: str | None) -> DecisaoJogada:
    if tipo == "dicas":
        if dica == 5:
            raise FalhaAutenticacao("ULTIMA_DICA", "Você já está na quinta dica.", 409)
        return DecisaoJogada("dica_revelada", dica_destino=dica + 1)
    if tipo == "palpites" and palpite is not None:
        texto, acertou = conferir_palpite(palpite, resposta)
        if acertou:
            return DecisaoJogada(
                "acerto", pontos_da_dica(dica), True, palpite=texto, resposta_revelada=resposta
            )
        return DecisaoJogada(
            "erro", dica_destino=min(5, dica + 1), palpite=texto, limpar_montagem=True
        )
    if tipo == "desistencia-palavra":
        return DecisaoJogada("desistencia", encerra_rodada=True, resposta_revelada=resposta)
    raise FalhaAutenticacao("ACAO_INVALIDA", "Ação inválida.", 422)
