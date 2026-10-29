import { expect, it, vi, afterEach } from "vitest";
import { lerPartida, prepararPartida, enviarAcao } from "./api";
afterEach(() => vi.unstubAllGlobals());
it("recusa uma partida malformada em vez de mostrar placar inventado", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ pontuacao: 123 }))),
  );
  await expect(lerPartida("/api/partidas/uma")).rejects.toMatchObject({
    codigo: "RESPOSTA_INVALIDA",
  });
});
it("envia a configuração e o token sem calcular pontos no cliente", async () => {
  const resposta = {
    pode_iniciar: false,
    plano_id: null,
    disponiveis: 1,
    quantidade_solicitada: 3,
    sequencia_solicitada: ["facil", "facil", "facil"],
    distribuicao_disponivel: { facil: 1 },
    alternativas: ["reduzir", "cancelar"],
  };
  const chamada = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(resposta)));
  vi.stubGlobal("fetch", chamada);
  expect(
    await prepararPartida(
      {
        quantidade_palavras: 3,
        tematica: null,
        dificuldades: ["facil"],
        distribuicao: "unica",
        ordem: "sorteada",
      },
      "csrf",
    ),
  ).toEqual(resposta);
  expect(chamada.mock.calls[0][1].headers["X-Decifra-CSRF"]).toBe("csrf");
});
it("reenvia exatamente a mesma ação após falha de conexão", async () => {
  const chamada = vi.fn().mockRejectedValue(new Error("offline"));
  vi.stubGlobal("fetch", chamada);
  const acao = {
    id_acao: "id-fixo",
    versao_esperada: 2,
    rodada_id: "rodada",
    palpite: "JAPÃO",
  };
  await expect(
    enviarAcao("/api/partidas/uma", "palpites", acao, "csrf"),
  ).rejects.toBeDefined();
  await expect(
    enviarAcao("/api/partidas/uma", "palpites", acao, "csrf"),
  ).rejects.toBeDefined();
  expect(chamada.mock.calls[0][1].body).toBe(chamada.mock.calls[1][1].body);
});

function partidaComRascunho() {
  return {
    partida_id: "uma",
    estado: "em_andamento",
    origem: "normal",
    versao: 1,
    pontuacao: 0,
    quantidade_palavras: 3,
    rodadas_concluidas: 0,
    acertos: 0,
    quantidade_pausas: 0,
    resumo_rodadas: [],
    rodada_atual: {
      rodada_id: "rodada",
      ordem: 1,
      dificuldade: "facil",
      tematicas: ["animais"],
      posicoes: [null, null, null, null],
      dica_atual: 1,
      dicas_reveladas: ["Uma pista"],
      pontos_disponiveis: 100,
      rascunho: { letras: ["G", "A", "", ""], selecionada: 2, revisao: 1 },
    },
  };
}
it("recusa rascunho com comprimento incompatível com a máscara", async () => {
  const { validarPartida } = await import("./api");
  const p = partidaComRascunho();
  p.rodada_atual.rascunho.letras = ["G"];
  expect(() => validarPartida(p)).toThrow();
});
it("recusa rascunho com mais de um caractere por posição", async () => {
  const { validarPartida } = await import("./api");
  const p = partidaComRascunho();
  p.rodada_atual.rascunho.letras = ["GA", "A", "", ""];
  expect(() => validarPartida(p)).toThrow();
});
it("recusa quantidade negativa de pausas", async () => {
  const { validarPartida } = await import("./api");
  const p = partidaComRascunho();
  p.quantidade_pausas = -1;
  expect(() => validarPartida(p)).toThrow();
});
