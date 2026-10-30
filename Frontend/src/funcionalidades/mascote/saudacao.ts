/** Uma atuação finita: atenção, antecipação, aceno e acomodação. Milissegundos. */
export const DURACAO_SAUDACAO = 5400;
export type PoseSaudacao = {
  corpoY: number;
  corpoRotacao: number;
  corpoEscalaY: number;
  ombro: number;
  cotovelo: number;
  punho: number;
  bracoEsquerdo: number;
  pernaEsquerda: number;
  pernaDireita: number;
  gravata: number;
  pupilaX: number;
  pupilaY: number;
  sobrancelhaY: number;
  bocaEscala: number;
  paginasY: number;
  olhos: number;
};
const neutra: PoseSaudacao = {
  corpoY: 0,
  corpoRotacao: 0,
  corpoEscalaY: 1,
  ombro: 0,
  cotovelo: 0,
  punho: 0,
  bracoEsquerdo: 0,
  pernaEsquerda: 0,
  pernaDireita: 0,
  gravata: 0,
  pupilaX: 0,
  pupilaY: 0,
  sobrancelhaY: 0,
  bocaEscala: 1,
  paginasY: 0,
  olhos: 1,
};
type Quadro = { tempo: number; pose: PoseSaudacao };
const quadro = (tempo: number, mudancas: Partial<PoseSaudacao>): Quadro => ({
  tempo,
  pose: { ...neutra, ...mudancas },
});
const quadros = [
  quadro(0, {}),
  quadro(350, {
    corpoY: 10,
    corpoRotacao: -1.3,
    corpoEscalaY: 0.99,
    ombro: 3,
    cotovelo: 3,
    punho: -4,
    bracoEsquerdo: 2,
    pernaEsquerda: -1,
    pernaDireita: 1.5,
    pupilaX: 9,
    pupilaY: -4,
    sobrancelhaY: -9,
    gravata: 2,
  }),
  quadro(750, {
    corpoY: -17,
    corpoRotacao: 1.6,
    corpoEscalaY: 1.012,
    ombro: -14,
    cotovelo: -9,
    punho: -12,
    bracoEsquerdo: -4,
    pernaEsquerda: 2,
    pernaDireita: -2,
    gravata: -5,
    pupilaX: 8,
    pupilaY: -5,
    sobrancelhaY: -13,
    bocaEscala: 1.04,
    paginasY: -3,
  }),
  quadro(1050, {
    corpoY: -13,
    corpoRotacao: 1,
    ombro: -18,
    cotovelo: -12,
    punho: 14,
    bracoEsquerdo: -2,
    pernaEsquerda: 1.5,
    pernaDireita: -1.5,
    gravata: -2,
    pupilaX: 6,
    pupilaY: -2,
    sobrancelhaY: -10,
    bocaEscala: 1.045,
    paginasY: -1,
  }),
  quadro(1350, {
    corpoY: -9,
    corpoRotacao: 0.4,
    ombro: -15,
    cotovelo: -8,
    punho: -16,
    bracoEsquerdo: -1,
    gravata: 4,
    pupilaX: 6,
    sobrancelhaY: -8,
    bocaEscala: 1.035,
  }),
  quadro(1700, {
    corpoY: -12,
    corpoRotacao: 1,
    ombro: -17,
    cotovelo: -11,
    punho: 12,
    bracoEsquerdo: -3,
    gravata: -3,
    pupilaX: 5,
    sobrancelhaY: -10,
    bocaEscala: 1.04,
  }),
  quadro(2070, {
    corpoY: -8,
    corpoRotacao: 0.4,
    ombro: -14,
    cotovelo: -7,
    punho: -11,
    bracoEsquerdo: -1,
    gravata: 3,
    pupilaX: 4,
    sobrancelhaY: -7,
    bocaEscala: 1.035,
  }),
  quadro(2500, {
    corpoY: -7,
    corpoRotacao: 0.6,
    ombro: -12,
    cotovelo: -6,
    punho: 8,
    bracoEsquerdo: -2,
    gravata: -2,
    pupilaX: 4,
    sobrancelhaY: -6,
    bocaEscala: 1.025,
  }),
  quadro(2950, {
    corpoY: -4,
    corpoRotacao: 0.2,
    ombro: -10,
    cotovelo: -5,
    punho: -5,
    gravata: 1,
    pupilaX: 2,
    sobrancelhaY: -4,
    bocaEscala: 1.015,
  }),
  quadro(3400, {
    corpoY: 3,
    corpoRotacao: -0.8,
    corpoEscalaY: 0.997,
    ombro: -4,
    cotovelo: -2,
    punho: 2,
    bracoEsquerdo: 1,
    gravata: 4,
    pupilaX: 1,
    paginasY: 2,
  }),
  quadro(3900, {
    corpoY: 1,
    corpoRotacao: 0.3,
    ombro: 1.5,
    cotovelo: 1,
    punho: -1,
    gravata: -2,
    paginasY: -1,
  }),
  quadro(4550, { gravata: 0.5 }),
  quadro(DURACAO_SAUDACAO, {}),
];
function piscar(tempo: number, centro: number) {
  const distancia = Math.abs(tempo - centro);
  return distancia >= 85 ? 1 : 0.06 + (0.94 * distancia) / 85;
}
export function poseSaudacao(tempo: number): PoseSaudacao {
  const t = Math.min(
    DURACAO_SAUDACAO,
    Math.max(0, Number.isFinite(tempo) ? tempo : 0),
  );
  const depois = quadros.findIndex((q) => q.tempo > t);
  if (depois < 0) return { ...neutra };
  const a = quadros[Math.max(0, depois - 1)],
    b = quadros[depois];
  const fracao = (t - a.tempo) / (b.tempo - a.tempo || 1);
  const curva = fracao * fracao * (3 - 2 * fracao);
  const misturar = (campo: keyof PoseSaudacao) =>
    a.pose[campo] + (b.pose[campo] - a.pose[campo]) * curva;
  return {
    corpoY: misturar("corpoY"),
    corpoRotacao: misturar("corpoRotacao"),
    corpoEscalaY: misturar("corpoEscalaY"),
    ombro: misturar("ombro"),
    cotovelo: misturar("cotovelo"),
    punho: misturar("punho"),
    bracoEsquerdo: misturar("bracoEsquerdo"),
    pernaEsquerda: misturar("pernaEsquerda"),
    pernaDireita: misturar("pernaDireita"),
    gravata: misturar("gravata"),
    pupilaX: misturar("pupilaX"),
    pupilaY: misturar("pupilaY"),
    sobrancelhaY: misturar("sobrancelhaY"),
    bocaEscala: misturar("bocaEscala"),
    paginasY: misturar("paginasY"),
    olhos: Math.min(piscar(t, 520), piscar(t, 3480)),
  };
}
