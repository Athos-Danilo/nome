"""Normalização exclusiva de nomes; nunca usar para validar palpites do jogo."""

import unicodedata


def validar_nome(nome: str) -> str:
    normalizado = unicodedata.normalize("NFC", nome)
    if not 3 <= len(normalizado) <= 20 or not all(
        caractere.isalpha() or caractere.isdecimal() or caractere == "_"
        for caractere in normalizado
    ):
        raise ValueError("Use de 3 a 20 letras, números ou sublinhado, sem espaços.")
    return normalizado


def chave_do_nome(nome: str) -> str:
    decomposto = unicodedata.normalize("NFD", validar_nome(nome).casefold())
    return "".join(caractere for caractere in decomposto if not unicodedata.combining(caractere))
