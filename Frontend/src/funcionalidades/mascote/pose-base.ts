import { aplicarCurva, type TipoCurva } from "./curvas-atuacao";

export type PoseCompleta = {
  corpoY: number;
  corpoRotacao: number;
  corpoEscalaY: number;
  perspectivaX: number;
  saltoY: number;
  deslocamentoX: number;
  inclinacao: number;

  maoDireitaX: number;
  maoDireitaY: number;
  cotoveloDireitoDobra: number;
  punho: number;
  bracoDireitoFrente: number;

  maoEsquerdaX: number;
  maoEsquerdaY: number;
  cotoveloEsquerdoDobra: number;
  bracoEsquerdo: number;
  bracoEsquerdoAtras: number;

  peEsquerdoX: number;
  peEsquerdoY: number;
  joelhoEsquerdoDobra: number;
  pernaEsquerda: number;
  peDireitoX: number;
  peDireitoY: number;
  joelhoDireitoDobra: number;
  pernaDireita: number;

  gravata: number;
  gravataEscala: number;
  paginasY: number;
  folheada: number;

  pupilaX: number;
  pupilaY: number;
  sobrancelhaY: number;
  sobrancelhaEsquerda: number;
  sobrancelhaDireita: number;
  olhos: number;
  olhoEsquerdo: number;
  olhoDireito: number;
  palpebraFeliz: number;
  palpebraSemicerrada: number;
  palpebraEmpatica: number;
  bocaEscala: number;
  bocaFechada: number;
  bocaSurpresa: number;
  bocaPensativa: number;
  bocaGargalhada: number;
  bocaEncabulada: number;

  duvida: number;
  brilho: number;
  festa: number;
  direcao: number;
  suspense: number;
  medalha: number;
  atencao: number;
  letra: number;
  letraX: number;
  letraY: number;
  letraGiro: number;
};

export const POSE_NEUTRA: PoseCompleta = {
  corpoY: 0,
  corpoRotacao: 0,
  corpoEscalaY: 1,
  perspectivaX: 0,
  saltoY: 0,
  deslocamentoX: 0,
  inclinacao: 0,

  maoDireitaX: 0,
  maoDireitaY: 0,
  cotoveloDireitoDobra: 1,
  punho: 0,
  bracoDireitoFrente: 0,

  maoEsquerdaX: 0,
  maoEsquerdaY: 0,
  cotoveloEsquerdoDobra: -1,
  bracoEsquerdo: 0,
  bracoEsquerdoAtras: 0,

  peEsquerdoX: 0,
  peEsquerdoY: 0,
  joelhoEsquerdoDobra: -1,
  pernaEsquerda: 0,
  peDireitoX: 0,
  peDireitoY: 0,
  joelhoDireitoDobra: -1,
  pernaDireita: 0,

  gravata: 0,
  gravataEscala: 1,
  paginasY: 0,
  folheada: 0,

  pupilaX: 0,
  pupilaY: 0,
  sobrancelhaY: 0,
  sobrancelhaEsquerda: 0,
  sobrancelhaDireita: 0,
  olhos: 1,
  olhoEsquerdo: 1,
  olhoDireito: 1,
  palpebraFeliz: 0,
  palpebraSemicerrada: 0,
  palpebraEmpatica: 0,
  bocaEscala: 1,
  bocaFechada: 0,
  bocaSurpresa: 0,
  bocaPensativa: 0,
  bocaGargalhada: 0,
  bocaEncabulada: 0,

  duvida: 0,
  brilho: 0,
  festa: 0,
  direcao: 0,
  suspense: 0,
  medalha: 0,
  atencao: 0,
  letra: 0,
  letraX: 240,
  letraY: 210,
  letraGiro: -10,
};

export type QuadroRoteiro = readonly [
  fracao: number,
  mudancas: Partial<PoseCompleta>,
  curva?: TipoCurva,
];

export function escalaXPorVolume(escalaY: number): number {
  const segura = Number.isFinite(escalaY)
    ? Math.min(1.25, Math.max(0.75, escalaY))
    : 1;
  return 1 / Math.sqrt(segura);
}

const CAMPOS_LIMITADOS_0_1 = new Set<keyof PoseCompleta>([
  "folheada",
  "palpebraFeliz",
  "palpebraSemicerrada",
  "palpebraEmpatica",
  "bocaFechada",
  "bocaSurpresa",
  "bocaPensativa",
  "bocaGargalhada",
  "bocaEncabulada",
  "duvida",
  "brilho",
  "festa",
  "direcao",
  "suspense",
  "medalha",
  "atencao",
  "letra",
]);

export function interpolarRoteiro(
  quadros: readonly QuadroRoteiro[],
  fracaoTempo: number,
): PoseCompleta {
  const t = Number.isFinite(fracaoTempo)
    ? Math.max(0, Math.min(1, fracaoTempo))
    : 0;
  if (t <= 0 || t >= 1) return { ...POSE_NEUTRA };
  const indice = quadros.findIndex(([fracao]) => fracao > t);
  if (indice < 0) return { ...POSE_NEUTRA };
  const [inicio, antes] = quadros[Math.max(0, indice - 1)];
  const [fim, depois, curvaSegmento] = quadros[indice];
  const progressoLocal = (t - inicio) / (fim - inicio || 1);
  const curva = aplicarCurva(curvaSegmento ?? "suave", progressoLocal);
  const pose = { ...POSE_NEUTRA };
  for (const campo of Object.keys(POSE_NEUTRA) as (keyof PoseCompleta)[]) {
    const a = antes[campo] ?? POSE_NEUTRA[campo];
    const b = depois[campo] ?? POSE_NEUTRA[campo];
    const valor = a + (b - a) * curva;
    if (CAMPOS_LIMITADOS_0_1.has(campo)) {
      pose[campo] = Math.min(1, Math.max(0, valor));
    } else if (
      campo === "olhos" ||
      campo === "olhoEsquerdo" ||
      campo === "olhoDireito"
    ) {
      pose[campo] = Math.min(1, Math.max(0.05, valor));
    } else {
      pose[campo] = valor;
    }
  }
  return pose;
}

/** Calcula resposta inercial suave de gravata, páginas e sobrancelhas a partir da velocidade do corpo. */
export function aplicarFisicaSecundaria(
  pose: PoseCompleta,
  quadros: readonly QuadroRoteiro[],
  tempoMs: number,
  duracaoMs: number,
): PoseCompleta {
  const t = Number.isFinite(tempoMs)
    ? Math.max(0, Math.min(duracaoMs, tempoMs))
    : 0;
  if (t <= 0 || t >= duracaoMs || duracaoMs <= 0) return pose;

  const fracao = t / duracaoMs;
  const passoMs = 55;
  const fracaoAnterior = Math.max(0, (t - passoMs) / duracaoMs);
  const anterior = interpolarRoteiro(quadros, fracaoAnterior);

  const velY = pose.corpoY + pose.saltoY - (anterior.corpoY + anterior.saltoY);
  const velRot = pose.corpoRotacao - anterior.corpoRotacao;
  const envelope = Math.sin(Math.PI * fracao);

  return {
    ...pose,
    gravata: pose.gravata + (-velRot * 0.65 + velY * 0.14) * envelope,
    paginasY:
      pose.paginasY + Math.max(-4.5, Math.min(4.5, velY * 0.11)) * envelope,
    sobrancelhaY:
      pose.sobrancelhaY + Math.max(-3.5, Math.min(3.5, velY * 0.09)) * envelope,
  };
}

export function piscarEmInstantes(
  tempoMs: number,
  centros: readonly number[],
  meiaJanela = 85,
): number {
  let menor = 1;
  for (const centro of centros) {
    const distancia = Math.abs(tempoMs - centro);
    if (distancia < meiaJanela) {
      menor = Math.min(
        menor,
        0.06 + (0.94 * distancia) / Math.max(1, meiaJanela),
      );
    }
  }
  return menor;
}
