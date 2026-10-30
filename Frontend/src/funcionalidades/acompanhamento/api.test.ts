import { afterEach, expect, test, vi } from "vitest";
import {
  consultarHistorico,
  consultarEstatisticas,
  consultarRanking,
} from "./api";

afterEach(() => vi.unstubAllGlobals());
test("consulta paginada codifica filtros e rejeita resumo incompleto", async () => {
  const chamada = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        itens: [],
        total: 0,
        pagina: 2,
        por_pagina: 10,
      }),
    ),
  );
  vi.stubGlobal("fetch", chamada);
  expect((await consultarHistorico(2, "galera", "abandonada")).itens).toEqual(
    [],
  );
  expect(chamada.mock.calls[0][0]).toBe(
    "/api/historico?pagina=2&modo=galera&estado=abandonada",
  );
  await expect(consultarEstatisticas()).rejects.toThrow();
});
test("ranking preserva negativos e posições iguais e rejeita valor inválido", async () => {
  const dados = {
    categoria: "pontos",
    total: 2,
    pagina: 1,
    por_pagina: 10,
    itens: [
      { nome: "Um", posicao: 1, valor: -100 },
      { nome: "Dois", posicao: 1, valor: -100 },
    ],
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify(dados))),
  );
  expect((await consultarRanking("pontos", 1)).itens[0].valor).toBe(-100);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ...dados,
          itens: [{ nome: "Um", posicao: 0, valor: "100" }],
        }),
      ),
    ),
  );
  await expect(consultarRanking("pontos", 1)).rejects.toThrow();
});
