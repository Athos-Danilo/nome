import { DURACAO_SAUDACAO } from "./saudacao";

/** Reações são apresentação: nunca liberam ações nem calculam pontos. */
export const REACOES = [
  "espera",
  "saudacao",
  "pensamento",
  "apresentacao",
  "folhear_dica",
  "tensao_decisiva",
  "erro",
  "troca_amigavel",
  "comemoracao",
  "comemoracao_epica",
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
  espera: 6800,
  saudacao: DURACAO_SAUDACAO,
  pensamento: 3800,
  apresentacao: 3200,
  folhear_dica: 3000,
  tensao_decisiva: 3400,
  erro: 3000,
  troca_amigavel: 2800,
  comemoracao: 3400,
  comemoracao_epica: 4200,
  turno: 2600,
  sorteio: 4200,
  resultado: 4600,
};

const prioridades: Record<Reacao, number> = {
  espera: 0,
  saudacao: 1,
  pensamento: 1,
  apresentacao: 2,
  folhear_dica: 2,
  turno: 3,
  troca_amigavel: 3,
  tensao_decisiva: 4,
  sorteio: 4,
  erro: 5,
  comemoracao: 6,
  comemoracao_epica: 7,
  resultado: 8,
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
  acao?: { resultado: string; pontos?: number };
  rodada_atual?: { dica_atual?: number } | null;
}): EventoReacao {
  const resultado = estado.acao?.resultado;
  let tipo: Reacao = "apresentacao";

  if (resultado === "erro") {
    tipo = "erro";
  } else if (resultado === "acerto") {
    tipo =
      (estado.acao?.pontos ?? 0) >= 100 ? "comemoracao_epica" : "comemoracao";
  } else if (resultado === "desistencia") {
    tipo = "pensamento";
  } else if (resultado === "dica_revelada" || resultado === "dica") {
    tipo =
      estado.rodada_atual?.dica_atual === 5
        ? "tensao_decisiva"
        : "folhear_dica";
  } else if (estado.rodada_atual?.dica_atual === 5) {
    tipo = "tensao_decisiva";
  }

  return {
    id: `${estado.partida_id}:${estado.versao}`,
    tipo,
  };
}

export type ResumoGalera = {
  versao: number;
  sessao: number;
  participante: string | null;
  pontos: number;
  estado: string;
  estadoSessao?: string;
};

export function reacaoGalera(
  anterior: ResumoGalera,
  atual: ResumoGalera,
): Reacao | null {
  if (atual.versao <= anterior.versao) return null;
  if (["concluida", "abandonada"].includes(atual.estado)) return "resultado";
  if (atual.sessao !== anterior.sessao) return "sorteio";
  if (
    atual.estadoSessao === "aguardando_desempate" &&
    anterior.estadoSessao !== "aguardando_desempate"
  )
    return "tensao_decisiva";

  const ganho = atual.pontos - anterior.pontos;
  const trocou = atual.participante !== anterior.participante;

  if (trocou && ganho > 0) return "troca_amigavel";
  if (ganho >= 300) return "comemoracao_epica";
  if (ganho > 0) return "comemoracao";
  if (trocou) return "turno";
  return null;
}
