import { poseAtuacao, type PoseAtuacao } from "./atuacoes";

export const GESTOS_MENU = [
  "olhar_solo",
  "olhar_galera",
  "ajeitar_gravata",
  "seguir_letra",
  "reagir_toque",
] as const;
export type GestoMenu = (typeof GESTOS_MENU)[number];
export type DirecaoOlhar = { x: number; y: number };
export const DURACOES_GESTOS: Record<GestoMenu, number> = {
  olhar_solo: 3200,
  olhar_galera: 3600,
  ajeitar_gravata: 4200,
  seguir_letra: 4600,
  reagir_toque: 3400,
};
export type PoseGestoMenu = PoseAtuacao & {
  olhoEsquerdo: number;
  letra: number;
  letraX: number;
  letraY: number;
  letraGiro: number;
  atencao: number;
};
export const COMPLEMENTO_POSE = {
  olhoEsquerdo: 1,
  letra: 0,
  letraX: 240,
  letraY: 210,
  letraGiro: -10,
  atencao: 0,
};
const neutra: PoseGestoMenu = {
  ...poseAtuacao("espera", 0),
  ...COMPLEMENTO_POSE,
};
type Quadro = readonly [fracao: number, pose: Partial<PoseGestoMenu>];
const roteiros: Record<GestoMenu, readonly Quadro[]> = {
  olhar_solo: [
    [0, {}],
    [0.12, { corpoY: 4, olhos: 0.7, sobrancelhaY: -4 }],
    [
      0.28,
      {
        atencao: 1,
        corpoRotacao: 0.9,
        ombro: -4,
        punho: -6,
        gravata: -1.5,
        sobrancelhaY: -7,
      },
    ],
    [
      0.52,
      {
        atencao: 1,
        corpoY: -3,
        corpoRotacao: 1.1,
        ombro: -6,
        punho: -8,
        gravata: 1,
        bocaEscala: 1.02,
      },
    ],
    [0.7, { atencao: 0.9, corpoY: -1, ombro: -3, sobrancelhaDireita: -4 }],
    [0.85, { atencao: 0.2, gravata: 1.3, paginasY: -0.8 }],
    [1, {}],
  ],
  olhar_galera: [
    [0, {}],
    [0.1, { corpoY: 5, corpoRotacao: -0.7, olhos: 0.8 }],
    [
      0.26,
      {
        atencao: 1,
        corpoRotacao: 1.7,
        ombro: -9,
        punho: -13,
        sobrancelhaDireita: -9,
        paginasY: -1.2,
      },
    ],
    [
      0.46,
      {
        atencao: 1,
        corpoY: -4,
        corpoRotacao: 1.3,
        ombro: -7,
        cotovelo: -3,
        punho: -9,
        gravata: 2,
      },
    ],
    [
      0.64,
      {
        atencao: 0.95,
        corpoY: 1,
        ombro: -4,
        punho: -5,
        gravata: -1.2,
        sobrancelhaY: -3,
      },
    ],
    [0.82, { atencao: 0.25, paginasY: 1, gravata: 0.8 }],
    [1, {}],
  ],
  ajeitar_gravata: [
    [0, {}],
    [0.1, { corpoY: 5, pupilaY: 8, sobrancelhaY: 3, bocaEscala: 0.97 }],
    [
      0.25,
      {
        corpoY: 4,
        ombro: 65,
        cotovelo: 30,
        punho: 5,
        pupilaY: 11,
        gravata: -2,
      },
    ],
    [
      0.4,
      {
        corpoY: 3,
        ombro: 125,
        cotovelo: 60,
        punho: 15,
        pupilaX: 6,
        pupilaY: 10,
        gravata: -5,
        sobrancelhaDireita: -4,
      },
    ],
    [
      0.49,
      {
        corpoY: 3,
        ombro: 123,
        cotovelo: 61,
        punho: 18,
        pupilaX: 6,
        pupilaY: 10,
        gravata: 5,
      },
    ],
    [
      0.57,
      {
        corpoY: 2,
        ombro: 125,
        cotovelo: 60,
        punho: 14,
        pupilaX: 5,
        pupilaY: 9,
        gravata: -2,
      },
    ],
    [
      0.67,
      {
        corpoY: -3,
        ombro: 100,
        cotovelo: 48,
        punho: 9,
        gravata: 3,
        sobrancelhaY: -6,
        bocaEscala: 1.03,
      },
    ],
    [0.83, { ombro: 25, cotovelo: 12, punho: -4, gravata: -1.5, paginasY: -1 }],
    [0.93, { gravata: 0.7, corpoY: 1 }],
    [1, {}],
  ],
  seguir_letra: [
    [0, {}],
    [
      0.1,
      {
        pupilaX: -9,
        pupilaY: -9,
        sobrancelhaEsquerda: -7,
        letra: 0.4,
        letraX: 240,
        letraY: 230,
      },
    ],
    [
      0.25,
      {
        pupilaX: -13,
        pupilaY: -11,
        corpoRotacao: -1.2,
        letra: 1,
        letraX: 250,
        letraY: 185,
        letraGiro: -16,
        gravata: 1.4,
      },
    ],
    [
      0.4,
      {
        pupilaX: 2,
        pupilaY: -12,
        corpoY: -5,
        sobrancelhaY: -9,
        letra: 1,
        letraX: 610,
        letraY: 130,
        letraGiro: 6,
      },
    ],
    [
      0.55,
      {
        pupilaX: 14,
        pupilaY: -9,
        corpoRotacao: 1.3,
        letra: 1,
        letraX: 890,
        letraY: 220,
        letraGiro: 18,
        ombro: -4,
        gravata: -1,
      },
    ],
    [
      0.68,
      {
        pupilaX: 12,
        pupilaY: -4,
        olhos: 0.85,
        letra: 0.8,
        letraX: 990,
        letraY: 340,
        letraGiro: -7,
      },
    ],
    [
      0.78,
      {
        pupilaX: 10,
        pupilaY: -3,
        letra: 0,
        letraX: 1030,
        letraY: 310,
        brilho: 0.25,
        sobrancelhaDireita: -7,
      },
    ],
    [0.9, { olhos: 0.1, corpoY: 1, gravata: 0.8 }],
    [1, {}],
  ],
  reagir_toque: [
    [0, {}],
    [
      0.12,
      {
        corpoY: 9,
        corpoEscalaY: 0.99,
        sobrancelhaY: -11,
        bocaSurpresa: 0.35,
        gravata: -3,
      },
    ],
    [
      0.25,
      { corpoY: 3, sobrancelhaY: -7, bocaEscala: 1.06, ombro: -8, punho: -8 },
    ],
    [
      0.4,
      {
        saltoY: -20,
        inclinacao: -1.2,
        pernaEsquerda: 1,
        pernaDireita: -1,
        gravata: 4,
        paginasY: -2,
        bocaEscala: 1.07,
        brilho: 0.35,
      },
    ],
    [
      0.52,
      { corpoY: 6, corpoEscalaY: 0.99, gravata: -3, paginasY: 1, ombro: -5 },
    ],
    [
      0.62,
      {
        olhoEsquerdo: 0.06,
        sobrancelhaEsquerda: -7,
        sobrancelhaDireita: 3,
        corpoRotacao: -1,
        punho: -11,
        gravata: 1.7,
        bocaEscala: 1.04,
      },
    ],
    [0.71, { olhoEsquerdo: 0.7, sobrancelhaY: -3, punho: -5, gravata: -0.8 }],
    [0.86, { paginasY: -0.5, gravata: 0.5, corpoY: -1 }],
    [1, {}],
  ],
};
const SURPRESAS_CONTA = GESTOS_MENU.filter((gesto) => gesto !== "reagir_toque");
const SURPRESAS_VISITANTE = ["ajeitar_gravata", "seguir_letra"] as const;
export const surpresasDisponiveis = (conta: boolean): readonly GestoMenu[] =>
  conta ? SURPRESAS_CONTA : SURPRESAS_VISITANTE;
export const ehGestoMenu = (valor: string | undefined): valor is GestoMenu =>
  GESTOS_MENU.some((gesto) => gesto === valor);

/** Linha de tempo local, sem DOM, relógio próprio ou regra das partidas. */
export function poseGestoMenu(
  gesto: GestoMenu,
  tempo: number,
  direcao?: DirecaoOlhar,
): PoseGestoMenu {
  const t = Math.max(
    0,
    Math.min(1, (Number.isFinite(tempo) ? tempo : 0) / DURACOES_GESTOS[gesto]),
  );
  const quadros = roteiros[gesto];
  if (t <= 0 || t >= 1) return { ...neutra };
  const indice = quadros.findIndex(([fracao]) => fracao > t);
  if (indice < 0) return { ...neutra };
  const [inicio, antes] = quadros[Math.max(0, indice - 1)];
  const [fim, depois] = quadros[indice];
  const fracao = (t - inicio) / (fim - inicio || 1);
  const curva = fracao * fracao * (3 - 2 * fracao);
  const pose = { ...neutra };
  for (const campo of Object.keys(neutra) as (keyof PoseGestoMenu)[]) {
    const a = antes[campo] ?? neutra[campo];
    pose[campo] = a + ((depois[campo] ?? neutra[campo]) - a) * curva;
  }
  if (gesto === "olhar_solo" || gesto === "olhar_galera") {
    const alvo =
      direcao ?? (gesto === "olhar_solo" ? { x: 9, y: -8 } : { x: 15, y: -5 });
    pose.pupilaX =
      Math.max(-16, Math.min(16, Number.isFinite(alvo.x) ? alvo.x : 0)) *
      pose.atencao;
    pose.pupilaY =
      Math.max(-12, Math.min(12, Number.isFinite(alvo.y) ? alvo.y : 0)) *
      pose.atencao;
  }
  return pose;
}
