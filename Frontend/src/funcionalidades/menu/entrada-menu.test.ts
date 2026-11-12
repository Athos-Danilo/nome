import { expect, test, vi } from "vitest";
import { criarRegistroEntrada } from "./entrada-menu";

test("consultar não consome a entrada; confirmar é idempotente para efeitos repetidos", () => {
  const setItem = vi.fn();
  const registro = criarRegistroEntrada(() => ({
    getItem: () => null,
    setItem,
  }));
  expect(registro.consultar()).toBe("primeira");
  expect(registro.consultar()).toBe("primeira");
  expect(setItem).not.toHaveBeenCalled();
  registro.confirmar();
  registro.confirmar();
  expect(setItem).toHaveBeenCalledTimes(1);
  expect(setItem).toHaveBeenCalledWith("decifra_menu_apresentado", "1");
  expect(registro.consultar()).toBe("retorno");
});

test("recarregar preserva a escolha e uma sessão independente inicia novamente", () => {
  const valores = new Map<string, string>();
  const armazenamento = () => ({
    getItem: (chave: string) => valores.get(chave) ?? null,
    setItem: (chave: string, valor: string) => {
      valores.set(chave, valor);
    },
  });
  criarRegistroEntrada(armazenamento).confirmar();
  expect(criarRegistroEntrada(armazenamento).consultar()).toBe("retorno");
  expect(
    criarRegistroEntrada(() => ({
      getItem: () => null,
      setItem: () => {},
    })).consultar(),
  ).toBe("primeira");
});

test("falha ao acessar armazenamento preserva retorno na memória do documento", () => {
  const registro = criarRegistroEntrada(() => {
    throw new Error("Indisponível");
  });
  expect(registro.consultar()).toBe("primeira");
  expect(() => registro.confirmar()).not.toThrow();
  expect(registro.consultar()).toBe("retorno");
});

test("gravação recusada não transforma uma volta em nova apresentação", () => {
  const registro = criarRegistroEntrada(() => ({
    getItem: () => null,
    setItem: () => {
      throw new Error("Sem permissão");
    },
  }));
  registro.confirmar();
  expect(registro.consultar()).toBe("retorno");
});
