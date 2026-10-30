import { ErroDaApi, requisitar } from "../perfil/api";

export type Categoria = "pontos" | "palavras-acertadas" | "partidas-concluidas";
export type Modo = "" | "individual" | "galera";
export type Situacao =
  "" | "preparada" | "em_andamento" | "pausada" | "concluida" | "abandonada";
export type ItemHistorico = {
  partida_id: string;
  modo: Exclude<Modo, "">;
  origem: string;
  estado: Exclude<Situacao, "">;
  criado_em: string;
  encerrada_em: string | null;
  pontuacao: number;
  palavras: number;
  acertos: number;
  participantes: { nome: string; pontos: number }[];
  vencedores: string[];
  resultado_galera: string | null;
  motivo_encerramento: string | null;
};
type Paginado = { total: number; pagina: number; por_pagina: number };
export type Historico = Paginado & { itens: ItemHistorico[] };
export type Classificacao = Paginado & {
  categoria: Categoria;
  itens: { nome: string; valor: number; posicao: number }[];
};
export type Desempenho = {
  palavras_apresentadas: number;
  palavras_acertadas: number;
  palavras_desistidas: number;
  erros: number;
  pontos: number;
  media_dicas: number | null;
};
export type Resumo = {
  partidas_encerradas: number;
  partidas_concluidas: number;
  partidas_abandonadas: number;
  pontos: number;
  melhor_pontuacao: number | null;
  palavras_acertadas: number;
  palavras_desistidas: number;
  erros: number;
  media_dicas: number | null;
};
export type Estatisticas = {
  resumo: Resumo;
  em_aberto: ItemHistorico | null;
  por_tematica: Record<string, Desempenho>;
  por_dificuldade: Record<string, Desempenho>;
};

function objeto(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function inteiro(v: unknown): v is number {
  return typeof v === "number" && Number.isSafeInteger(v);
}
function contagem(v: unknown): v is number {
  return inteiro(v) && v >= 0;
}
function textoNulo(v: unknown): v is string | null {
  return v === null || typeof v === "string";
}
function media(v: unknown): v is number | null {
  return (
    v === null ||
    (typeof v === "number" && Number.isFinite(v) && v >= 1 && v <= 5)
  );
}
function paginado(v: Record<string, unknown>) {
  return (
    contagem(v.total) &&
    inteiro(v.pagina) &&
    v.pagina >= 1 &&
    v.por_pagina === 10
  );
}
function item(v: unknown): v is ItemHistorico {
  return (
    objeto(v) &&
    typeof v.partida_id === "string" &&
    ["individual", "galera"].includes(String(v.modo)) &&
    [
      "preparada",
      "em_andamento",
      "pausada",
      "concluida",
      "abandonada",
    ].includes(String(v.estado)) &&
    typeof v.origem === "string" &&
    typeof v.criado_em === "string" &&
    Number.isFinite(Date.parse(v.criado_em)) &&
    textoNulo(v.encerrada_em) &&
    inteiro(v.pontuacao) &&
    contagem(v.palavras) &&
    contagem(v.acertos) &&
    Array.isArray(v.participantes) &&
    v.participantes.every(
      (p) => objeto(p) && typeof p.nome === "string" && inteiro(p.pontos),
    ) &&
    Array.isArray(v.vencedores) &&
    v.vencedores.every((n) => typeof n === "string") &&
    textoNulo(v.resultado_galera) &&
    textoNulo(v.motivo_encerramento)
  );
}
function desempenho(v: unknown): v is Desempenho {
  return (
    objeto(v) &&
    contagem(v.palavras_apresentadas) &&
    contagem(v.palavras_acertadas) &&
    contagem(v.palavras_desistidas) &&
    contagem(v.erros) &&
    inteiro(v.pontos) &&
    media(v.media_dicas)
  );
}
function estatisticas(v: unknown): v is Estatisticas {
  if (!objeto(v) || !objeto(v.resumo)) return false;
  const r = v.resumo;
  return (
    contagem(r.partidas_encerradas) &&
    contagem(r.partidas_concluidas) &&
    contagem(r.partidas_abandonadas) &&
    inteiro(r.pontos) &&
    (r.melhor_pontuacao === null || inteiro(r.melhor_pontuacao)) &&
    contagem(r.palavras_acertadas) &&
    contagem(r.palavras_desistidas) &&
    contagem(r.erros) &&
    media(r.media_dicas) &&
    (v.em_aberto === null || item(v.em_aberto)) &&
    objeto(v.por_tematica) &&
    Object.values(v.por_tematica).every(desempenho) &&
    objeto(v.por_dificuldade) &&
    Object.values(v.por_dificuldade).every(desempenho)
  );
}
function validar<T>(dados: unknown, conferir: (v: unknown) => v is T): T {
  if (!conferir(dados))
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível conferir os resultados. Tente novamente.",
    );
  return dados;
}
export async function consultarHistorico(
  pagina: number,
  modo: Modo = "",
  estado: Situacao = "",
) {
  const parametros = new URLSearchParams({ pagina: String(pagina) });
  if (modo) parametros.set("modo", modo);
  if (estado) parametros.set("estado", estado);
  return validar(
    await requisitar(`/api/historico?${parametros}`),
    (v): v is Historico =>
      objeto(v) && paginado(v) && Array.isArray(v.itens) && v.itens.every(item),
  );
}
export async function consultarEstatisticas() {
  return validar(await requisitar("/api/estatisticas"), estatisticas);
}
export async function consultarRanking(categoria: Categoria, pagina: number) {
  return validar(
    await requisitar(`/api/rankings/${categoria}?pagina=${pagina}`),
    (v): v is Classificacao =>
      objeto(v) &&
      paginado(v) &&
      v.categoria === categoria &&
      Array.isArray(v.itens) &&
      v.itens.every(
        (r) =>
          objeto(r) &&
          typeof r.nome === "string" &&
          inteiro(r.valor) &&
          inteiro(r.posicao) &&
          r.posicao >= 1,
      ),
  );
}
