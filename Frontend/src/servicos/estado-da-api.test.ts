import { afterEach, expect, it, vi } from "vitest";
import { consultarEstadoDaApi } from "./estado-da-api";

afterEach(() => vi.unstubAllGlobals());

it("identifica quando a API está disponível", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ situacao: "disponivel" })),
      ),
  );
  await expect(consultarEstadoDaApi()).resolves.toBe("API disponível");
});

it("trata uma resposta HTTP de falha", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("", { status: 503 })),
  );
  await expect(consultarEstadoDaApi()).rejects.toThrow(
    "A API não respondeu corretamente.",
  );
});

it("recusa um corpo de resposta incompatível", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
  await expect(consultarEstadoDaApi()).rejects.toThrow("resposta inesperada");
});
