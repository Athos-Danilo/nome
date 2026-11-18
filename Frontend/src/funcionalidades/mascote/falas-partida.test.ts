import { describe, expect, it } from "vitest";
import { direcaoOlharMontagem, falaGalera, falaSolo } from "./falas-partida";

describe("falas-partida", () => {
  it("adapta a fala do modo individual ao momento da partida mantendo textos curtos", () => {
    const inicio = falaSolo({ dicaAtual: 1, reacao: "apresentacao" });
    const epica = falaSolo({
      dicaAtual: 1,
      reacao: "comemoracao_epica",
      pontosUltimaAcao: 100,
    });
    const erro = falaSolo({ dicaAtual: 2, reacao: "erro", seed: 1 });
    const ultimaDica = falaSolo({ dicaAtual: 5, reacao: "tensao_decisiva" });
    const folhear = falaSolo({ dicaAtual: 3, reacao: "folhear_dica" });
    const toque = falaSolo({ dicaAtual: 2, toque: 1 });

    expect(`${inicio.titulo} ${inicio.subtitulo}`).toContain("ahá");
    expect(epica.titulo).not.toBe(inicio.titulo);
    expect(erro.titulo).not.toBe(epica.titulo);
    expect(ultimaDica.titulo).toMatch(/última/i);
    expect(folhear.titulo).toMatch(/página|pista/i);
    expect(toque.titulo).not.toBe(inicio.titulo);

    for (const fala of [inicio, epica, erro, ultimaDica, folhear, toque]) {
      expect(fala.titulo.length).toBeLessThanOrEqual(34);
      expect(fala.subtitulo.length).toBeLessThanOrEqual(38);
    }
  });

  it("varia de forma determinística pelo índice de semente e toque", () => {
    const a = falaSolo({ dicaAtual: 2, reacao: "erro", seed: 0 });
    const b = falaSolo({ dicaAtual: 2, reacao: "erro", seed: 1 });
    const c = falaSolo({ dicaAtual: 2, reacao: "erro", seed: 0 });

    expect(a).toEqual(c);
    expect(a.titulo).not.toBe(b.titulo);
  });

  it("gera falas curtas e contextuais para o modo galera", () => {
    const padrao = falaGalera({});
    const desempate = falaGalera({
      estadoSessao: "aguardando_desempate",
      reacao: "tensao_decisiva",
    });
    const troca = falaGalera({ reacao: "troca_amigavel" });
    const epica = falaGalera({
      reacao: "comemoracao_epica",
      participanteAtual: "Bia",
    });
    const vez = falaGalera({ reacao: "turno", participanteAtual: "Léo" });
    const toque = falaGalera({ toque: 2 });

    expect(padrao).toContain("palco");
    expect(desempate).toMatch(/decidir/i);
    expect(troca).toMatch(/bastão|palpite/i);
    expect(epica).toContain("Bia");
    expect(vez).toContain("Léo");
    expect(toque).not.toBe(padrao);

    for (const fala of [padrao, desempate, troca, epica, vez, toque]) {
      expect(fala.length).toBeLessThanOrEqual(68);
    }
  });

  it("calcula direção de olhar contínua ao acompanhar a montagem de letras", () => {
    const esquerda = direcaoOlharMontagem(0, 6);
    const centro = direcaoOlharMontagem(3, 6);
    const direita = direcaoOlharMontagem(5, 6);

    expect(esquerda.x).toBeLessThan(centro.x);
    expect(centro.x).toBeLessThan(direita.x);
    expect(esquerda.x).toBeGreaterThanOrEqual(-16);
    expect(direita.x).toBeLessThanOrEqual(16);
    expect(Math.abs(centro.y)).toBeLessThanOrEqual(12);
  });
});
