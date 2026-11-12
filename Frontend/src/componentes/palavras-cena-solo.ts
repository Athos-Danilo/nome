/** Conteúdo ilustrativo local; não consulta nem registra palavras de partidas. */
export const PALAVRAS_CENA_SOLO = [
  "SOL",
  "LUA",
  "MAR",
  "CÉU",
  "RIO",
  "PAZ",
  "VOZ",
  "MEL",
  "COR",
  "LAR",
] as const;
export type CicloPalavras = { ordem: readonly string[]; inicio: number };
export function criarCicloPalavras(
  sortear: () => number,
  anterior?: string,
): CicloPalavras {
  const ordem: string[] = [...PALAVRAS_CENA_SOLO];
  for (let i = ordem.length - 1; i > 0; i--) {
    const valor = sortear();
    const j = Math.min(
      i,
      Math.floor((Number.isFinite(valor) ? Math.max(0, valor) : 0) * (i + 1)),
    );
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  if (ordem[0] === anterior) [ordem[0], ordem[1]] = [ordem[1], ordem[0]];
  return { ordem, inicio: 0 };
}
export function avancarCicloPalavras(
  ciclo: CicloPalavras,
  sortear: () => number,
): CicloPalavras {
  if (ciclo.inicio + 2 < ciclo.ordem.length)
    return { ...ciclo, inicio: ciclo.inicio + 2 };
  return criarCicloPalavras(sortear, ciclo.ordem.at(-1));
}
