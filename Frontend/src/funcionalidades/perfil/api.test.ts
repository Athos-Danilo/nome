import { afterEach, expect, it, vi } from "vitest";
import { consultarAvatares, salvarPreferencias } from "./api";
import { lerPreferenciasLocais, PADRAO } from "./preferencias";

afterEach(() => vi.unstubAllGlobals());

it("aceita ilustrações de avatar servidas pelo frontend", async () => {
  const colecao = [
    {
      id: "capivara_zen",
      nome: "Capivara zen",
      recurso: "/avatares/capivara_zen.webp",
    },
  ];
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify(colecao))),
  );
  expect(await consultarAvatares()).toEqual(colecao);
});

it("rejeita endereço externo no recurso do avatar", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: "capivara_zen",
            nome: "Capivara zen",
            recurso: "https://outro.example/avatar.webp",
          },
        ]),
      ),
    ),
  );
  await expect(consultarAvatares()).rejects.toThrow();
});

it("não encaminha metadados da resposta ou campos extras ao salvar preferências", async () => {
  const buscar = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ ...PADRAO, salvas: true }), {
      status: 200,
    }),
  );
  vi.stubGlobal("fetch", buscar);
  const recebido = { ...PADRAO, salvas: true, jogador_id: "outro" };
  await salvarPreferencias(recebido, "token-de-teste");
  const [, opcoes] = buscar.mock.calls[0];
  expect(JSON.parse(opcoes.body)).toEqual({
    ...PADRAO,
    somente_se_ausentes: false,
  });
  expect(opcoes.headers["X-Decifra-CSRF"]).toBe("token-de-teste");
});

it("descarta campos extras no armazenamento local antes de vincular preferências", () => {
  const recebido = { ...PADRAO, salvas: true, jogador_id: "outro" };
  expect(
    lerPreferenciasLocais({ getItem: () => JSON.stringify(recebido) }),
  ).toEqual(PADRAO);
});

it("mantém o aviso de saída autenticado mesmo quando o documento é descarregado", async () => {
  const { requisitar } = await import("./api");
  const chamada = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", chamada);
  await requisitar(
    "/api/partidas/uma/sinais",
    "POST",
    { tipo: "pagehide" },
    "csrf",
    true,
  );
  expect(chamada.mock.calls[0][1].keepalive).toBe(true);
  expect(chamada.mock.calls[0][1].headers["X-Decifra-CSRF"]).toBe("csrf");
});
