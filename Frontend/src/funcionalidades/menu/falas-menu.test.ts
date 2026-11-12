import { expect, test } from "vitest";
import { contextoDasFalas, repertorioDasFalas } from "./falas-menu";

test("contexto só promete demonstração ou continuidade após consulta bem-sucedida", () => {
  expect(contextoDasFalas(false, undefined, false)).toBe("geral");
  expect(contextoDasFalas(false, false, false)).toBe("visitante");
  expect(contextoDasFalas(false, true, false)).toBe("demonstracao-usada");
  expect(contextoDasFalas(true, true, true)).toBe("continuidade");
  expect(contextoDasFalas(true, false, false)).toBe("conta");
});

test("cada contexto tem início válido e alternativas únicas sem repetir a fala inicial", () => {
  for (const contexto of [
    "geral",
    "visitante",
    "demonstracao-usada",
    "conta",
    "continuidade",
  ] as const) {
    const repertorio = repertorioDasFalas(contexto);
    expect(repertorio.alternativas.length).toBeGreaterThanOrEqual(5);
    expect(
      repertorio.alternativas.some((fala) => fala.id === repertorio.inicial.id),
    ).toBe(false);
    const falas = [repertorio.inicial, ...repertorio.alternativas];
    expect(new Set(falas.map((fala) => fala.id)).size).toBe(falas.length);
    for (const fala of falas) {
      expect(fala.texto.length).toBeLessThanOrEqual(24);
      expect(fala.destaque.length).toBeLessThanOrEqual(24);
    }
  }
});

test("repertórios não vazam chamadas exclusivas de outros estados", () => {
  const ids = (contexto: Parameters<typeof repertorioDasFalas>[0]) => {
    const r = repertorioDasFalas(contexto);
    return [r.inicial, ...r.alternativas].map((fala) => fala.id);
  };
  expect(
    ids("demonstracao-usada").some((id) => id.startsWith("visitante-")),
  ).toBe(false);
  expect(
    ids("visitante").some(
      (id) => id.startsWith("conta-") || id.startsWith("continuidade-"),
    ),
  ).toBe(false);
  expect(ids("geral").every((id) => id.startsWith("geral-"))).toBe(true);
});
