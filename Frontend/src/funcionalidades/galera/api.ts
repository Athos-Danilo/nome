import { ErroDaApi, requisitar } from "../perfil/api";
import { TEMAS } from "../individual/apresentacao";
import type { Dificuldade } from "../individual/api";
export type Convidado = { nome: string; avatar_id: string };
export type ConfiguracaoGalera = {
  convidados: Convidado[];
  dificuldade: Dificuldade;
  quantidade_sessoes: number;
  modo_tematicas: "manual" | "aleatorio";
  tematicas?: string[];
};
export type Participante = {
  participante_id: string;
  nome: string;
  avatar_id: string;
  anfitriao: boolean;
  pontuacao: number;
};
export type PlanoGalera = {
  pode_criar: boolean;
  plano_id: string | null;
  quantidade_palavras: number;
  quantidade_sessoes: number;
  mensagem?: string;
  disponibilidade?: {
    sessao: number;
    tematica: string;
    disponiveis: number;
    necessarias: number;
  }[];
};
export type GaleraPreparada = {
  partida_id: string;
  estado: string;
  versao: number;
  configuracao: Omit<ConfiguracaoGalera, "convidados">;
  participantes: Participante[];
  ordem_primeira_sessao: string[];
};
function objeto(d: unknown): d is Record<string, unknown> {
  return !!d && typeof d === "object";
}
function invalida(): never {
  throw new ErroDaApi(
    "RESPOSTA_INVALIDA",
    "Não foi possível conferir a preparação da galera. Tente novamente.",
  );
}
export function validarGalera(d: unknown): GaleraPreparada {
  if (
    !objeto(d) ||
    typeof d.partida_id !== "string" ||
    !["preparada", "em_andamento", "concluida", "abandonada"].includes(
      String(d.estado),
    ) ||
    !Number.isInteger(d.versao) ||
    !objeto(d.configuracao) ||
    !["facil", "medio", "dificil"].includes(
      String(d.configuracao.dificuldade),
    ) ||
    typeof d.configuracao.quantidade_sessoes !== "number" ||
    !Number.isInteger(d.configuracao.quantidade_sessoes) ||
    d.configuracao.quantidade_sessoes < 1 ||
    d.configuracao.quantidade_sessoes > 5 ||
    !["manual", "aleatorio"].includes(String(d.configuracao.modo_tematicas)) ||
    !Array.isArray(d.participantes) ||
    d.participantes.length < 1 ||
    d.participantes.length > 3 ||
    !d.participantes.every(
      (p) =>
        objeto(p) &&
        typeof p.participante_id === "string" &&
        typeof p.nome === "string" &&
        typeof p.avatar_id === "string" &&
        /^[a-z_]+$/.test(p.avatar_id) &&
        typeof p.anfitriao === "boolean" &&
        typeof p.pontuacao === "number" &&
        Number.isInteger(p.pontuacao) &&
        p.pontuacao >= 0 &&
        p.pontuacao % 100 === 0,
    ) ||
    !Array.isArray(d.ordem_primeira_sessao)
  )
    return invalida();
  const temas = d.configuracao.tematicas;
  if (
    d.configuracao.modo_tematicas === "manual"
      ? !Array.isArray(temas) ||
        temas.length !== d.configuracao.quantidade_sessoes ||
        !temas.every((t) => typeof t === "string" && Object.hasOwn(TEMAS, t))
      : temas !== undefined && temas !== null
  )
    return invalida();
  if (d.participantes.filter((p) => p.anfitriao).length !== 1)
    return invalida();
  const ids = d.participantes.map((p) => String(p.participante_id));
  if (
    new Set(ids).size !== ids.length ||
    d.ordem_primeira_sessao.length !== ids.length ||
    new Set(d.ordem_primeira_sessao).size !== ids.length ||
    !d.ordem_primeira_sessao.every(
      (id) => typeof id === "string" && ids.includes(id),
    )
  )
    return invalida();
  return d as GaleraPreparada;
}
export async function conferirGalera(
  dados: ConfiguracaoGalera,
  token: string,
): Promise<PlanoGalera> {
  const d = await requisitar(
    "/api/partidas/galera/configuracao",
    "POST",
    dados,
    token,
  );
  if (
    !objeto(d) ||
    typeof d.pode_criar !== "boolean" ||
    !(typeof d.plano_id === "string" || d.plano_id === null) ||
    typeof d.quantidade_palavras !== "number" ||
    !Number.isInteger(d.quantidade_palavras) ||
    d.quantidade_palavras < 1 ||
    d.quantidade_palavras > 15 ||
    typeof d.quantidade_sessoes !== "number" ||
    !Number.isInteger(d.quantidade_sessoes) ||
    d.quantidade_sessoes < 1 ||
    d.quantidade_sessoes > 5 ||
    (d.mensagem !== undefined && typeof d.mensagem !== "string") ||
    (d.disponibilidade !== undefined &&
      (!Array.isArray(d.disponibilidade) ||
        !d.disponibilidade.every(
          (v) =>
            objeto(v) &&
            Number.isInteger(v.sessao) &&
            typeof v.tematica === "string" &&
            Number.isInteger(v.disponiveis) &&
            Number.isInteger(v.necessarias),
        ))) ||
    (d.pode_criar && typeof d.plano_id !== "string")
  )
    return invalida();
  return d as PlanoGalera;
}
export async function criarGalera(plano_id: string, token: string) {
  return validarGalera(
    await requisitar("/api/partidas/galera", "POST", { plano_id }, token),
  );
}
export async function consultarGalera(id: string) {
  return validarGalera(
    await requisitar(`/api/partidas/galera/${encodeURIComponent(id)}`),
  );
}
