import { DURACOES, type Reacao } from "./reacoes";
import { poseSaudacao, type PoseSaudacao } from "./saudacao";

export type PoseAtuacao = PoseSaudacao & {
  saltoY: number;
  deslocamentoX: number;
  inclinacao: number;
  sobrancelhaEsquerda: number;
  sobrancelhaDireita: number;
  bocaFechada: number;
  bocaSurpresa: number;
  duvida: number;
  brilho: number;
  festa: number;
  direcao: number;
  suspense: number;
  medalha: number;
};
const neutra: PoseAtuacao = {
  ...poseSaudacao(0),
  saltoY: 0,
  deslocamentoX: 0,
  inclinacao: 0,
  sobrancelhaEsquerda: 0,
  sobrancelhaDireita: 0,
  bocaFechada: 0,
  bocaSurpresa: 0,
  duvida: 0,
  brilho: 0,
  festa: 0,
  direcao: 0,
  suspense: 0,
  medalha: 0,
};
type Quadro = readonly [fracao: number, mudancas: Partial<PoseAtuacao>];

/** Poses com intenção, em ordem: preparar, agir, sustentar e acomodar. */
const roteiros: Record<Exclude<Reacao, "saudacao">, readonly Quadro[]> = {
  espera: [
    [0, {}],
    [0.18, { corpoY: -3, corpoRotacao: 0.3, gravata: -0.7, paginasY: -0.6 }],
    [
      0.32,
      { corpoY: -1, pupilaX: 5, pupilaY: -2, sobrancelhaY: -3, ombro: -1 },
    ],
    [0.37, { corpoY: 1, pupilaX: 5, olhos: 0.06, gravata: 0.8 }],
    [0.42, { corpoY: 2, pupilaX: 5, olhos: 1, gravata: 0.4 }],
    [
      0.64,
      {
        corpoY: 3,
        corpoRotacao: -0.3,
        pupilaX: -3,
        pupilaY: 1,
        bracoEsquerdo: 0.8,
      },
    ],
    [0.84, { corpoY: -2, gravata: -0.6, paginasY: -0.5 }],
    [1, {}],
  ],
  pensamento: [
    [0, {}],
    [
      0.13,
      { corpoY: 6, corpoRotacao: -1, olhos: 0.7, bocaFechada: 0.8, ombro: 3 },
    ],
    [
      0.28,
      {
        corpoY: -5,
        corpoRotacao: -2.2,
        pupilaX: 12,
        pupilaY: -12,
        sobrancelhaEsquerda: -12,
        sobrancelhaDireita: 5,
        sobrancelhaY: -5,
        bocaFechada: 1,
        ombro: -8,
        cotovelo: -4,
        punho: 8,
        duvida: 0.85,
      },
    ],
    [
      0.4,
      {
        corpoY: -3,
        corpoRotacao: -1.9,
        pupilaX: 14,
        pupilaY: -10,
        sobrancelhaEsquerda: -10,
        sobrancelhaDireita: 4,
        bocaFechada: 1,
        ombro: -7,
        punho: 5,
        duvida: 1,
        paginasY: -2,
      },
    ],
    [
      0.56,
      {
        corpoY: -2,
        corpoRotacao: 0.6,
        pupilaX: -8,
        pupilaY: -5,
        sobrancelhaEsquerda: 4,
        sobrancelhaDireita: -8,
        bocaFechada: 1,
        ombro: -6,
        cotovelo: -3,
        duvida: 0.9,
        gravata: 2,
      },
    ],
    [
      0.7,
      {
        corpoY: -8,
        sobrancelhaY: -12,
        pupilaY: -6,
        ombro: -11,
        cotovelo: -4,
        punho: -7,
        bocaSurpresa: 0.75,
        brilho: 1,
        duvida: 0.2,
        paginasY: -3,
      },
    ],
    [0.85, { corpoY: 2, ombro: -3, cotovelo: -1, gravata: -2, brilho: 0.4 }],
    [1, {}],
  ],
  apresentacao: [
    [0, {}],
    [
      0.14,
      {
        corpoY: 8,
        corpoRotacao: -1,
        ombro: 3,
        punho: -5,
        pupilaX: -4,
        bocaFechada: 0.3,
      },
    ],
    [
      0.34,
      {
        corpoY: -10,
        corpoRotacao: 1.8,
        ombro: -13,
        cotovelo: -5,
        punho: 8,
        pupilaX: 14,
        pupilaY: -3,
        sobrancelhaY: -8,
        bocaEscala: 1.035,
        brilho: 1,
        paginasY: -3,
        gravata: -3,
      },
    ],
    [
      0.54,
      {
        corpoY: -6,
        corpoRotacao: 1.4,
        ombro: -11,
        cotovelo: -3,
        punho: 5,
        pupilaX: 10,
        sobrancelhaY: -5,
        brilho: 0.9,
        gravata: 3,
      },
    ],
    [
      0.69,
      { corpoY: -3, ombro: -8, punho: 2, pupilaX: 5, olhos: 0.08, brilho: 0.4 },
    ],
    [0.83, { corpoY: 2, ombro: -2, gravata: -2, paginasY: 1 }],
    [1, {}],
  ],
  erro: [
    [0, {}],
    [
      0.12,
      {
        corpoY: 7,
        corpoRotacao: -1.4,
        olhos: 0.65,
        bocaSurpresa: 1,
        pupilaX: -4,
        gravata: 4,
      },
    ],
    [
      0.29,
      {
        corpoY: -6,
        corpoRotacao: -2,
        ombro: -8,
        cotovelo: -4,
        punho: 9,
        bracoEsquerdo: -3,
        bocaFechada: 1,
        sobrancelhaEsquerda: 9,
        sobrancelhaDireita: -8,
        pupilaX: -8,
        pupilaY: 5,
        gravata: -3,
      },
    ],
    [
      0.4,
      {
        corpoY: -5,
        corpoRotacao: 1.8,
        ombro: -9,
        cotovelo: -3,
        punho: 7,
        bracoEsquerdo: -3,
        bocaFechada: 1,
        sobrancelhaEsquerda: 8,
        sobrancelhaDireita: -7,
        pupilaX: 6,
        pupilaY: 4,
      },
    ],
    [
      0.54,
      {
        corpoY: -3,
        corpoRotacao: -1,
        ombro: -6,
        punho: 5,
        bocaFechada: 1,
        olhos: 0.55,
        sobrancelhaY: 3,
      },
    ],
    [
      0.7,
      {
        corpoY: 4,
        corpoRotacao: 0.5,
        bocaFechada: 0.5,
        ombro: -2,
        gravata: 2,
        pupilaY: 2,
      },
    ],
    [0.84, { corpoY: -2, sobrancelhaY: -5, bocaEscala: 1.01, gravata: -1 }],
    [1, {}],
  ],
  comemoracao: [
    [0, {}],
    [
      0.12,
      {
        corpoY: 18,
        corpoEscalaY: 0.98,
        ombro: 4,
        punho: -6,
        olhos: 0.7,
        gravata: 3,
      },
    ],
    [
      0.27,
      {
        saltoY: -58,
        corpoY: -5,
        corpoEscalaY: 1.012,
        corpoRotacao: -1,
        ombro: -22,
        cotovelo: -10,
        punho: -12,
        bracoEsquerdo: -5,
        pernaEsquerda: 3,
        pernaDireita: -3,
        sobrancelhaY: -12,
        bocaEscala: 1.05,
        festa: 0.7,
        gravata: -6,
        paginasY: -4,
      },
    ],
    [
      0.4,
      {
        saltoY: -54,
        corpoY: -4,
        corpoRotacao: 1,
        ombro: -24,
        cotovelo: -9,
        punho: 10,
        bracoEsquerdo: -4,
        pernaEsquerda: 2,
        pernaDireita: -2,
        olhos: 0.08,
        sobrancelhaY: -9,
        bocaEscala: 1.045,
        festa: 1,
        gravata: -2,
      },
    ],
    [
      0.57,
      {
        corpoY: 20,
        corpoEscalaY: 0.98,
        ombro: -12,
        cotovelo: -5,
        punho: -6,
        olhos: 0.65,
        festa: 0.85,
        gravata: 6,
        paginasY: 3,
      },
    ],
    [
      0.71,
      {
        saltoY: -15,
        corpoY: -3,
        ombro: -8,
        cotovelo: -2,
        punho: 5,
        festa: 0.5,
        bocaEscala: 1.02,
        gravata: -3,
      },
    ],
    [0.86, { corpoY: 3, ombro: -2, festa: 0.1, gravata: 1.5 }],
    [1, {}],
  ],
  turno: [
    [0, {}],
    [
      0.16,
      { corpoY: 5, corpoRotacao: -1, pupilaX: -9, sobrancelhaY: -5, punho: -4 },
    ],
    [
      0.35,
      {
        corpoY: -7,
        corpoRotacao: 1.8,
        ombro: -12,
        cotovelo: -4,
        punho: 12,
        pupilaX: 15,
        sobrancelhaY: -8,
        direcao: 0.85,
        gravata: -3,
      },
    ],
    [
      0.52,
      {
        corpoY: -4,
        corpoRotacao: 1.4,
        ombro: -9,
        cotovelo: -3,
        punho: 7,
        pupilaX: 12,
        direcao: 1,
        bocaEscala: 1.02,
        gravata: 2,
      },
    ],
    [
      0.72,
      {
        corpoY: 4,
        ombro: -4,
        punho: 2,
        direcao: 0.5,
        olhos: 0.08,
        gravata: -1,
      },
    ],
    [1, {}],
  ],
  sorteio: [
    [0, {}],
    [0.12, { corpoY: 6, bocaFechada: 0.8, ombro: 2, pupilaY: -4 }],
    [
      0.28,
      {
        corpoY: -6,
        corpoRotacao: -1.5,
        pupilaX: -12,
        sobrancelhaEsquerda: -7,
        bocaFechada: 1,
        ombro: -8,
        cotovelo: -5,
        suspense: 0.8,
        paginasY: -3,
      },
    ],
    [
      0.42,
      {
        corpoY: -3,
        corpoRotacao: 1.5,
        pupilaX: 12,
        sobrancelhaDireita: -7,
        bocaFechada: 1,
        ombro: -10,
        punho: 8,
        suspense: 1,
        gravata: 3,
      },
    ],
    [
      0.53,
      {
        corpoY: 5,
        pupilaY: -8,
        bocaSurpresa: 1,
        olhos: 0.85,
        suspense: 1,
        ombro: -5,
        gravata: -2,
      },
    ],
    [
      0.66,
      {
        corpoY: -12,
        ombro: -18,
        cotovelo: -7,
        punho: -8,
        pupilaX: 8,
        sobrancelhaY: -12,
        brilho: 1,
        suspense: 0.3,
        bocaEscala: 1.04,
        paginasY: -3,
      },
    ],
    [0.82, { corpoY: 4, ombro: -6, brilho: 0.4, gravata: 3 }],
    [1, {}],
  ],
  resultado: [
    [0, {}],
    [
      0.12,
      {
        corpoY: -4,
        sobrancelhaY: -8,
        pupilaY: -5,
        ombro: -6,
        bocaEscala: 1.02,
      },
    ],
    [
      0.3,
      {
        corpoY: -10,
        corpoRotacao: 1.2,
        ombro: -18,
        cotovelo: -5,
        punho: 10,
        bracoEsquerdo: -3,
        medalha: 0.9,
        brilho: 0.5,
        sobrancelhaY: -8,
        bocaEscala: 1.04,
        gravata: -3,
      },
    ],
    [
      0.4,
      {
        corpoY: -6,
        corpoRotacao: 0.5,
        ombro: -14,
        cotovelo: -3,
        punho: 6,
        medalha: 1,
        brilho: 0.7,
        bocaEscala: 1.03,
        gravata: 2,
      },
    ],
    [
      0.55,
      {
        corpoY: 12,
        corpoRotacao: 3,
        corpoEscalaY: 0.98,
        olhos: 0.15,
        bocaFechada: 0.6,
        ombro: -5,
        medalha: 1,
        gravata: 4,
        paginasY: 2,
      },
    ],
    [
      0.7,
      {
        corpoY: -5,
        corpoRotacao: -0.5,
        ombro: -10,
        cotovelo: -3,
        punho: -4,
        sobrancelhaY: -6,
        medalha: 0.75,
        brilho: 0.4,
        gravata: -3,
      },
    ],
    [0.87, { corpoY: 2, ombro: -3, medalha: 0.2, gravata: 1 }],
    [1, {}],
  ],
};

export function poseAtuacao(reacao: Reacao, tempo: number): PoseAtuacao {
  if (reacao === "saudacao") return { ...neutra, ...poseSaudacao(tempo) };
  const t = Math.max(
    0,
    Math.min(1, (Number.isFinite(tempo) ? tempo : 0) / DURACOES[reacao]),
  );
  const quadros = roteiros[reacao];
  const indice = quadros.findIndex(([fracao]) => fracao > t);
  if (indice < 0) return { ...neutra };
  const [inicio, antes] = quadros[Math.max(0, indice - 1)];
  const [fim, depois] = quadros[indice];
  const fracao = (t - inicio) / (fim - inicio || 1);
  const curva = fracao * fracao * (3 - 2 * fracao);
  const pose = { ...neutra };
  for (const campo of Object.keys(neutra) as (keyof PoseAtuacao)[]) {
    const a = antes[campo] ?? neutra[campo];
    pose[campo] = a + ((depois[campo] ?? neutra[campo]) - a) * curva;
  }
  return pose;
}
