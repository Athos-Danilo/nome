import { expect, test } from "vitest";
import { REACOES, DURACOES } from "./reacoes";
import { poseSaudacao } from "./saudacao";
import { poseAtuacao } from "./atuacoes";

test("todas as atuações partem do repouso e terminam sem deixar partes deslocadas", () => {
  for (const reacao of REACOES) {
    const inicio = poseAtuacao(reacao, 0);
    expect(poseAtuacao(reacao, DURACOES[reacao])).toEqual(inicio);
    expect(poseAtuacao(reacao, -100)).toEqual(inicio);
    expect(poseAtuacao(reacao, Number.NaN)).toEqual(inicio);
    for (let tempo = 0; tempo <= DURACOES[reacao]; tempo += 37) {
      for (const valor of Object.values(poseAtuacao(reacao, tempo))) {
        expect(Number.isFinite(valor)).toBe(true);
      }
    }
  }
});

test("a saudação mantém exatamente as poses aprovadas", () => {
  for (let tempo = 0; tempo <= DURACOES.saudacao; tempo += 23) {
    expect(poseAtuacao("saudacao", tempo)).toMatchObject(poseSaudacao(tempo));
  }
});

test("o repertório tem atuação própria em vez de repetir o aceno", () => {
  const assinaturas = REACOES.map((reacao) =>
    JSON.stringify(
      [0.2, 0.4, 0.65].map((fracao) =>
        poseAtuacao(reacao, DURACOES[reacao] * fracao),
      ),
    ),
  );
  expect(new Set(assinaturas).size).toBe(REACOES.length);
  expect(
    poseAtuacao("comemoracao", DURACOES.comemoracao * 0.4).saltoY,
  ).toBeLessThan(-25);
  expect(
    poseAtuacao("pensamento", DURACOES.pensamento * 0.4).duvida,
  ).toBeGreaterThan(0.5);
  expect(poseAtuacao("erro", DURACOES.erro * 0.4).bocaFechada).toBeGreaterThan(
    0.5,
  );
});

test("efeitos terminam, expressões respeitam seus limites e o repouso é discreto", () => {
  for (const reacao of REACOES) {
    for (let tempo = 0; tempo <= DURACOES[reacao]; tempo += 31) {
      const pose = poseAtuacao(reacao, tempo);
      for (const campo of [
        "duvida",
        "brilho",
        "festa",
        "direcao",
        "suspense",
        "medalha",
        "bocaFechada",
        "bocaSurpresa",
      ] as const) {
        expect(pose[campo]).toBeGreaterThanOrEqual(0);
        expect(pose[campo]).toBeLessThanOrEqual(1);
      }
      expect(pose.olhos).toBeGreaterThanOrEqual(0.05);
      expect(pose.olhos).toBeLessThanOrEqual(1);
      if (reacao === "espera")
        expect(Math.abs(pose.corpoY)).toBeLessThanOrEqual(4);
    }
  }
});
