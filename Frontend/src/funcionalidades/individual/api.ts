import { ErroDaApi, requisitar } from "../perfil/api";
export type Dificuldade = "facil" | "medio" | "dificil";
export type Configuracao = {
  quantidade_palavras: 3 | 5 | 7;
  tematica: string | null;
  dificuldades: Dificuldade[];
  distribuicao: "unica" | "personalizada" | "aleatoria";
  quantidades?: Partial<Record<Dificuldade, number>>;
  ordem: "sorteada" | "crescente" | "manual";
  sequencia?: Dificuldade[];
  permitir_outras_tematicas?: boolean;
  aceitar_reducao?: boolean;
};
export type Plano = {
  pode_iniciar: boolean;
  plano_id: string | null;
  disponiveis: number;
  quantidade_solicitada: number;
  sequencia_solicitada: Dificuldade[];
  distribuicao_disponivel: Partial<Record<Dificuldade, number>>;
  alternativas: string[];
  configuracao?: Configuracao & { sequencia_efetiva: Dificuldade[] };
};
export type Rodada = {
  rodada_id: string;
  ordem: number;
  dificuldade: Dificuldade;
  tematicas: string[];
  posicoes: (string | null)[];
  dica_atual: number;
  dicas_reveladas: string[];
  pontos_disponiveis: number;
  limites?: Record<string, number>;
};
export type ResumoRodada = {
  ordem: number;
  estado: "acertada" | "desistida";
  resposta: string;
  pontos: number;
  dicas_utilizadas: number;
};
export type Partida = {
  partida_id: string;
  estado: "preparada" | "em_andamento" | "pausada" | "concluida" | "abandonada";
  origem: "normal" | "demonstracao";
  versao: number;
  pontuacao: number;
  quantidade_palavras: number;
  rodadas_concluidas: number;
  acertos: number;
  rodada_atual: Rodada | null;
  resumo_rodadas: ResumoRodada[];
  acao?: {
    resultado: string;
    pontos: number;
    limpar_montagem: boolean;
    resposta_revelada?: string;
  };
};
export type Acao = {
  id_acao: string;
  versao_esperada: number;
  rodada_id?: string;
  palpite?: string;
};
export type TipoAcao =
  "palpites" | "dicas" | "desistencia-palavra" | "encerramento";

function objeto(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}
function inteiro(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v);
}
function dificuldade(v: unknown): v is Dificuldade {
  return ["facil", "medio", "dificil"].includes(String(v));
}
function rodadaValida(v: unknown): v is Rodada {
  return (
    objeto(v) &&
    typeof v.rodada_id === "string" &&
    inteiro(v.ordem) &&
    dificuldade(v.dificuldade) &&
    Array.isArray(v.tematicas) &&
    v.tematicas.every((x) => typeof x === "string") &&
    Array.isArray(v.posicoes) &&
    v.posicoes.length > 0 &&
    v.posicoes.every(
      (x) =>
        x === null ||
        (typeof x === "string" &&
          Array.from(x).length === 1 &&
          !/[\p{L}\p{N}]/u.test(x)),
    ) &&
    inteiro(v.dica_atual) &&
    v.dica_atual >= 1 &&
    v.dica_atual <= 5 &&
    Array.isArray(v.dicas_reveladas) &&
    v.dicas_reveladas.length === v.dica_atual &&
    v.dicas_reveladas.every((x) => typeof x === "string") &&
    inteiro(v.pontos_disponiveis) &&
    (v.limites === undefined ||
      (objeto(v.limites) &&
        Object.values(v.limites).every((x) => inteiro(x) && x > 0)))
  );
}
export function validarPartida(v: unknown): Partida {
  if (
    !objeto(v) ||
    typeof v.partida_id !== "string" ||
    ![
      "preparada",
      "em_andamento",
      "pausada",
      "concluida",
      "abandonada",
    ].includes(String(v.estado)) ||
    !["normal", "demonstracao"].includes(String(v.origem)) ||
    !inteiro(v.versao) ||
    !inteiro(v.pontuacao) ||
    !inteiro(v.quantidade_palavras) ||
    v.quantidade_palavras < 1 ||
    !inteiro(v.rodadas_concluidas) ||
    !inteiro(v.acertos) ||
    !(v.rodada_atual === null || rodadaValida(v.rodada_atual)) ||
    !Array.isArray(v.resumo_rodadas) ||
    !v.resumo_rodadas.every(
      (x) =>
        objeto(x) &&
        inteiro(x.ordem) &&
        ["acertada", "desistida"].includes(String(x.estado)) &&
        typeof x.resposta === "string" &&
        inteiro(x.pontos) &&
        inteiro(x.dicas_utilizadas),
    ) ||
    (v.acao !== undefined &&
      !(
        objeto(v.acao) &&
        typeof v.acao.resultado === "string" &&
        inteiro(v.acao.pontos) &&
        typeof v.acao.limpar_montagem === "boolean" &&
        (v.acao.resposta_revelada === undefined ||
          typeof v.acao.resposta_revelada === "string")
      ))
  )
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível conferir sua partida. Tente novamente.",
    );
  return v as Partida;
}
export async function lerPartida(caminho: string): Promise<Partida> {
  return validarPartida(await requisitar(caminho));
}
export async function prepararPartida(
  dados: Configuracao,
  token: string,
): Promise<Plano> {
  const v = await requisitar(
    "/api/partidas/individual/configuracao",
    "POST",
    dados,
    token,
  );
  if (
    !objeto(v) ||
    typeof v.pode_iniciar !== "boolean" ||
    !(v.plano_id === null || typeof v.plano_id === "string") ||
    !inteiro(v.disponiveis) ||
    !inteiro(v.quantidade_solicitada) ||
    !Array.isArray(v.alternativas) ||
    !v.alternativas.every((x) => typeof x === "string") ||
    !Array.isArray(v.sequencia_solicitada) ||
    !v.sequencia_solicitada.every(dificuldade) ||
    !objeto(v.distribuicao_disponivel) ||
    (v.pode_iniciar && typeof v.plano_id !== "string")
  )
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível conferir essa configuração.",
    );
  return v as Plano;
}
export async function iniciarPartida(
  planoId: string,
  token: string,
): Promise<Partida> {
  return validarPartida(
    await requisitar(
      "/api/partidas/individual",
      "POST",
      { plano_id: planoId },
      token,
    ),
  );
}
export async function ativarDemonstracao(token: string): Promise<Partida> {
  await requisitar("/api/demonstracoes", "POST", {}, token);
  return validarPartida(
    await requisitar("/api/demonstracoes/jogo", "POST", {}, token),
  );
}
export async function enviarAcao(
  base: string,
  tipo: TipoAcao,
  dados: Acao,
  token: string,
): Promise<Partida> {
  return validarPartida(
    await requisitar(`${base}/${tipo}`, "POST", dados, token),
  );
}
