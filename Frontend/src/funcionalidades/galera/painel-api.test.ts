import { afterEach, expect, it, vi } from "vitest";
import * as api from "./painel-api";

function preparada() {
  return {
    partida_id: "jogo",
    estado: "preparada",
    versao: 0,
    configuracao: {
      dificuldade: "facil",
      quantidade_sessoes: 1,
      modo_tematicas: "manual",
      tematicas: ["objetos"],
    },
    participantes: [
      {
        participante_id: "p1",
        nome: "Ana",
        avatar_id: "coruja_sabia",
        anfitriao: true,
        pontuacao: 0,
      },
    ],
    ordem_primeira_sessao: ["p1"],
    painel: null,
    resumo_sessoes: [],
    tempo_total_ms: 0,
    resultado_galera: null,
    motivo_encerramento: null,
  };
}
afterEach(() => vi.unstubAllGlobals());
it("aceita preparação válida sem inventar painel", () =>
  expect(api.validarPainel(preparada()).painel).toBeNull());
it("confirma tempo em milissegundos inteiros", async () => {
  const buscar = vi.fn(
    async (_url: string, _opcoes: RequestInit) =>
      new Response(JSON.stringify(preparada()), { status: 200 }),
  );
  vi.stubGlobal("fetch", buscar);
  await api.confirmarTempoGalera(
    "/galera",
    "token",
    "sessao",
    1000.25,
    2500.75,
    false,
  );
  const chamada = buscar.mock.calls[0];
  expect(JSON.parse(String(chamada[1].body))).toEqual({
    sessao_id: "sessao",
    inicio_ms: 1000,
    fim_ms: 2501,
  });
});

it("recusa painel com posição sem grafia válida", () => {
  expect(() => api.validarPainel({ painel: { palavras: [["AA"]] } })).toThrow();
});
it("recusa estado sem versão, participantes e configuração", () => {
  expect(() => api.validarPainel({ painel: null })).toThrow();
});
