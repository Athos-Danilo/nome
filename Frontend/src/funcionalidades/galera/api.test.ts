import { expect, it } from "vitest";
import { validarGalera } from "./api";
function base() {
  return {
    partida_id: "partida",
    estado: "preparada",
    versao: 1,
    configuracao: {
      dificuldade: "facil",
      quantidade_sessoes: 2,
      modo_tematicas: "manual",
      tematicas: ["animais", "paises"],
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
  };
}
it("aceita preparação consistente", () =>
  expect(validarGalera(base()).partida_id).toBe("partida"));
it("recusa ordem duplicada", () => {
  const d = base();
  d.ordem_primeira_sessao = ["p1", "p1"];
  expect(() => validarGalera(d)).toThrow();
});
it("recusa preparação sem anfitrião", () => {
  const d = base();
  d.participantes[0].anfitriao = false;
  expect(() => validarGalera(d)).toThrow();
});
it("recusa quantidade de sessões fora dos limites", () => {
  const d = base();
  d.configuracao.quantidade_sessoes = 0;
  expect(() => validarGalera(d)).toThrow();
});
it("recusa pontuação negativa", () => {
  const d = base();
  d.participantes[0].pontuacao = -100;
  expect(() => validarGalera(d)).toThrow();
});

it("recusa sequência manual malformada", () => {
  const d = base();
  expect(() =>
    validarGalera({
      ...d,
      configuracao: { ...d.configuracao, tematicas: "paises" },
    }),
  ).toThrow();
});
