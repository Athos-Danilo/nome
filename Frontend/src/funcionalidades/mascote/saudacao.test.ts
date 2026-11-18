import { expect, test } from "vitest";
import { DURACAO_SAUDACAO, poseSaudacao } from "./saudacao";

test("saudação começa e termina na mesma pose do PNG aprovado", () => {
  expect(poseSaudacao(0)).toEqual(poseSaudacao(DURACAO_SAUDACAO));
  expect(poseSaudacao(-100)).toEqual(poseSaudacao(0));
  expect(poseSaudacao(100000)).toEqual(poseSaudacao(0));
});

test("saudação 2.0 usa antecipação elástica, aceno amplo com dois braços, piscadas e acomodação", () => {
  const antecipacao = poseSaudacao(360);
  const saltoAceno = poseSaudacao(1050);
  const aceno2 = poseSaudacao(2050);
  const acomodacao = poseSaudacao(3700);

  expect(antecipacao.corpoY).toBeGreaterThan(8);
  expect(antecipacao.corpoEscalaY).toBeLessThan(0.97);
  expect(saltoAceno.saltoY).toBeLessThan(-10);
  expect(saltoAceno.maoDireitaY).toBeLessThan(-80);
  expect(saltoAceno.maoEsquerdaX).toBeLessThan(-10);
  expect(aceno2.punho).not.toBe(saltoAceno.punho);
  expect(aceno2.pupilaX).not.toBe(0);
  expect(acomodacao.gravata).not.toBe(acomodacao.corpoRotacao);
  expect(poseSaudacao(520).olhos).toBeLessThan(0.2);
  expect(poseSaudacao(1700).olhos).toBe(1);
});
