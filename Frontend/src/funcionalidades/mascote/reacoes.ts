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
  espera: 2800,
  saudacao: 5400,
  pensamento: 2000,
  apresentacao: 1600,
  erro: 1500,
  comemoracao: 2100,
  turno: 1400,
  sorteio: 2200,
  resultado: 2600,
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
