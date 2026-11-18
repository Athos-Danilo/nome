import { expect, test } from "vitest";
import { misturarPoses, DURACAO_BLENDING_MS } from "./transicao-poses";

test("mistura poses suavemente sem NaN respeitando fronteiras 0 e 1", () => {
  const origem = {
    corpoY: 16,
    saltoY: -40,
    maoDireitaX: -120,
    olhos: 0.2,
    bocaSurpresa: 1,
    folheada: 0.8,
  };
  const destino = {
    corpoY: -8,
    saltoY: 0,
    maoDireitaX: 40,
    olhos: 1,
    bocaSurpresa: 0,
    folheada: 0,
  };

  expect(DURACAO_BLENDING_MS).toBeGreaterThanOrEqual(120);
  expect(misturarPoses(origem, destino, 0)).toEqual(origem);
  expect(misturarPoses(origem, destino, 1)).toEqual(destino);

  const meio = misturarPoses(origem, destino, 0.5);
  expect(meio.corpoY).toBeCloseTo(4, 2);
  expect(meio.saltoY).toBeCloseTo(-20, 2);
  expect(meio.maoDireitaX).toBeCloseTo(-40, 2);
  expect(meio.bocaSurpresa).toBeCloseTo(0.5, 2);
});
