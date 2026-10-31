"""Efeitos originais sintetizados para o Decifra; sem amostras externas."""

import math
import struct
import wave
from pathlib import Path

TAXA = 22050
# Frequências e tempos escolhidos para sinais suaves, sem falas ou melodias externas.
EFEITOS = {
    "botao": [(660, 0.065)],
    "tecla": [(880, 0.035)],
    "apagar": [(330, 0.06)],
    "acento": [(1100, 0.085)],
    "arrastar": [(440, 0.045), (660, 0.055)],
    "abrir": [(440, 0.07), (660, 0.1)],
    "fechar": [(660, 0.065), (440, 0.085)],
    "acerto": [(523.25, 0.09), (659.25, 0.09), (783.99, 0.1), (1046.5, 0.18)],
    "erro": [(392, 0.1), (329.63, 0.15)],
    "dica": [(659.25, 0.1), (987.77, 0.16)],
    "turno": [(493.88, 0.09), (739.99, 0.15)],
    "sorteio": [(440, 0.06), (554.37, 0.06), (659.25, 0.06), (554.37, 0.06), (880, 0.24)],
    "resultado": [(523.25, 0.12), (659.25, 0.12), (783.99, 0.12), (1046.5, 0.4)],
}


def sintetizar(nome: str) -> list[float]:
    amostras: list[float] = []
    for frequencia, duracao in EFEITOS[nome]:
        for indice in range(round(TAXA * duracao)):
            instante = indice / TAXA
            ataque = min(1, instante / 0.004)
            soltura = min(1, (duracao - instante) / 0.022)
            envelope = ataque * soltura * math.exp(-instante * 6)
            fundamental = math.sin(2 * math.pi * frequencia * instante)
            harmonico = 0.16 * math.sin(4 * math.pi * frequencia * instante)
            amostras.append(0.36 * envelope * (fundamental + harmonico))
    return amostras


def gravar_efeito(nome: str, destino: Path) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(destino), "wb") as arquivo:
        arquivo.setnchannels(1)
        arquivo.setsampwidth(2)
        arquivo.setframerate(TAXA)
        arquivo.writeframes(
            b"".join(struct.pack("<h", round(valor * 32767)) for valor in sintetizar(nome))
        )


if __name__ == "__main__":
    pasta = Path(__file__).resolve().parents[2] / "Frontend/public/audio/efeitos"
    for efeito in EFEITOS:
        gravar_efeito(efeito, pasta / f"{efeito}.wav")
    print(f"Gerados {len(EFEITOS)} efeitos originais em {pasta}.")
