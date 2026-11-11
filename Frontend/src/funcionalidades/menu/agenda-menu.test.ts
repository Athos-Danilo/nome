import { afterEach, expect, test, vi } from "vitest";
import { AgendaMenu } from "./agenda-menu";
import { escolherSemRepetir, decidirPrioridade } from "./politica-agenda";

const criar = (opcoes = {}) =>
  new AgendaMenu(
    {
      agora: () => performance.now(),
      agendar: (acao, atraso) => {
        const id = setTimeout(acao, atraso);
        return () => clearTimeout(id);
      },
      sortear: () => 0,
    },
    opcoes,
  );
afterEach(() => vi.useRealTimers());

test("seleção respeita candidatos atuais e evita repetição imediata", () => {
  expect(escolherSemRepetir(["a", "b"], "a", () => 0)).toBe("b");
  expect(escolherSemRepetir(["a"], "a", () => 0)).toBe("a");
  expect(escolherSemRepetir([], "a", () => 0)).toBeNull();
});

test("entrada protegida só guarda uma interação; ambiente não interrompe", () => {
  expect(decidirPrioridade("entrada", "surpresa")).toBe("ignorar");
  expect(decidirPrioridade("entrada", "interacao")).toBe("aguardar");
  expect(decidirPrioridade("interacao", "interacao")).toBe("ignorar");
  expect(decidirPrioridade("surpresa", "interacao")).toBe("iniciar");
  expect(decidirPrioridade("fala", "surpresa")).toBe("ignorar");
});

test("pausa congela tempo restante e retorno não acumula oportunidades", () => {
  vi.useFakeTimers();
  const agenda = criar();
  agenda.iniciar();
  agenda.solicitar({ id: "entrada", tipo: "entrada", duracao: 1000 });
  vi.advanceTimersByTime(400);
  agenda.condicoes({ oculta: true });
  expect(vi.getTimerCount()).toBe(0);
  vi.advanceTimersByTime(60000);
  agenda.condicoes({ oculta: false });
  vi.advanceTimersByTime(599);
  expect(agenda.estado().ativa?.id).toBe("entrada");
  vi.advanceTimersByTime(1);
  expect(agenda.estado().ativa).toBeNull();
  agenda.parar();
});

test("agenda não produz fila de cliques nem aceita IDs repetidos", () => {
  vi.useFakeTimers();
  const agenda = criar();
  agenda.iniciar();
  agenda.solicitar({ id: "entrada", tipo: "entrada", duracao: 1000 });
  expect(
    agenda.solicitar({ id: "clique", tipo: "interacao", duracao: 500 }),
  ).toBe(true);
  expect(
    agenda.solicitar({ id: "clique", tipo: "interacao", duracao: 500 }),
  ).toBe(false);
  expect(
    agenda.solicitar({ id: "outro", tipo: "interacao", duracao: 500 }),
  ).toBe(false);
  vi.advanceTimersByTime(1000);
  expect(agenda.estado().ativa?.id).toBe("clique");
  vi.advanceTimersByTime(500);
  expect(agenda.estado().ativa).toBeNull();
  agenda.parar();
});

test("oportunidades automáticas variam sem repetir e só uma domina por vez", () => {
  vi.useFakeTimers();
  const agenda = criar({ falas: ["a", "b"], surpresas: ["olhar"] });
  agenda.iniciar();
  vi.advanceTimersByTime(10000);
  expect(agenda.estado().ativa?.conteudo).toBe("a");
  vi.advanceTimersByTime(10000);
  expect(agenda.estado().ativa?.conteudo).toBe("b");
  agenda.parar();
  expect(vi.getTimerCount()).toBe(0);
});

test("evento protegido descarta oportunidades vencidas, sem rajada ao terminar", () => {
  vi.useFakeTimers();
  const agenda = criar({ falas: ["a"], surpresas: ["olhar"] });
  agenda.iniciar();
  agenda.solicitar({ id: "manual", tipo: "interacao", duracao: 30000 });
  vi.advanceTimersByTime(30000);
  expect(agenda.estado().ativa).toBeNull();
  vi.advanceTimersByTime(9999);
  expect(agenda.estado().ativa).toBeNull();
  vi.advanceTimersByTime(1);
  expect(agenda.estado().ativa?.tipo).toBe("fala");
  agenda.parar();
});

test("redução e bloqueios impedem eventos e removem ambiente pendente", () => {
  vi.useFakeTimers();
  const agenda = criar({ falas: ["a"] });
  agenda.iniciar();
  vi.advanceTimersByTime(10000);
  agenda.condicoes({ reduzida: true });
  expect(agenda.estado().ativa).toBeNull();
  expect(agenda.estado().pausada).toBe(true);
  expect(
    agenda.solicitar({ id: "surpresa", tipo: "surpresa", duracao: 1000 }),
  ).toBe(false);
  vi.advanceTimersByTime(60000);
  agenda.condicoes({ reduzida: false, bloqueada: true });
  expect(vi.getTimerCount()).toBe(0);
  agenda.condicoes({ bloqueada: false });
  expect(agenda.estado().ativa).toBeNull();
  agenda.parar();
});

test("iniciar duas vezes, parar e remontar mantém um único relógio", () => {
  vi.useFakeTimers();
  const agenda = criar({ falas: ["a"] });
  const observar = vi.fn();
  const remover = agenda.observar(observar);
  agenda.iniciar();
  agenda.iniciar();
  expect(vi.getTimerCount()).toBe(1);
  agenda.parar();
  expect(vi.getTimerCount()).toBe(0);
  agenda.iniciar();
  expect(vi.getTimerCount()).toBe(1);
  remover();
  vi.advanceTimersByTime(10000);
  expect(observar).not.toHaveBeenCalled();
  agenda.parar();
});

test("candidatos de outro contexto não sobrevivem à reconfiguração", () => {
  vi.useFakeTimers();
  const agenda = criar({ falas: ["galera"] });
  agenda.iniciar();
  agenda.configurar({ falas: ["demonstracao"] });
  vi.advanceTimersByTime(10000);
  expect(agenda.estado().ativa?.conteudo).toBe("demonstracao");
  agenda.parar();
});

test("ausência longa mantém a próxima oportunidade no saldo ativo, sem rajada", () => {
  vi.useFakeTimers();
  const agenda = criar({ falas: ["a", "b"], surpresas: ["olhar"] });
  agenda.iniciar();
  vi.advanceTimersByTime(4000);
  agenda.condicoes({ oculta: true });
  vi.advanceTimersByTime(120000);
  expect(vi.getTimerCount()).toBe(0);
  agenda.condicoes({ oculta: false });
  expect(agenda.estado().ativa).toBeNull();
  vi.advanceTimersByTime(5999);
  expect(agenda.estado().ativa).toBeNull();
  vi.advanceTimersByTime(1);
  expect(agenda.estado().ativa?.tipo).toBe("fala");
  expect(agenda.estado().ativa?.conteudo).toBe("a");
  expect(vi.getTimerCount()).toBe(1);
  agenda.parar();
});
