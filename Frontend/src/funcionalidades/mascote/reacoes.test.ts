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
test("individual reage ao estado confirmado sem transformar falha de rede em erro de palpite", () => {
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
      acao: { resultado: "dica" },
    }).tipo,
  ).toBe("apresentacao");
});
test("galera distingue pontos, troca de turno, sessão e atualização sem jogada", () => {
  const anterior = {
    versao: 1,
    sessao: 1,
    participante: "ana",
    pontos: 0,
    estado: "em_andamento",
  };
  expect(reacaoGalera(anterior, { ...anterior, versao: 2, pontos: 100 })).toBe(
    "comemoracao",
  );
  expect(
    reacaoGalera(anterior, { ...anterior, versao: 2, participante: "bia" }),
  ).toBe("turno");
  expect(reacaoGalera(anterior, { ...anterior, versao: 2, sessao: 2 })).toBe(
    "sorteio",
  );
  expect(reacaoGalera(anterior, anterior)).toBeNull();
});
