import { describe, expect, it } from "vitest";
import {
  contextoDaRota,
  descreverCarregamento,
  descreverProcessamento,
  estagioEspera,
} from "./carregamento";

describe("lógica de carregamento e espera do servidor", () => {
  it("classifica o estágio da espera pelo tempo decorrido", () => {
    expect(estagioEspera(-10)).toBe("inicial");
    expect(estagioEspera(0)).toBe("inicial");
    expect(estagioEspera(3499)).toBe("inicial");
    expect(estagioEspera(3500)).toBe("processando");
    expect(estagioEspera(10999)).toBe("processando");
    expect(estagioEspera(11000)).toBe("despertando");
  });

  it("mapeia rotas da aplicação para o contexto visual correspondente", () => {
    expect(contextoDaRota("/")).toBe("geral");
    expect(contextoDaRota("/jogar/individual/novo")).toBe("solo");
    expect(contextoDaRota("/jogar/individual/abc")).toBe("solo");
    expect(contextoDaRota("/jogar/demonstracao")).toBe("demonstracao");
    expect(contextoDaRota("/jogar/galera/novo")).toBe("galera");
    expect(contextoDaRota("/jogar/galera/xyz")).toBe("galera");
    expect(contextoDaRota("/rankings")).toBe("acompanhamento");
    expect(contextoDaRota("/perfil/historico")).toBe("acompanhamento");
    expect(contextoDaRota("/perfil/estatisticas")).toBe("acompanhamento");
  });

  it("descreve telas de carregamento com peças do jogo e aviso progressivo de servidor", () => {
    const geralInicial = descreverCarregamento("geral", 0);
    expect(geralInicial.pecas).toEqual(["D", "E", "C", "I", "F", "R", "A"]);
    expect(geralInicial.titulo).toContain("descobertas");
    expect(geralInicial.estagio).toBe("inicial");

    const soloLento = descreverCarregamento("solo", 4000);
    expect(soloLento.pecas).toEqual(["P", "I", "S", "T", "A"]);
    expect(soloLento.estagio).toBe("processando");
    expect(soloLento.subtitulo).not.toBe(
      descreverCarregamento("solo", 0).subtitulo,
    );

    const galeraDespertando = descreverCarregamento("galera", 12000);
    expect(galeraDespertando.pecas).toEqual(["G", "A", "L", "E", "R", "A"]);
    expect(galeraDespertando.estagio).toBe("despertando");
    expect(galeraDespertando.subtitulo).toMatch(/servidor gratuito/i);
  });

  it("descreve ações em jogo no Solo e na Galera preservando letra, participante e demora", () => {
    const letra = descreverProcessamento(
      { acao: "letra", modo: "galera", letra: "ç", participante: "Ana" },
      0,
    );
    expect(letra.etiqueta).toBe("COM A GALERA");
    expect(letra.pecaDestaque).toBe("Ç");
    expect(letra.titulo).toBe("Procurando a letra Ç no painel…");
    expect(letra.detalhe).toContain("Ana");

    const palpiteSolo = descreverProcessamento(
      { acao: "palpite", modo: "solo" },
      0,
    );
    expect(palpiteSolo.etiqueta).toBe("MODO SOLO");
    expect(palpiteSolo.titulo).toBe("Conferindo seu palpite…");
    expect(palpiteSolo.pecaDestaque).toBeUndefined();

    const palpiteGalera = descreverProcessamento(
      { acao: "palpite", modo: "galera", participante: "Beto" },
      4500,
    );
    expect(palpiteGalera.titulo).toBe("Conferindo o palpite de Beto…");
    expect(palpiteGalera.estagio).toBe("processando");
    expect(palpiteGalera.detalhe).toMatch(/devagar/i);

    const dicaDespertando = descreverProcessamento(
      { acao: "dica", modo: "demonstracao" },
      11500,
    );
    expect(dicaDespertando.etiqueta).toBe("DEMONSTRAÇÃO");
    expect(dicaDespertando.estagio).toBe("despertando");
    expect(dicaDespertando.detalhe).toMatch(/servidor gratuito/i);
  });
});
