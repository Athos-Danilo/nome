import type { DirecaoOlhar } from "./gestos-menu";
import type { Reacao } from "./reacoes";

export type FalaSolo = {
  titulo: string;
  subtitulo: string;
};

export type ContextoFalaSolo = {
  reacao?: Reacao;
  dicaAtual: number;
  totalDicas?: number;
  pontosUltimaAcao?: number;
  seed?: number;
  toque?: number;
};

export type ContextoFalaGalera = {
  reacao?: Reacao;
  participanteAtual?: string;
  estadoSessao?: string;
  seed?: number;
  toque?: number;
};

const escolher = <T>(opcoes: readonly T[], seed = 0): T =>
  opcoes[Math.abs(Math.trunc(seed)) % opcoes.length];

const FALAS_SOLO_EPICAS: readonly FalaSolo[] = [
  { titulo: "Na mosca de primeira!", subtitulo: "Leitura digna de verbete." },
  { titulo: "Golaço de vocabulário!", subtitulo: "Acertou no brilho inicial." },
];

const FALAS_SOLO_ACERTO: readonly FalaSolo[] = [
  { titulo: "Boa descoberta!", subtitulo: "Mais pontos para a estante." },
  { titulo: "Achou a palavra certa!", subtitulo: "Ritmo ótimo na rodada." },
];

const FALAS_SOLO_ERRO: readonly FalaSolo[] = [
  { titulo: "Quase lá!", subtitulo: "A próxima pista ajuda." },
  { titulo: "Respira e tenta outra.", subtitulo: "As letras estão quase aí." },
];

const FALAS_SOLO_FOLHEAR: readonly FalaSolo[] = [
  {
    titulo: "Mais uma página aberta.",
    subtitulo: "Cada pista afunila o alvo.",
  },
  { titulo: "Nova pista na mesa!", subtitulo: "O detalhe faz diferença." },
];

const FALAS_SOLO_ULTIMA: readonly FalaSolo[] = [
  { titulo: "Última pista no palco!", subtitulo: "Agora é tudo ou nada." },
  { titulo: "Quinta e última dica!", subtitulo: "Confie no seu palpite." },
];

const FALAS_SOLO_TOQUE: readonly FalaSolo[] = [
  {
    titulo: "Opa! Estou ligado aqui.",
    subtitulo: "Qual letra você vai testar?",
  },
  { titulo: "Gostei da energia!", subtitulo: "Seguimos nessa pista." },
];

export function falaSolo(contexto: ContextoFalaSolo): FalaSolo {
  const semente = contexto.seed ?? contexto.dicaAtual;
  if ((contexto.toque ?? 0) > 0)
    return escolher(FALAS_SOLO_TOQUE, (contexto.toque ?? 1) - 1);

  if (
    contexto.reacao === "comemoracao_epica" ||
    (contexto.reacao === "comemoracao" &&
      (contexto.pontosUltimaAcao ?? 0) >= 100)
  )
    return escolher(FALAS_SOLO_EPICAS, semente);

  if (contexto.reacao === "comemoracao")
    return escolher(FALAS_SOLO_ACERTO, semente);

  if (contexto.reacao === "erro") return escolher(FALAS_SOLO_ERRO, semente);

  const totalDicas = contexto.totalDicas ?? 5;
  if (contexto.reacao === "tensao_decisiva" || contexto.dicaAtual >= totalDicas)
    return escolher(FALAS_SOLO_ULTIMA, semente);

  if (contexto.reacao === "folhear_dica" || contexto.dicaAtual > 1)
    return escolher(FALAS_SOLO_FOLHEAR, semente);

  return {
    titulo: "Uma pista de cada vez.",
    subtitulo: "O seu “ahá!” está chegando.",
  };
}

const FALAS_GALERA_TOQUE: readonly string[] = [
  "Oi! Estou de olho em cada palpite.",
  "Pronto para a próxima virada no sofá!",
];

export function falaGalera(contexto: ContextoFalaGalera): string {
  const nome = contexto.participanteAtual?.trim();
  if ((contexto.toque ?? 0) > 0)
    return escolher(FALAS_GALERA_TOQUE, (contexto.toque ?? 1) - 1);

  if (
    contexto.estadoSessao === "aguardando_desempate" ||
    contexto.reacao === "tensao_decisiva"
  )
    return "Mais uma descoberta para decidir?";

  if (contexto.reacao === "comemoracao_epica")
    return nome
      ? `Jogada de mestre, ${nome}! Placar lá no alto!`
      : "Jogada de mestre! Placar lá no alto!";

  if (contexto.reacao === "comemoracao")
    return "Ponto bonito! Continua na vez.";

  if (contexto.reacao === "troca_amigavel")
    return "Bom palpite! Passando o bastão.";

  if (contexto.reacao === "sorteio") return "Embaralhando o próximo enigma…";

  if (contexto.reacao === "turno" && nome) return `Agora é a vez de ${nome}!`;

  return "Acertou? Continua na vez. O palco é de vocês!";
}

/** Calcula o olhar horizontal/vertical ao acompanhar a seleção de letras à esquerda do mascote. */
export function direcaoOlharMontagem(
  indiceSelecionado: number,
  comprimento: number,
): DirecaoOlhar {
  const total = Math.max(1, comprimento);
  const clamped = Math.max(0, Math.min(total - 1, indiceSelecionado));
  const fracao = total > 1 ? clamped / (total - 1) : 0.5;
  return {
    x: Number((-13 + fracao * 10).toFixed(2)),
    y: Number((-2 + Math.sin(fracao * Math.PI) * 3).toFixed(2)),
  };
}
