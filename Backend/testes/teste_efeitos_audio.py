import wave

from comandos.gerar_efeitos import EFEITOS, gravar_efeito, sintetizar


def teste_efeitos_sao_deterministicos_curtos_e_sem_saturacao(tmp_path):
    assert {
        "botao",
        "tecla",
        "acerto",
        "erro",
        "dica",
        "turno",
        "sorteio",
        "resultado",
    } <= EFEITOS.keys()
    for nome in EFEITOS:
        amostras = sintetizar(nome)
        assert amostras == sintetizar(nome)
        assert 500 < len(amostras) <= 33075
        assert 0.01 < max(abs(valor) for valor in amostras) < 0.95
        destino = tmp_path / f"{nome}.wav"
        gravar_efeito(nome, destino)
        with wave.open(str(destino), "rb") as arquivo:
            assert arquivo.getnchannels() == 1
            assert arquivo.getframerate() == 22050
            assert arquivo.getsampwidth() == 2
            assert arquivo.getnframes() == len(amostras)
