export type TipoCurva = "linear" | "suave" | "impulso" | "antecipacao" | "mola";

const limitar = (t: number) =>
  Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0;

export const CURVAS: Record<TipoCurva, (t: number) => number> = {
  linear: (t) => limitar(t),
  suave: (t) => {
    const u = limitar(t);
    return u * u * (3 - 2 * u);
  },
  impulso: (t) => {
    const u = limitar(t);
    if (u === 0 || u === 1) return u;
    const x = u - 1;
    const c1 = 1.45;
    const c3 = c1 + 1;
    return 1 + c3 * x * x * x + c1 * x * x;
  },
  antecipacao: (t) => {
    const u = limitar(t);
    if (u === 0 || u === 1) return u;
    const c1 = 1.2;
    const c3 = c1 + 1;
    return c3 * u * u * u - c1 * u * u;
  },
  mola: (t) => {
    const u = limitar(t);
    if (u === 0 || u === 1) return u;
    return 1 - Math.exp(-5.5 * u) * Math.cos(u * Math.PI * 2.5);
  },
};

export function aplicarCurva(tipo: TipoCurva, progresso: number): number {
  return CURVAS[tipo](progresso);
}
