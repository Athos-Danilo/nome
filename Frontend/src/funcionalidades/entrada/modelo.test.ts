import { describe, expect, it } from "vitest";
import {
  criarEntrada,
  inserir,
  selecionar,
  mover,
  apagar,
  acentuar,
  bloqueada,
  familia,
  montarPalpite,
} from "./modelo";
function preencher(texto: string, limites: Record<string, number> = {}) {
  let estado = criarEntrada({
    posicoes: Array.from(texto, (c) => (/[\p{L}\p{N}]/u.test(c) ? null : c)),
    limites,
  });
  for (const c of texto)
    if (/[\p{L}\p{N}]/u.test(c)) estado = inserir(estado, c);
  return estado;
}
describe("montagem do palpite", () => {
  it("inicia vazia e não permite enviar antes de preencher", () => {
    const estado = criarEntrada({ posicoes: [null, null] });
    expect(estado.letras).toEqual(["", ""]);
    expect(montarPalpite(estado)).toBeNull();
  });
  it("normaliza minúsculas e Unicode decomposto sem remover acentos", () => {
    let estado = criarEntrada({ posicoes: [null, null] });
    estado = inserir(estado, "a\u0303");
    estado = inserir(estado, "ç");
    expect(montarPalpite(estado)).toBe("ÃÇ");
  });
  it("mantém sinais fixos, salta espaços e permite preencher números", () => {
    const estado = preencher("WALL-E 3");
    expect(montarPalpite(estado)).toBe("WALL-E 3");
    expect(inserir(selecionar(estado, 4), "X", 4).letras).toEqual(
      estado.letras,
    );
  });
  it("não considera um painel vazio como palpite completo", () => {
    expect(montarPalpite(criarEntrada({ posicoes: [] }))).toBeNull();
  });
  it("mantém letras ausentes disponíveis e limita apenas as presentes", () => {
    let estado = preencher("AAA", { A: 3, R: 2 });
    expect(bloqueada(estado, "A")).toBe(true);
    expect(bloqueada(estado, "W")).toBe(false);
    estado = apagar(selecionar(estado, 1));
    expect(bloqueada(estado, "A")).toBe(false);
  });
  it("recusa excesso sem alterar a montagem", () => {
    let estado = criarEntrada({
      posicoes: [null, null, null],
      limites: { A: 1 },
    });
    estado = inserir(estado, "A");
    const seguinte = inserir(estado, "Á");
    expect(seguinte.letras).toEqual(estado.letras);
    expect(seguinte.aviso).toMatch(/limite/i);
  });
  it("conta famílias de vogais, mas mantém C e Ç distintos", () => {
    expect(familia("Ã")).toBe("A");
    expect(familia("Ç")).toBe("Ç");
    const estado = preencher("MAÇA", { M: 1, A: 2, Ç: 1 });
    expect(bloqueada(estado, "A")).toBe(true);
    expect(bloqueada(estado, "C")).toBe(false);
    const acentuada = acentuar(selecionar(estado, 3), "til");
    expect(montarPalpite(acentuada)).toBe("MAÇÃ");
    expect(bloqueada(acentuada, "A")).toBe(true);
    expect(montarPalpite(acentuar(acentuada, "nenhum"))).toBe("MAÇA");
  });
  it("substitui uma posição sem consumir uma ocorrência extra", () => {
    const estado = preencher("AA", { A: 2 });
    expect(inserir(selecionar(estado, 0), "Á").letras).toEqual(["Á", "A"]);
    expect(inserir(selecionar(estado, 0), "W").letras).toEqual(["W", "A"]);
  });
  it("aplica somente acentos compatíveis e preserva a posição selecionada", () => {
    let estado = preencher("EC");
    estado = selecionar(estado, 0);
    expect(acentuar(estado, "grave").letras[0]).toBe("È");
    expect(acentuar(estado, "til").letras).toEqual(estado.letras);
    const consoante = selecionar(estado, 1);
    expect(acentuar(consoante, "agudo").letras).toEqual(consoante.letras);
    expect(acentuar(estado, "agudo").selecionada).toBe(0);
  });
  it("navega e apaga sem tocar separadores ou letras reveladas", () => {
    let estado = criarEntrada({
      modo: "galera",
      posicoes: ["C", null, "-", null],
    });
    expect(estado.selecionada).toBe(1);
    estado = inserir(estado, "A");
    expect(estado.selecionada).toBe(3);
    estado = mover(estado, -1);
    expect(estado.selecionada).toBe(1);
    estado = apagar(estado, true);
    expect(estado.letras).toEqual(["C", "", "-", ""]);
    expect(inserir(estado, "X", 0).letras[0]).toBe("C");
  });
  it("backspace a partir de um espaço vazio apaga a letra anterior", () => {
    let estado = criarEntrada({ posicoes: [null, " ", null] });
    estado = inserir(estado, "A");
    expect(apagar(estado, true).letras).toEqual(["", " ", ""]);
  });
  it("galera usa bloqueios compartilhados sem herdar o limite individual", () => {
    let estado = criarEntrada({
      modo: "galera",
      posicoes: [null, null],
      limites: { A: 1 },
      bloqueadas: ["Ç", "E"],
    });
    estado = inserir(inserir(estado, "A"), "A");
    expect(montarPalpite(estado)).toBe("AA");
    expect(bloqueada(estado, "É")).toBe(true);
    expect(bloqueada(estado, "C")).toBe(false);
    expect(inserir(estado, "ç", 0).letras).toEqual(estado.letras);
  });
  it("escolha de letra não monta um palpite nem revela soluções localmente", () => {
    const estado = criarEntrada({
      modo: "galera",
      acao: "letra",
      posicoes: [null, null],
    });
    expect(montarPalpite(estado)).toBeNull();
    expect(inserir(estado, "A").letras).toEqual(["", ""]);
  });
  it("não aceita controles, símbolos ou várias letras em uma única posição", () => {
    const estado = criarEntrada({ posicoes: [null] });
    for (const valor of ["AA", "!", "Dead", "", " "])
      expect(inserir(estado, valor).letras).toEqual([""]);
  });
});
