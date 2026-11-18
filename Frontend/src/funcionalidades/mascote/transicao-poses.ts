import { aplicarCurva } from "./curvas-atuacao";

/** Tempo padrão de transição suave entre atuações interrompidas ou retorno ao repouso. */
export const DURACAO_BLENDING_MS = 160;

export function misturarPoses<T extends Record<string, number>>(
  origem: T,
  destino: T,
  progresso: number,
): T {
  const u = aplicarCurva("suave", progresso);
  if (u <= 0) return { ...origem };
  if (u >= 1) return { ...destino };

  const resultado = { ...destino };
  for (const campo of Object.keys(destino) as (keyof T)[]) {
    const inicio = origem[campo];
    const fim = destino[campo];
    if (typeof inicio === "number" && typeof fim === "number") {
      resultado[campo] = (inicio + (fim - inicio) * u) as T[keyof T];
    }
  }
  return resultado;
}
