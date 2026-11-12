import { expect, test, vi } from "vitest";
import {
  calcularInclinacao,
  criarControleInclinacao,
} from "./inclinacao-cartao";

const caixa = { left: 100, top: 50, width: 200, height: 400 };
test("inclinação usa o centro da área fixa e limita extremos a três graus", () => {
  expect(calcularInclinacao(200, 250, caixa)).toEqual({ x: 0, y: 0 });
  expect(calcularInclinacao(100, 50, caixa)).toEqual({ x: 3, y: -3 });
  expect(calcularInclinacao(999, 999, caixa)).toEqual({ x: -3, y: 3 });
});
test("medidas vazias e coordenadas inválidas não produzem transformações inválidas", () => {
  expect(calcularInclinacao(1, 2, { ...caixa, width: 0 })).toEqual({
    x: 0,
    y: 0,
  });
  expect(calcularInclinacao(NaN, Infinity, caixa)).toEqual({ x: 0, y: 0 });
});
function prepararControle() {
  const pendentes = new Map<number, () => void>();
  let sequencia = 0;
  let permitida = true;
  const aplicar = vi.fn();
  const cancelar = vi.fn((id: number) => {
    pendentes.delete(id);
  });
  const controle = criarControleInclinacao({
    permitir: () => permitida,
    lerCaixa: () => caixa,
    aplicar,
    agendar: (acao) => {
      pendentes.set(++sequencia, acao);
      return sequencia;
    },
    cancelar,
  });
  return {
    controle,
    pendentes,
    aplicar,
    cancelar,
    bloquear: () => {
      permitida = false;
    },
    executar: () => {
      const acao = pendentes.values().next().value;
      pendentes.clear();
      acao?.();
    },
  };
}
test("vários movimentos usam um quadro e apenas a posição mais recente", () => {
  const teste = prepararControle();
  teste.controle.mover(100, 50);
  teste.controle.mover(300, 450);
  expect(teste.pendentes.size).toBe(1);
  expect(teste.aplicar).not.toHaveBeenCalled();
  teste.executar();
  expect(teste.aplicar).toHaveBeenLastCalledWith({ x: -3, y: 3 });
});
test("cancelar remove o quadro pendente e restaura a posição sem enfileirar retorno", () => {
  const teste = prepararControle();
  teste.controle.mover(300, 450);
  teste.controle.limpar();
  expect(teste.cancelar).toHaveBeenCalledTimes(1);
  expect(teste.pendentes.size).toBe(0);
  expect(teste.aplicar).toHaveBeenLastCalledWith({ x: 0, y: 0 });
});
test("bloqueio entre movimento e quadro impede aplicar uma inclinação atrasada", () => {
  const teste = prepararControle();
  teste.controle.mover(100, 50);
  teste.bloquear();
  teste.executar();
  expect(teste.aplicar).toHaveBeenLastCalledWith({ x: 0, y: 0 });
});
