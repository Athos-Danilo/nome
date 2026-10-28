import { afterEach, expect, it, vi } from "vitest";
import { identificarVisitante, vincularDemonstracao } from "./api";

afterEach(() => vi.unstubAllGlobals());

it("recupera a identificação sem enviar identidade ou pontuação", async () => {
  const dados = {
    demonstracao_utilizada: false,
    pode_iniciar: true,
    vinculada: false,
    demonstracao: null,
    token_csrf: "token-visitante",
  };
  const buscar = vi.fn().mockResolvedValue(new Response(JSON.stringify(dados)));
  vi.stubGlobal("fetch", buscar);
  expect(await identificarVisitante()).toEqual(dados);
  const [caminho, opcoes] = buscar.mock.calls[0];
  expect(caminho).toBe("/api/visitantes");
  expect(opcoes.method).toBe("POST");
  expect(opcoes.credentials).toBe("same-origin");
  expect(JSON.parse(opcoes.body)).toEqual({});
});

it("vincula pela sessão sem aceitar partida ou pontos livres", async () => {
  const buscar = vi
    .fn()
    .mockResolvedValue(
      new Response(
        JSON.stringify({ partida_id: "partida-teste", vinculada: true }),
      ),
    );
  vi.stubGlobal("fetch", buscar);
  expect(await vincularDemonstracao("token-conta")).toEqual({
    partida_id: "partida-teste",
    vinculada: true,
  });
  const [, opcoes] = buscar.mock.calls[0];
  expect(opcoes.headers["X-Decifra-CSRF"]).toBe("token-conta");
  expect(JSON.parse(opcoes.body)).toEqual({});
});

it("recusa uma resposta incompleta antes de exibir a situação do visitante", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ pode_iniciar: true }))),
  );
  await expect(identificarVisitante()).rejects.toThrow();
});
