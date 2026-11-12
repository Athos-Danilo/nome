export type Inclinacao = { x: number; y: number };
type CaixaCartao = Pick<DOMRect, "left" | "top" | "width" | "height">;
const NEUTRA: Inclinacao = { x: 0, y: 0 };
export function calcularInclinacao(
  clientX: number,
  clientY: number,
  caixa: CaixaCartao,
): Inclinacao {
  if (
    ![clientX, clientY, caixa.left, caixa.top, caixa.width, caixa.height].every(
      Number.isFinite,
    ) ||
    caixa.width <= 0 ||
    caixa.height <= 0
  )
    return { ...NEUTRA };
  const limitar = (valor: number) =>
    Math.round(Math.max(-3, Math.min(3, valor)) * 100) / 100;
  return {
    x: limitar((0.5 - (clientY - caixa.top) / caixa.height) * 6),
    y: limitar(((clientX - caixa.left) / caixa.width - 0.5) * 6),
  };
}
export function criarControleInclinacao(recursos: {
  permitir: () => boolean;
  lerCaixa: () => CaixaCartao;
  aplicar: (inclinacao: Inclinacao) => void;
  agendar: (acao: () => void) => number;
  cancelar: (id: number) => void;
}) {
  let quadro: number | null = null;
  let ultima: { x: number; y: number } | null = null;
  function limpar() {
    if (quadro !== null) recursos.cancelar(quadro);
    quadro = null;
    ultima = null;
    recursos.aplicar({ ...NEUTRA });
  }
  return {
    limpar,
    mover(x: number, y: number) {
      if (!recursos.permitir()) {
        limpar();
        return;
      }
      ultima = { x, y };
      if (quadro !== null) return;
      quadro = recursos.agendar(() => {
        quadro = null;
        if (!ultima || !recursos.permitir()) {
          limpar();
          return;
        }
        recursos.aplicar(
          calcularInclinacao(ultima.x, ultima.y, recursos.lerCaixa()),
        );
      });
    },
  };
}
