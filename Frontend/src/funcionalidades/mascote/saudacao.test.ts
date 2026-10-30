import { expect, test } from "vitest";
import { DURACAO_SAUDACAO, poseSaudacao } from "./saudacao";

test("saudação começa e termina na mesma pose do PNG aprovado", () => {
  expect(poseSaudacao(0)).toEqual(poseSaudacao(DURACAO_SAUDACAO));
  expect(poseSaudacao(-100)).toEqual(poseSaudacao(0));
  expect(poseSaudacao(100000)).toEqual(poseSaudacao(0));
});
test("antecipação, aceno e acomodação têm ações diferentes e articulações independentes", () => {
  const antecipacao = poseSaudacao(350),
    aceno = poseSaudacao(1350),
    acomodacao = poseSaudacao(3900);
  expect(antecipacao.corpoY).toBeGreaterThan(0);
  expect(aceno.ombro).toBeLessThan(-5);
  expect(aceno.punho).not.toBe(aceno.cotovelo);
  expect(aceno.pupilaX).not.toBe(0);
  expect(acomodacao.gravata).not.toBe(acomodacao.corpoRotacao);
  expect(poseSaudacao(520).olhos).toBeLessThan(0.2);
  expect(poseSaudacao(1700).olhos).toBe(1);
});
