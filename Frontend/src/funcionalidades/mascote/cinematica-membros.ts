export type MembroArticulado =
  "braco_esquerdo" | "braco_direito" | "perna_esquerda" | "perna_direita";

export type Ponto = { x: number; y: number };

export type ResultadoMembro = {
  ancora: Ponto;
  ponta: Ponto;
  junta: Ponto;
  c1: Ponto;
  c2: Ponto;
  anguloPonta: number;
};

export const ANCORAS_MEMBROS: Record<MembroArticulado, Ponto> = {
  braco_esquerdo: { x: 215, y: 642 },
  braco_direito: { x: 848, y: 642 },
  perna_esquerda: { x: 442, y: 916 },
  perna_direita: { x: 614, y: 892 },
};

export const ANCORA_BRACO_ESQUERDO_ATRAS: Ponto = { x: 172, y: 642 };

export const PONTAS_NEUTRAS: Record<MembroArticulado, Ponto> = {
  braco_esquerdo: { x: 132, y: 828 },
  braco_direito: { x: 958, y: 588 },
  perna_esquerda: { x: 332, y: 1118 },
  perna_direita: { x: 595, y: 1094 },
};

/** Alcance máximo cartoon (em px no canvas 1158×1359) preservando o membro ligado ao livro. */
export const COMPRIMENTOS_MEMBROS: Record<MembroArticulado, number> = {
  braco_esquerdo: 285,
  braco_direito: 275,
  perna_esquerda: 256,
  perna_direita: 236,
};

const CURVATURA_BASE: Record<
  MembroArticulado,
  { lado: 1 | -1; alturaMinima: number; rigidez: number }
> = {
  braco_esquerdo: { lado: 1, alturaMinima: 82, rigidez: 0.42 },
  braco_direito: { lado: 1, alturaMinima: 19, rigidez: 0.34 },
  perna_esquerda: { lado: -1, alturaMinima: 2, rigidez: 0.42 },
  perna_direita: { lado: -1, alturaMinima: 16, rigidez: 0.44 },
};

const numeroFinito = (valor: number | undefined, padrao = 0) =>
  typeof valor === "number" && Number.isFinite(valor) ? valor : padrao;

export function transformarPontoCorpo(
  ponto: Ponto,
  corpo: {
    y: number;
    rotacao: number;
    escalaX: number;
    escalaY: number;
    inclinacaoX?: number;
  },
): Ponto {
  const px = 554;
  const py = 940;
  const ex = numeroFinito(corpo.escalaX, 1);
  const ey = numeroFinito(corpo.escalaY, 1);
  const skew = numeroFinito(corpo.inclinacaoX, 0);
  const rad = (numeroFinito(corpo.rotacao, 0) * Math.PI) / 180;
  const cy = numeroFinito(corpo.y, 0);

  const dx = (ponto.x - px) * ex;
  const dy = (ponto.y - py) * ey;
  const sx = dx + Math.tan((skew * Math.PI) / 180) * dy;
  const rx = sx * Math.cos(rad) - dy * Math.sin(rad);
  const ry = sx * Math.sin(rad) + dy * Math.cos(rad);
  return { x: px + rx, y: py + ry + cy };
}

export function resolverMembro(
  membro: MembroArticulado,
  deslocamento: Ponto,
  direcaoDobra?: number,
  ancoraPersonalizada?: Ponto,
  contornoLateral = false,
): ResultadoMembro {
  const ancora = ancoraPersonalizada ?? ANCORAS_MEMBROS[membro];
  const neutro = PONTAS_NEUTRAS[membro];
  const alvoBruto = {
    x: neutro.x + numeroFinito(deslocamento.x),
    y: neutro.y + numeroFinito(deslocamento.y),
  };

  const alcance = COMPRIMENTOS_MEMBROS[membro];
  let vx = alvoBruto.x - ancora.x;
  let vy = alvoBruto.y - ancora.y;
  let distancia = Math.hypot(vx, vy);

  if (distancia < 1e-3) {
    vx = 0;
    vy = 1;
    distancia = 1;
  }

  const distanciaLimitada = Math.min(distancia, alcance * 0.992);
  const fator = distanciaLimitada / distancia;
  const ponta = {
    x: ancora.x + vx * fator,
    y: ancora.y + vy * fator,
  };

  // Quando o braço direito cruza para a frente da capa, sai pela direita do livro e contorna a borda em 2.5D.
  if (contornoLateral && membro === "braco_direito") {
    const saidaX = ancora.x + 115;
    const saidaY = ancora.y + 12;
    const c1 = { x: saidaX, y: saidaY };
    const c2 = {
      x: Math.max(ponta.x + 65, ancora.x + 15),
      y: Math.max(ponta.y + 55, ancora.y + 75),
    };
    const junta = {
      x: 0.125 * ancora.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * ponta.x,
      y: 0.125 * ancora.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * ponta.y,
    };
    const anguloPonta =
      (Math.atan2(ponta.y - c2.y, ponta.x - c2.x) * 180) / Math.PI;
    return { ancora, ponta, junta, c1, c2, anguloPonta };
  }

  const dx = ponta.x - ancora.x;
  const dy = ponta.y - ancora.y;
  const d = Math.max(1, Math.hypot(dx, dy));

  const base = CURVATURA_BASE[membro];
  const sinal =
    direcaoDobra !== undefined && Number.isFinite(direcaoDobra)
      ? direcaoDobra
      : base.lado;

  const distNeutra = Math.hypot(neutro.x - ancora.x, neutro.y - ancora.y);
  const diferenca = Math.max(0, distNeutra - d);
  const raioNeutro = Math.sqrt(
    Math.max(0, (alcance / 2) ** 2 - (distNeutra / 2) ** 2),
  );
  const raioDobra = Math.sqrt(Math.max(0, (alcance / 2) ** 2 - (d / 2) ** 2));
  const flexaoExtra = Math.max(0, raioDobra - raioNeutro);
  const sinalMudou =
    direcaoDobra !== undefined &&
    Number.isFinite(direcaoDobra) &&
    direcaoDobra * base.lado < 0;
  const alturaIK = Math.min(
    base.alturaMinima * (sinalMudou ? 1.15 : d / Math.max(1, distNeutra)) +
      flexaoExtra * base.rigidez +
      diferenca * 0.35,
    alcance * 0.45,
  );

  const nx = -dy / d;
  const ny = dx / d;
  const meioX = (ancora.x + ponta.x) / 2;
  const meioY = (ancora.y + ponta.y) / 2;

  const junta = {
    x: meioX + nx * sinal * alturaIK,
    y: meioY + ny * sinal * alturaIK,
  };

  const qx = 2 * junta.x - 0.5 * (ancora.x + ponta.x);
  const qy = 2 * junta.y - 0.5 * (ancora.y + ponta.y);
  const c1 = {
    x: ancora.x + (2 / 3) * (qx - ancora.x),
    y: ancora.y + (2 / 3) * (qy - ancora.y),
  };
  const c2 = {
    x: ponta.x + (2 / 3) * (qx - ponta.x),
    y: ponta.y + (2 / 3) * (qy - ponta.y),
  };

  const anguloPonta =
    (Math.atan2(ponta.y - c2.y, ponta.x - c2.x) * 180) / Math.PI;

  return { ancora, ponta, junta, c1, c2, anguloPonta };
}

export function dividirCurvaCubica(
  curva: Pick<ResultadoMembro, "ancora" | "c1" | "c2" | "ponta">,
  t: number,
): [
  Pick<ResultadoMembro, "ancora" | "c1" | "c2" | "ponta">,
  Pick<ResultadoMembro, "ancora" | "c1" | "c2" | "ponta">,
] {
  const u = Math.min(0.95, Math.max(0.05, numeroFinito(t, 0.5)));
  const lerpar = (a: Ponto, b: Ponto): Ponto => ({
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
  });
  const m01 = lerpar(curva.ancora, curva.c1);
  const m12 = lerpar(curva.c1, curva.c2);
  const m23 = lerpar(curva.c2, curva.ponta);
  const q01 = lerpar(m01, m12);
  const q12 = lerpar(m12, m23);
  const divisao = lerpar(q01, q12);
  return [
    { ancora: curva.ancora, c1: m01, c2: q01, ponta: divisao },
    { ancora: divisao, c1: q12, c2: m23, ponta: curva.ponta },
  ];
}

const f = (n: number) => n.toFixed(1);

export function calcularCaminhoMembro(
  curva: Pick<ResultadoMembro, "ancora" | "c1" | "c2" | "ponta">,
  deslocamento = { x: 0, y: 0 },
): string {
  return `M${f(curva.ancora.x + deslocamento.x)} ${f(curva.ancora.y + deslocamento.y)}C${f(curva.c1.x + deslocamento.x)} ${f(curva.c1.y + deslocamento.y)} ${f(curva.c2.x + deslocamento.x)} ${f(curva.c2.y + deslocamento.y)} ${f(curva.ponta.x + deslocamento.x)} ${f(curva.ponta.y + deslocamento.y)}`;
}
