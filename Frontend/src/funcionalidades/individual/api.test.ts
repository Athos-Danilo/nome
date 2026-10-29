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
