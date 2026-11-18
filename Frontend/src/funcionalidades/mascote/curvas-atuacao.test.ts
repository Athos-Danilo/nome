import { expect, test } from "vitest";
import { aplicarCurva, CURVAS, type TipoCurva } from "./curvas-atuacao";

test("todas as curvas começam em 0, terminam em 1 e permanecem finitas", () => {
  const tipos: TipoCurva[] = [
    "linear",
    "suave",
    "impulso",
    "antecipacao",
    "mola",
  ];
  for (const tipo of tipos) {
    expect(aplicarCurva(tipo, 0)).toBeCloseTo(0, 5);
    expect(aplicarCurva(tipo, 1)).toBeCloseTo(1, 5);
    expect(aplicarCurva(tipo, -0.5)).toBeCloseTo(0, 5);
    expect(aplicarCurva(tipo, 1.5)).toBeCloseTo(1, 5);
    expect(aplicarCurva(tipo, Number.NaN)).toBe(0);
    for (let i = 0; i <= 20; i++) {
      expect(Number.isFinite(CURVAS[tipo](i / 20))).toBe(true);
    }
  }
});

test("impulso gera overshoot elástico acima de 1 e antecipação recua abaixo de 0", () => {
  const valoresImpulso = Array.from({ length: 19 }, (_, i) =>
    aplicarCurva("impulso", (i + 1) / 20),
  );
  expect(Math.max(...valoresImpulso)).toBeGreaterThan(1);

  const valoresAntecipacao = Array.from({ length: 19 }, (_, i) =>
    aplicarCurva("antecipacao", (i + 1) / 20),
  );
  expect(Math.min(...valoresAntecipacao)).toBeLessThan(0);
});
