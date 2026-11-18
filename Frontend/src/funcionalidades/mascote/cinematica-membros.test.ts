import { expect, test } from "vitest";
import {
  ANCORAS_MEMBROS,
  COMPRIMENTOS_MEMBROS,
  calcularCaminhoMembro,
  dividirCurvaCubica,
  resolverMembro,
  transformarPontoCorpo,
  type MembroArticulado,
} from "./cinematica-membros";

test("cada membro parte da âncora no corpo e chega ao alvo neutro sem NaN", () => {
  const membros: MembroArticulado[] = [
    "braco_esquerdo",
    "braco_direito",
    "perna_esquerda",
    "perna_direita",
  ];
  for (const membro of membros) {
    const resultado = resolverMembro(membro, { x: 0, y: 0 });
    expect(resultado.ancora).toEqual(ANCORAS_MEMBROS[membro]);
    expect(Number.isFinite(resultado.ponta.x)).toBe(true);
    expect(Number.isFinite(resultado.ponta.y)).toBe(true);
    expect(Number.isFinite(resultado.junta.x)).toBe(true);
    expect(Number.isFinite(resultado.junta.y)).toBe(true);
    expect(calcularCaminhoMembro(resultado)).toMatch(/^M[\d.\s-]+C/);
  }
});

test("limita o alcance máximo da ponta para o membro nunca descolar do corpo", () => {
  const esticado = resolverMembro("braco_direito", { x: 800, y: -900 });
  const distancia = Math.hypot(
    esticado.ponta.x - esticado.ancora.x,
    esticado.ponta.y - esticado.ancora.y,
  );
  expect(distancia).toBeLessThanOrEqual(
    COMPRIMENTOS_MEMBROS.braco_direito + 0.5,
  );
  expect(distancia).toBeGreaterThan(COMPRIMENTOS_MEMBROS.braco_direito * 0.85);
});

test("aproximar a mão do ombro dobra automaticamente o cotovelo preservando o lado da dobra", () => {
  const frente = resolverMembro(
    "braco_direito",
    { x: -300, y: 170 },
    undefined,
    undefined,
    true,
  );
  const cima = resolverMembro("braco_direito", { x: -40, y: -80 }, 1);
  expect(frente.junta.x).toBeGreaterThan(frente.ancora.x);
  expect(cima.junta.y).not.toBe(frente.junta.y);
  const extremo = resolverMembro("perna_esquerda", { x: 114, y: -206 });
  expect(Number.isFinite(extremo.junta.x)).toBe(true);
  expect(Number.isFinite(extremo.ponta.y)).toBe(true);
});

test("divisão de De Casteljau preserva ponto de emenda e continuidade G1 da curva", () => {
  const resultado = resolverMembro("braco_direito", { x: -340, y: 175 }, 1);
  const [atras, frente] = dividirCurvaCubica(resultado, 0.45);
  expect(atras.ancora).toEqual(resultado.ancora);
  expect(frente.ponta).toEqual(resultado.ponta);
  expect(atras.ponta.x).toBeCloseTo(frente.ancora.x, 4);
  expect(atras.ponta.y).toBeCloseTo(frente.ancora.y, 4);

  // Vetor tangente no fim de `atras` deve ter a mesma direção do início de `frente`
  const t1x = atras.ponta.x - atras.c2.x;
  const t1y = atras.ponta.y - atras.c2.y;
  const t2x = frente.c1.x - frente.ancora.x;
  const t2y = frente.c1.y - frente.ancora.y;
  const produtoVetorial = t1x * t2y - t1y * t2x;
  expect(Math.abs(produtoVetorial)).toBeLessThan(1e-4);
});

test("transformarPontoCorpo mantém identidade no repouso e aplica translação, squash e rotação", () => {
  const quadril = ANCORAS_MEMBROS.perna_esquerda;
  expect(
    transformarPontoCorpo(quadril, {
      y: 0,
      rotacao: 0,
      escalaX: 1,
      escalaY: 1,
      inclinacaoX: 0,
    }),
  ).toEqual(quadril);

  const agachado = transformarPontoCorpo(quadril, {
    y: 20,
    rotacao: 0,
    escalaX: 1.06,
    escalaY: 0.9,
    inclinacaoX: 0,
  });
  expect(agachado.x).toBeLessThan(quadril.x);
  expect(agachado.y).toBeGreaterThan(quadril.y);
});
