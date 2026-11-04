import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import {
  ALFABETO,
  NUMEROS,
  acentuar,
  criarEntrada,
  familia,
  inserir,
  montarPalpite,
  mover,
  selecionar,
  type Acento,
} from "./modelo";

const manifesto: { respostas: { id: string; resposta: string }[] } = JSON.parse(
  readFileSync(
    new URL(
      "../../../../Data/manifestos/catalogo-primeira-entrega.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const ACENTOS: Record<string, Acento> = {
  "\u0301": "agudo",
  "\u0300": "grave",
  "\u0302": "circunflexo",
  "\u0303": "til",
  "\u0308": "trema",
};

test.each(["individual", "galera"] as const)(
  "as 500 respostas podem ser montadas no modo %s com o teclado aprovado",
  (modo) => {
    expect(manifesto.respostas).toHaveLength(500);
    for (const { id, resposta } of manifesto.respostas) {
      const letras = [...resposta].filter((c) => /[\p{L}0-9]/u.test(c));
      const limites: Record<string, number> = {};
      for (const letra of letras)
        limites[familia(letra)] = (limites[familia(letra)] ?? 0) + 1;
      let estado = criarEntrada({
        posicoes: [...resposta].map((c) => (/[\p{L}0-9]/u.test(c) ? null : c)),
        modo,
        limites,
      });
      for (const letra of letras) {
        const base = familia(letra);
        expect([...ALFABETO, ...NUMEROS], id).toContain(base);
        const posicao = estado.selecionada;
        estado = inserir(estado, base);
        if (letra !== base) {
          const acento = ACENTOS[letra.normalize("NFD").slice(1)];
          expect(acento, id).toBeDefined();
          estado = acentuar(selecionar(estado, posicao), acento);
          estado = mover(estado, 1);
        }
        expect(estado.aviso, id).toBe("");
      }
      expect(montarPalpite(estado), id).toBe(resposta);
    }
  },
);
