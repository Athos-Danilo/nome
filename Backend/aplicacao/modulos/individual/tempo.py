"""União de intervalos ativos: sobreposição e reenvio não somam duas vezes."""

from aplicacao.modulos.autenticacao.contratos import FalhaAutenticacao


def unir_intervalos(
    anteriores: list[list[int]] | None, inicio: int, fim: int, agora: int
) -> list[list[int]]:
    if fim < inicio or fim - inicio > 10000 or inicio < agora - 30000 or fim > agora + 2000:
        raise FalhaAutenticacao(
            "TEMPO_INVALIDO", "Não foi possível confirmar esse intervalo de tempo.", 422
        )
    unidos: list[list[int]] = []
    for a, b in sorted([*(anteriores or []), [inicio, fim]]):
        if unidos and a <= unidos[-1][1]:
            unidos[-1][1] = max(b, unidos[-1][1])
        else:
            unidos.append([a, b])
    return unidos


def duracao(intervalos: list[list[int]] | None) -> int | None:
    return None if intervalos is None else sum(b - a for a, b in intervalos)
