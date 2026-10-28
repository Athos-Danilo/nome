import { afterEach, expect, it, vi } from "vitest";
import { salvarPreferencias } from "./api";
import { lerPreferenciasLocais, PADRAO } from "./preferencias";

afterEach(() => vi.unstubAllGlobals());

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
