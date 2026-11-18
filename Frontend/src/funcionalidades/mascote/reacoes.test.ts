import { expect, test } from "vitest";
import {
  receberReacao,
  concluirReacao,
  iniciarReacoes,
  reacaoIndividual,
  reacaoGalera,
} from "./reacoes";

test("acerto tem prioridade, guarda a próxima apresentação e não repete evento", () => {
  let estado = receberReacao(iniciarReacoes(), {
    id: "acerto-1",
    tipo: "comemoracao",
  });
  estado = receberReacao(estado, { id: "dica-2", tipo: "apresentacao" });
  expect(estado.ativa?.tipo).toBe("comemoracao");
  expect(estado.pendente?.tipo).toBe("apresentacao");
  expect(receberReacao(estado, { id: "acerto-1", tipo: "comemoracao" })).toBe(
    estado,
  );
  estado = concluirReacao(estado, "acerto-1");
  expect(estado.ativa?.id).toBe("dica-2");
  expect(concluirReacao(estado, "acerto-1")).toBe(estado);
});

test("resultado interrompe ações menores e não guarda reações antigas", () => {
  let estado = receberReacao(iniciarReacoes(), { id: "erro", tipo: "erro" });
  estado = receberReacao(estado, { id: "fim", tipo: "resultado" });
  estado = receberReacao(estado, { id: "turno", tipo: "turno" });
  expect(estado.ativa?.tipo).toBe("resultado");
  expect(estado.pendente).toBeNull();
});

test("individual reage com folhear_dica, tensao_decisiva na 5ª dica e comemoracao_epica nos 100 pontos", () => {
  expect(
    reacaoIndividual({
      partida_id: "p",
      versao: 2,
      acao: { resultado: "erro" },
    }).tipo,
  ).toBe("erro");
  expect(
    reacaoIndividual({
      partida_id: "p",
      versao: 3,
      acao: { resultado: "dica_revelada" },
      rodada_atual: { dica_atual: 2 },
    }).tipo,
  ).toBe("folhear_dica");
  expect(
    reacaoIndividual({
      partida_id: "p",
      versao: 4,
      acao: { resultado: "dica_revelada" },
      rodada_atual: { dica_atual: 5 },
    }).tipo,
  ).toBe("tensao_decisiva");
  expect(
    reacaoIndividual({
      partida_id: "p",
      versao: 5,
      acao: { resultado: "acerto", pontos: 100 },
    }).tipo,
  ).toBe("comemoracao_epica");
  expect(
    reacaoIndividual({
      partida_id: "p",
      versao: 6,
      acao: { resultado: "acerto", pontos: 60 },
    }).tipo,
  ).toBe("comemoracao");
});

test("galera distingue acerto épico, pontos parciais com troca de turno, desempate e sessão", () => {
  const anterior = {
    versao: 1,
    sessao: 1,
    participante: "ana",
    pontos: 0,
    estado: "em_andamento",
    estadoSessao: "em_andamento",
  };
  expect(reacaoGalera(anterior, { ...anterior, versao: 2, pontos: 100 })).toBe(
    "comemoracao",
  );
  expect(reacaoGalera(anterior, { ...anterior, versao: 2, pontos: 400 })).toBe(
    "comemoracao_epica",
  );
  expect(
    reacaoGalera(anterior, {
      ...anterior,
      versao: 2,
      participante: "bia",
      pontos: 200,
    }),
  ).toBe("troca_amigavel");
  expect(
    reacaoGalera(anterior, { ...anterior, versao: 2, participante: "bia" }),
  ).toBe("turno");
  expect(
    reacaoGalera(anterior, {
      ...anterior,
      versao: 2,
      estadoSessao: "aguardando_desempate",
    }),
  ).toBe("tensao_decisiva");
  expect(reacaoGalera(anterior, { ...anterior, versao: 2, sessao: 2 })).toBe(
    "sorteio",
  );
  expect(reacaoGalera(anterior, anterior)).toBeNull();
});
