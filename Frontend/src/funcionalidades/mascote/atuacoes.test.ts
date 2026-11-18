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

test("a saudação do repertório preserva exatamente poseSaudacao", () => {
  for (let tempo = 0; tempo <= DURACOES.saudacao; tempo += 23) {
    expect(poseAtuacao("saudacao", tempo)).toEqual(poseSaudacao(tempo));
  }
});

test("as 13 atuações têm coreografias distintas usando os dois braços, joelhos e expressões", () => {
  const assinaturas = REACOES.map((reacao) =>
    JSON.stringify(
      [0.2, 0.4, 0.65].map((fracao) =>
        poseAtuacao(reacao, DURACOES[reacao] * fracao),
      ),
    ),
  );
  expect(new Set(assinaturas).size).toBe(REACOES.length);

  const picoComemoracao = poseAtuacao(
    "comemoracao",
    DURACOES.comemoracao * 0.35,
  );
  expect(picoComemoracao.saltoY).toBeLessThan(-35);
  expect(picoComemoracao.maoEsquerdaY).toBeLessThan(-150);
  expect(picoComemoracao.palpebraFeliz).toBeGreaterThan(0.5);

  const picoEpica = poseAtuacao(
    "comemoracao_epica",
    DURACOES.comemoracao_epica * 0.32,
  );
  expect(picoEpica.saltoY).toBeLessThan(-50);
  expect(picoEpica.bocaGargalhada).toBeGreaterThan(0.5);

  const picoPensamento = poseAtuacao("pensamento", DURACOES.pensamento * 0.35);
  expect(picoPensamento.duvida).toBeGreaterThan(0.5);
  expect(picoPensamento.bracoDireitoFrente).toBeGreaterThan(0.5);
  expect(picoPensamento.palpebraSemicerrada).toBeGreaterThan(0.3);

  const picoFolhear = poseAtuacao("folhear_dica", DURACOES.folhear_dica * 0.35);
  expect(picoFolhear.folheada).toBeGreaterThan(0.4);

  const picoErro = poseAtuacao("erro", DURACOES.erro * 0.38);
  expect(picoErro.palpebraEmpatica).toBeGreaterThan(0.4);
  expect(picoErro.bocaEncabulada).toBeGreaterThan(0.4);
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
        "folheada",
        "palpebraFeliz",
        "palpebraSemicerrada",
        "palpebraEmpatica",
        "bocaFechada",
        "bocaSurpresa",
        "bocaPensativa",
        "bocaGargalhada",
        "bocaEncabulada",
      ] as const) {
        expect(pose[campo]).toBeGreaterThanOrEqual(0);
        expect(pose[campo]).toBeLessThanOrEqual(1);
      }
      expect(pose.olhos).toBeGreaterThanOrEqual(0.05);
      expect(pose.olhos).toBeLessThanOrEqual(1);
      if (reacao === "espera")
        expect(Math.abs(pose.corpoY)).toBeLessThanOrEqual(6);
    }
  }
});
