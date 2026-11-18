import { expect, test } from "vitest";
import {
  aplicarFisicaSecundaria,
  escalaXPorVolume,
  interpolarRoteiro,
  POSE_NEUTRA,
  type QuadroRoteiro,
} from "./pose-base";

test("interpolação de roteiro preserva início e fim neutros e aplica curvas distintas", () => {
  const roteiro: readonly QuadroRoteiro[] = [
    [0, {}],
    [0.3, { corpoY: 20, saltoY: -50 }, "antecipacao"],
    [0.7, { corpoY: -10, maoDireitaY: -100 }, "impulso"],
    [1, {}, "mola"],
  ];

  expect(interpolarRoteiro(roteiro, 0)).toEqual(POSE_NEUTRA);
  expect(interpolarRoteiro(roteiro, 1)).toEqual(POSE_NEUTRA);
  expect(interpolarRoteiro(roteiro, Number.NaN)).toEqual(POSE_NEUTRA);

  const meio = interpolarRoteiro(roteiro, 0.5);
  expect(meio.maoDireitaY).toBeLessThan(0);
  expect(Number.isFinite(meio.corpoY)).toBe(true);
});

test("conservação de volume ajusta escala horizontal inversamente à vertical", () => {
  expect(escalaXPorVolume(1)).toBe(1);
  expect(escalaXPorVolume(0.9)).toBeGreaterThan(1);
  expect(escalaXPorVolume(1.1)).toBeLessThan(1);
  expect(escalaXPorVolume(Number.NaN)).toBe(1);
});

test("física secundária adiciona inércia em movimento mas zera nas bordas da atuação", () => {
  const roteiro: readonly QuadroRoteiro[] = [
    [0, {}],
    [0.25, { corpoY: 22, corpoRotacao: -4 }],
    [0.5, { saltoY: -65, corpoY: -6, corpoRotacao: 5 }],
    [0.75, { corpoY: 16 }],
    [1, {}],
  ];

  const inicio = interpolarRoteiro(roteiro, 0);
  const fim = interpolarRoteiro(roteiro, 1);
  expect(aplicarFisicaSecundaria(inicio, roteiro, 0, 3000)).toEqual(
    POSE_NEUTRA,
  );
  expect(aplicarFisicaSecundaria(fim, roteiro, 3000, 3000)).toEqual(
    POSE_NEUTRA,
  );

  const subindo = interpolarRoteiro(roteiro, 0.38);
  const comFisica = aplicarFisicaSecundaria(
    subindo,
    roteiro,
    0.38 * 3000,
    3000,
  );
  expect(comFisica.gravata).not.toBe(subindo.gravata);
  expect(comFisica.paginasY).not.toBe(subindo.paginasY);
});
