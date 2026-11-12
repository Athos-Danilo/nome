import { expect, test } from "vitest";
import {
  PALAVRAS_CENA_SOLO,
  criarCicloPalavras,
  avancarCicloPalavras,
} from "./palavras-cena-solo";

test("repertório tem dez palavras únicas, maiúsculas e de três letras, incluindo SOL e LUA", () => {
  expect(PALAVRAS_CENA_SOLO).toHaveLength(10);
  expect(new Set(PALAVRAS_CENA_SOLO).size).toBe(10);
  expect(PALAVRAS_CENA_SOLO).toContain("SOL");
  expect(PALAVRAS_CENA_SOLO).toContain("LUA");
  expect(
    PALAVRAS_CENA_SOLO.every(
      (palavra) =>
        Array.from(palavra).length === 3 &&
        palavra === palavra.toLocaleUpperCase("pt-BR"),
    ),
  ).toBe(true);
});
test("embaralhamento recebe sorteio e produz ordens diferentes sem perder conteúdo", () => {
  const primeira = criarCicloPalavras(() => 0).ordem,
    segunda = criarCicloPalavras(() => 0.999).ordem;
  expect(primeira).not.toEqual(segunda);
  expect([...primeira].sort()).toEqual([...PALAVRAS_CENA_SOLO].sort());
  expect([...segunda].sort()).toEqual([...PALAVRAS_CENA_SOLO].sort());
});
test("cinco pares exibem as dez palavras antes de iniciar outro embaralhamento", () => {
  let ciclo = criarCicloPalavras(() => 0.4);
  const vistas: string[] = [];
  for (let i = 0; i < 5; i++) {
    vistas.push(...ciclo.ordem.slice(ciclo.inicio, ciclo.inicio + 2));
    ciclo = avancarCicloPalavras(ciclo, () => 0.7);
  }
  expect(vistas).toHaveLength(10);
  expect(new Set(vistas).size).toBe(10);
  expect(ciclo.inicio).toBe(0);
  expect(ciclo.ordem[0]).not.toBe(vistas.at(-1));
});
test("nova ordem evita repetir a última palavra exibida na fronteira", () => {
  const ciclo = criarCicloPalavras(() => 0.999, "SOL");
  expect(ciclo.ordem[0]).not.toBe("SOL");
  expect(new Set(ciclo.ordem).size).toBe(10);
});
test("pares intermediários não sorteiam novamente nem alteram a ordem anterior", () => {
  const ciclo = criarCicloPalavras(() => 0.2);
  const sortear = () => {
    throw new Error("Sorteio só na renovação");
  };
  const seguinte = avancarCicloPalavras(ciclo, sortear);
  expect(seguinte.inicio).toBe(2);
  expect(seguinte.ordem).toBe(ciclo.ordem);
  expect(ciclo.inicio).toBe(0);
});
