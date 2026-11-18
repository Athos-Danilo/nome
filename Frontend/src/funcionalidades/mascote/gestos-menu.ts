import { poseAtuacao } from "./atuacoes";
import {
  aplicarFisicaSecundaria,
  interpolarRoteiro,
  type PoseCompleta,
  type QuadroRoteiro,
} from "./pose-base";

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

export type PoseGestoMenu = PoseCompleta;

const roteiros: Record<GestoMenu, readonly QuadroRoteiro[]> = {
  olhar_solo: [
    [0, {}],
    [
      0.13,
      {
        corpoY: 9,
        corpoRotacao: -1.8,
        corpoEscalaY: 0.96,
        olhos: 0.65,
        sobrancelhaY: -5,
        maoDireitaX: -12,
        maoDireitaY: 20,
      },
      "antecipacao",
    ],
    [
      0.32,
      {
        atencao: 1,
        corpoY: -6,
        corpoRotacao: 3.2,
        corpoEscalaY: 1.03,
        perspectivaX: 2,
        maoDireitaX: -22,
        maoDireitaY: -82,
        punho: -26,
        maoEsquerdaX: -22,
        maoEsquerdaY: -12,
        sobrancelhaY: -9,
        folheada: 0.3,
      },
      "impulso",
    ],
    [
      0.56,
      {
        atencao: 1,
        corpoY: -3,
        corpoRotacao: 3.8,
        maoDireitaX: -26,
        maoDireitaY: -94,
        punho: -28,
        bocaEscala: 1.04,
        sobrancelhaDireita: -6,
      },
      "suave",
    ],
    [
      0.75,
      {
        atencao: 0.75,
        corpoY: 2,
        maoDireitaX: -10,
        maoDireitaY: -32,
        punho: -14,
        olhos: 0.1,
      },
      "suave",
    ],
    [1, {}, "mola"],
  ],

  olhar_galera: [
    [0, {}],
    [
      0.11,
      {
        corpoY: 10,
        corpoRotacao: -2.2,
        corpoEscalaY: 0.96,
        olhos: 0.7,
        maoEsquerdaX: 12,
        maoEsquerdaY: -6,
      },
      "antecipacao",
    ],
    [
      0.3,
      {
        atencao: 1,
        corpoY: -8,
        corpoRotacao: 4.5,
        corpoEscalaY: 1.04,
        perspectivaX: 2.4,
        maoDireitaX: -28,
        maoDireitaY: -108,
        punho: -30,
        maoEsquerdaX: -38,
        maoEsquerdaY: -28,
        bracoEsquerdo: -16,
        sobrancelhaDireita: -12,
        folheada: 0.4,
      },
      "impulso",
    ],
    [
      0.54,
      {
        atencao: 1,
        corpoY: -4,
        corpoRotacao: 3.4,
        maoDireitaX: -22,
        maoDireitaY: -90,
        punho: -26,
        maoEsquerdaX: -30,
        maoEsquerdaY: -20,
      },
      "suave",
    ],
    [
      0.76,
      {
        atencao: 0.6,
        corpoY: 2,
        maoDireitaX: -10,
        maoDireitaY: -26,
        punho: -14,
        olhos: 0.08,
      },
      "suave",
    ],
    [1, {}, "mola"],
  ],

  ajeitar_gravata: [
    [0, {}],
    [
      0.11,
      {
        corpoY: 10,
        corpoRotacao: -1.5,
        corpoEscalaY: 0.96,
        pupilaY: 10,
        sobrancelhaY: 4,
        bocaPensativa: 0.65,
        maoDireitaX: -14,
        maoDireitaY: 68,
        punho: -12,
      },
      "antecipacao",
    ],
    [
      0.24,
      {
        corpoY: 6,
        corpoRotacao: 1.2,
        bracoDireitoFrente: 1,
        maoDireitaX: -120,
        maoDireitaY: 190,
        punho: -12,
        pupilaY: 11,
        bocaPensativa: 0.85,
      },
      "suave",
    ],
    [
      0.38,
      {
        corpoY: 5,
        corpoRotacao: -1.5,
        bracoDireitoFrente: 1,
        maoDireitaX: -305,
        maoDireitaY: 185,
        punho: -32,
        maoEsquerdaX: 16,
        maoEsquerdaY: -12,
        pupilaX: 5,
        pupilaY: 12,
        gravata: -9,
        gravataEscala: 1.07,
        sobrancelhaDireita: -6,
        bocaPensativa: 0.9,
      },
      "impulso",
    ],
    [
      0.49,
      {
        corpoY: 4,
        bracoDireitoFrente: 1,
        maoDireitaX: -315,
        maoDireitaY: 178,
        punho: -26,
        pupilaX: 5,
        pupilaY: 12,
        gravata: 11,
        gravataEscala: 1.08,
        bocaFechada: 0.7,
      },
      "suave",
    ],
    [
      0.6,
      {
        corpoY: 2,
        bracoDireitoFrente: 1,
        maoDireitaX: -302,
        maoDireitaY: 184,
        punho: -30,
        pupilaX: 4,
        pupilaY: 11,
        gravata: -5,
        gravataEscala: 1.05,
        bocaFechada: 0.9,
      },
      "suave",
    ],
    [
      0.74,
      {
        corpoY: -6,
        corpoEscalaY: 1.03,
        bracoDireitoFrente: 1,
        maoDireitaX: -90,
        maoDireitaY: 140,
        punho: -10,
        gravata: 3,
        sobrancelhaY: -9,
        olhoEsquerdo: 0.08,
        bocaEscala: 1.05,
      },
      "suave",
    ],
    [
      0.87,
      {
        bracoDireitoFrente: 0,
        maoDireitaX: -10,
        maoDireitaY: 22,
        punho: -10,
        corpoY: 3,
        gravata: -1.5,
      },
      "suave",
    ],
    [1, {}, "mola"],
  ],

  seguir_letra: [
    [0, {}],
    [
      0.11,
      {
        pupilaX: -10,
        pupilaY: -9,
        sobrancelhaEsquerda: -8,
        corpoY: 7,
        corpoRotacao: -2.2,
        maoEsquerdaX: -24,
        maoEsquerdaY: -45,
        letra: 0.5,
        letraX: 240,
        letraY: 230,
      },
      "antecipacao",
    ],
    [
      0.26,
      {
        pupilaX: -14,
        pupilaY: -11,
        corpoRotacao: -4.5,
        corpoEscalaY: 1.03,
        perspectivaX: -2,
        maoEsquerdaX: -48,
        maoEsquerdaY: -165,
        bracoEsquerdoAtras: 1,
        maoDireitaX: -55,
        maoDireitaY: -145,
        cotoveloDireitoDobra: -0.6,
        letra: 1,
        letraX: 260,
        letraY: 178,
        letraGiro: -18,
      },
      "impulso",
    ],
    [
      0.42,
      {
        pupilaX: 2,
        pupilaY: -12,
        corpoY: -10,
        corpoRotacao: 0.5,
        corpoEscalaY: 1.05,
        sobrancelhaY: -11,
        maoEsquerdaX: -36,
        maoEsquerdaY: -220,
        bracoEsquerdoAtras: 1,
        maoDireitaX: -20,
        maoDireitaY: -195,
        cotoveloDireitoDobra: -0.6,
        bocaSurpresa: 0.55,
        letra: 1,
        letraX: 605,
        letraY: 122,
        letraGiro: 6,
      },
      "suave",
    ],
    [
      0.58,
      {
        pupilaX: 15,
        pupilaY: -9,
        corpoRotacao: 4,
        perspectivaX: 2,
        bracoEsquerdoAtras: 0,
        maoEsquerdaX: -26,
        maoEsquerdaY: -22,
        maoDireitaX: -32,
        maoDireitaY: -168,
        punho: -28,
        letra: 1,
        letraX: 900,
        letraY: 215,
        letraGiro: 18,
      },
      "suave",
    ],
    [
      0.72,
      {
        pupilaX: 13,
        pupilaY: -4,
        olhos: 0.85,
        maoDireitaX: -18,
        maoDireitaY: -115,
        punho: -24,
        letra: 0.75,
        letraX: 995,
        letraY: 335,
        letraGiro: -8,
      },
      "suave",
    ],
    [
      0.81,
      {
        pupilaX: 9,
        pupilaY: -3,
        letra: 0,
        letraX: 1030,
        letraY: 310,
        brilho: 0.45,
        sobrancelhaDireita: -9,
        maoDireitaX: -8,
        maoDireitaY: -38,
        punho: -14,
      },
      "suave",
    ],
    [0.91, { olhos: 0.08, corpoY: 3 }, "suave"],
    [1, {}, "mola"],
  ],

  reagir_toque: [
    [0, {}],
    [
      0.12,
      {
        corpoY: 20,
        corpoEscalaY: 0.9,
        corpoRotacao: -2.5,
        sobrancelhaY: -12,
        bocaSurpresa: 0.75,
        maoDireitaX: -18,
        maoDireitaY: 36,
        punho: -10,
        maoEsquerdaX: -12,
        maoEsquerdaY: 12,
      },
      "antecipacao",
    ],
    [
      0.34,
      {
        saltoY: -54,
        corpoY: -6,
        corpoEscalaY: 1.07,
        inclinacao: -2.5,
        bracoEsquerdoAtras: 1,
        maoEsquerdaX: -52,
        maoEsquerdaY: -285,
        bracoEsquerdo: 18,
        maoDireitaX: -36,
        maoDireitaY: -160,
        punho: -30,
        peEsquerdoX: 18,
        peEsquerdoY: -26,
        pernaEsquerda: 16,
        peDireitoX: -12,
        peDireitoY: -32,
        pernaDireita: -18,
        bocaGargalhada: 0.7,
        brilho: 0.6,
        folheada: 0.5,
      },
      "impulso",
    ],
    [
      0.5,
      {
        saltoY: 0,
        corpoY: 14,
        corpoEscalaY: 0.93,
        bracoEsquerdoAtras: 0,
        maoEsquerdaX: -36,
        maoEsquerdaY: -45,
        maoDireitaX: -20,
        maoDireitaY: -88,
        punho: -24,
        bocaEscala: 1.06,
      },
      "suave",
    ],
    [
      0.64,
      {
        corpoY: -4,
        corpoRotacao: -2.5,
        corpoEscalaY: 1.02,
        olhoEsquerdo: 0.06,
        sobrancelhaEsquerda: -9,
        sobrancelhaDireita: 3,
        maoDireitaX: -22,
        maoDireitaY: -106,
        punho: -26,
        maoEsquerdaX: -24,
        maoEsquerdaY: -16,
        bocaEscala: 1.05,
        brilho: 0.35,
      },
      "impulso",
    ],
    [
      0.8,
      {
        olhoEsquerdo: 0.85,
        sobrancelhaY: -4,
        maoDireitaX: -8,
        maoDireitaY: -30,
        punho: -12,
        corpoY: 3,
      },
      "suave",
    ],
    [1, {}, "mola"],
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
  tempoMs: number,
  direcao?: DirecaoOlhar,
): PoseGestoMenu {
  const duracao = DURACOES_GESTOS[gesto];
  const t = Number.isFinite(tempoMs)
    ? Math.max(0, Math.min(duracao, tempoMs))
    : 0;
  const quadros = roteiros[gesto];
  if (t <= 0 || t >= duracao) return poseAtuacao("espera", 0);

  const base = interpolarRoteiro(quadros, t / duracao);
  const pose = aplicarFisicaSecundaria(base, quadros, t, duracao);

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
