import { ErroDaApi, requisitar } from "../perfil/api";
import { validarGalera, type GaleraPreparada } from "./api";
export type Painel = {
  estado: "em_andamento" | "aguardando_desempate" | "concluida";
  sessao: number;
  sessao_id: string;
  tematica: string;
  ordem: string[];
  participante_atual: string | null;
  palavras: (string | null)[][];
  bloqueadas: string[];
  lideres: string[];
  concordantes: string[];
  extra: boolean;
  tempo_ativo_ms: number;
};
export type JogoGalera = GaleraPreparada & {
  painel: Painel | null;
  tempo_total_ms: number;
  relogio_servidor_ms?: number;
  resumo_sessoes: {
    numero: number;
    tematica: string;
    estado: string;
    desempate: boolean;
    tempo_ativo_ms: number;
  }[];
  resultado_galera: "empate" | "vencedor" | null;
  motivo_encerramento: string | null;
};
function objeto(d: unknown): d is Record<string, unknown> {
  return !!d && typeof d === "object";
}
function numero(d: unknown) {
  return typeof d === "number" && Number.isSafeInteger(d) && d >= 0;
}
export function validarPainel(d: unknown): JogoGalera {
  const base = validarGalera(d);
  if (!objeto(d))
    throw new ErroDaApi("RESPOSTA_INVALIDA", "Confira o painel da galera.");
  const ids = base.participantes.map((p) => p.participante_id);
  const lista = (v: unknown): v is string[] =>
    Array.isArray(v) &&
    v.every((i) => typeof i === "string" && ids.includes(i)) &&
    new Set(v).size === v.length;
  const p = d.painel;
  if (
    !numero(d.tempo_total_ms) ||
    !Array.isArray(d.resumo_sessoes) ||
    !d.resumo_sessoes.every(
      (s) =>
        objeto(s) &&
        numero(s.numero) &&
        typeof s.tematica === "string" &&
        typeof s.estado === "string" &&
        typeof s.desempate === "boolean" &&
        numero(s.tempo_ativo_ms),
    ) ||
    !(
      p === null ||
      (objeto(p) &&
        ["em_andamento", "aguardando_desempate", "concluida"].includes(
          String(p.estado),
        ) &&
        typeof p.sessao === "number" &&
        Number.isInteger(p.sessao) &&
        p.sessao >= 1 &&
        p.sessao <= 6 &&
        typeof p.sessao_id === "string" &&
        typeof p.tematica === "string" &&
        lista(p.ordem) &&
        p.ordem.length >= 1 &&
        lista(p.lideres) &&
        lista(p.concordantes) &&
        typeof p.extra === "boolean" &&
        numero(p.tempo_ativo_ms) &&
        (p.participante_atual === null ||
          (typeof p.participante_atual === "string" &&
            p.ordem.includes(p.participante_atual))) &&
        Array.isArray(p.bloqueadas) &&
        p.bloqueadas.every(
          (c) => typeof c === "string" && /^[A-ZÇ0-9]$/.test(c),
        ) &&
        Array.isArray(p.palavras) &&
        p.palavras.length >= 1 &&
        p.palavras.length <= 3 &&
        p.palavras.every(
          (p) =>
            Array.isArray(p) &&
            p.length > 0 &&
            p.every(
              (c) =>
                c === null ||
                (typeof c === "string" &&
                  Array.from(c).length === 1 &&
                  c === c.normalize("NFC").toUpperCase()),
            ),
        ))
    )
  )
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível conferir o painel da galera.",
    );
  return d as JogoGalera;
}
export const baseGalera = (id: string) =>
  `/api/partidas/galera/${encodeURIComponent(id)}`;
export async function lerPainel(id: string) {
  return validarPainel(await requisitar(`${baseGalera(id)}/painel`));
}
export type ComandoGalera = {
  id_acao: string;
  versao_esperada: number;
  tipo: "iniciar" | "letra" | "palpite" | "voto" | "extra" | "encerrar";
  participante_id?: string;
  valor?: string;
  palavra?: number;
  aceita?: boolean;
  tematica?: string;
};
export async function enviarJogada(
  id: string,
  dados: ComandoGalera,
  token: string,
) {
  return validarPainel(
    await requisitar(`${baseGalera(id)}/acoes`, "POST", dados, token),
  );
}
export async function conexaoGalera(
  id: string,
  dados: unknown,
  token: string,
  manterViva = false,
) {
  return validarPainel(
    await requisitar(
      `${baseGalera(id)}/conexoes`,
      "POST",
      dados,
      token,
      manterViva,
    ),
  );
}
export async function tempoGalera(
  base: string,
  token?: string,
  dados?: unknown,
  manterViva = false,
) {
  return validarPainel(
    await requisitar(
      `${base}/tempo`,
      dados ? "POST" : "GET",
      dados,
      token,
      manterViva,
    ),
  );
}

export function confirmarTempoGalera(
  base: string,
  token: string,
  sessao: string,
  inicio: number,
  fim: number,
  manterViva = false,
) {
  return tempoGalera(
    base,
    token,
    {
      sessao_id: sessao,
      inicio_ms: Math.round(inicio),
      fim_ms: Math.round(fim),
    },
    manterViva,
  );
}
