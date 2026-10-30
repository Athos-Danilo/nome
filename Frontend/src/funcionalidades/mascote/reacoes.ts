import { DURACAO_SAUDACAO } from "./saudacao";

/** Reações são apresentação: nunca liberam ações nem calculam pontos. */
export const REACOES = [
  "espera",
  "saudacao",
  "pensamento",
  "apresentacao",
  "erro",
  "comemoracao",
  "turno",
  "sorteio",
  "resultado",
] as const;
export type Reacao = (typeof REACOES)[number];
export type EventoReacao = { id: string; tipo: Reacao };
export type EstadoReacoes = {
  ativa: EventoReacao | null;
  pendente: EventoReacao | null;
  vistos: string[];
};
export const DURACOES: Record<Reacao, number> = {
  espera: 6400,
  saudacao: DURACAO_SAUDACAO,
  pensamento: 3800,
  apresentacao: 3200,
  erro: 2800,
  comemoracao: 3500,
  turno: 2600,
  sorteio: 4200,
  resultado: 4800,
};
const prioridades: Record<Reacao, number> = {
  espera: 0,
  saudacao: 1,
  pensamento: 1,
  apresentacao: 2,
  turno: 3,
  sorteio: 4,
  erro: 5,
  comemoracao: 6,
  resultado: 7,
};
export function iniciarReacoes(): EstadoReacoes {
  return { ativa: null, pendente: null, vistos: [] };
}
export function receberReacao(
  estado: EstadoReacoes,
  evento: EventoReacao,
): EstadoReacoes {
  if (estado.vistos.includes(evento.id)) return estado;
  const vistos = [...estado.vistos.slice(-31), evento.id];
  if (
    !estado.ativa ||
    prioridades[evento.tipo] >= prioridades[estado.ativa.tipo]
  )
    return { ativa: evento, pendente: null, vistos };
  return {
    ...estado,
    pendente: estado.ativa.tipo === "resultado" ? null : evento,
    vistos,
  };
}
export function concluirReacao(
  estado: EstadoReacoes,
  id: string,
): EstadoReacoes {
  if (estado.ativa?.id !== id) return estado;
  return { ...estado, ativa: estado.pendente, pendente: null };
}
export function reacaoIndividual(estado: {
  partida_id: string;
  versao: number;
  acao?: { resultado: string };
}): EventoReacao {
  return {
    id: `${estado.partida_id}:${estado.versao}`,
    tipo: estado.acao?.resultado === "erro" ? "erro" : "apresentacao",
  };
}
export type ResumoGalera = {
  versao: number;
  sessao: number;
  participante: string | null;
  pontos: number;
  estado: string;
};
export function reacaoGalera(
  anterior: ResumoGalera,
  atual: ResumoGalera,
): Reacao | null {
  if (atual.versao <= anterior.versao) return null;
  if (["concluida", "abandonada"].includes(atual.estado)) return "resultado";
  if (atual.sessao !== anterior.sessao) return "sorteio";
  if (atual.pontos > anterior.pontos) return "comemoracao";
  if (atual.participante !== anterior.participante) return "turno";
  return null;
}
