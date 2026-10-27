import pytest

from aplicacao.nucleo.nomes import chave_do_nome, validar_nome


@pytest.mark.parametrize("nome", ["José", "JOSE", "Jose\u0301"])
def teste_unicidade_ignora_caixa_e_acentos(nome: str) -> None:
    assert chave_do_nome(nome) == "jose"


@pytest.mark.parametrize("nome", ["ab", "a" * 21, "Ana Maria", "athos!", " nome", "a\nb"])
def teste_rejeita_nome_fora_da_regra(nome: str) -> None:
    with pytest.raises(ValueError):
        validar_nome(nome)


def teste_preserva_nome_e_normaliza_unicode() -> None:
    assert validar_nome("Jose\u0301_42") == "José_42"
    assert chave_do_nome("João_42") == "joao_42"
