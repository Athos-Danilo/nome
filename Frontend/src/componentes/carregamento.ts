/** Estágios progressivos para esperas curtas, médias ou despertar do servidor. */
export type EstagioEspera = "inicial" | "processando" | "despertando";

export type ContextoCarregamento =
  "geral" | "solo" | "demonstracao" | "galera" | "acompanhamento";

export type AcaoProcessamento =
  | "palpite"
  | "dica"
  | "desistencia_palavra"
  | "pausa"
  | "retomada"
  | "encerramento"
  | "saida"
  | "letra"
  | "desempate"
  | "inicio_partida"
  | "configuracao"
  | "sincronizacao";

export type ModoProcessamento = "solo" | "demonstracao" | "galera";

export type OpcoesProcessamento = {
  acao: AcaoProcessamento;
  modo: ModoProcessamento;
  letra?: string;
  participante?: string;
};

export type DescricaoCarregamento = {
  etiqueta: string;
  pecas: string[];
  titulo: string;
  subtitulo: string;
  estagio: EstagioEspera;
};

export type DescricaoProcessamento = {
  etiqueta: string;
  pecaDestaque?: string;
  titulo: string;
  detalhe: string;
  estagio: EstagioEspera;
};

export const LIMIARES_ESPERA_MS = {
  processando: 3500,
  despertando: 11000,
} as const;

type ModeloCarregamento = {
  etiqueta: string;
  pecas: string[];
  titulo: string;
  subtitulos: Record<EstagioEspera, string>;
};

const CARREGAMENTO_POR_CONTEXTO: Record<
  ContextoCarregamento,
  ModeloCarregamento
> = {
  geral: {
    etiqueta: "PREPARANDO O PALCO",
    pecas: ["D", "E", "C", "I", "F", "R", "A"],
    titulo: "Preparando suas próximas descobertas…",
    subtitulos: {
      inicial: "Embaralhando as letras e organizando a sala.",
      processando:
        "Dica do Aurélio: acertar na primeira pista vale 100 pontos.",
      despertando:
        "O servidor gratuito pode estar despertando — já vamos abrir o palco!",
    },
  },
  solo: {
    etiqueta: "MODO SOLO",
    pecas: ["P", "I", "S", "T", "A"],
    titulo: "Separando suas pistas e quadradinhos…",
    subtitulos: {
      inicial: "Conferindo seu último progresso salvo.",
      processando: "Lembrando: cada acento certo faz parte da resposta.",
      despertando:
        "O servidor gratuito está acordando para abrir sua rodada com segurança.",
    },
  },
  demonstracao: {
    etiqueta: "UM GOSTINHO DO DECIFRA",
    pecas: ["D", "I", "C", "A", "S"],
    titulo: "Preparando sua partida rápida…",
    subtitulos: {
      inicial: "Três palavras fáceis esperando por você.",
      processando: "Aurélio está ajustando as cinco pistas de cada palavra.",
      despertando:
        "O servidor gratuito está despertando — sua amostra já vai começar!",
    },
  },
  galera: {
    etiqueta: "COM A GALERA",
    pecas: ["G", "A", "L", "E", "R", "A"],
    titulo: "Reunindo a galera no mesmo palco…",
    subtitulos: {
      inicial: "Organizando o painel compartilhado e os placares.",
      processando: "Cada nova posição revelada rende 100 pontos no placar!",
      despertando:
        "O servidor gratuito está acordando — o painel de vocês já aparece.",
    },
  },
  acompanhamento: {
    etiqueta: "ACOMPANHAMENTO",
    pecas: ["P", "L", "A", "C", "A", "R"],
    titulo: "Organizando seus registros e conquistas…",
    subtitulos: {
      inicial: "Conferindo os números das suas partidas.",
      processando: "Somando pontos, acertos e posições confirmadas.",
      despertando:
        "O servidor gratuito está respondendo — só mais um instante.",
    },
  },
};

const ETIQUETAS_MODO: Record<ModoProcessamento, string> = {
  solo: "MODO SOLO",
  demonstracao: "DEMONSTRAÇÃO",
  galera: "COM A GALERA",
};

const TEXTOS_ACAO: Record<
  Exclude<AcaoProcessamento, "letra">,
  { titulo: string; detalhe: string }
> = {
  palpite: {
    titulo: "Conferindo seu palpite…",
    detalhe: "Validando letras, acentos e pontuação.",
  },
  dica: {
    titulo: "Abrindo a próxima dica…",
    detalhe: "Aurélio está virando a página do dicionário.",
  },
  desistencia_palavra: {
    titulo: "Revelando a resposta da rodada…",
    detalhe: "Registrando a etapa e preparando a próxima palavra.",
  },
  pausa: {
    titulo: "Guardando suas pistas com segurança…",
    detalhe: "Salvando rodada, dica atual e letras confirmadas.",
  },
  retomada: {
    titulo: "Recuperando sua rodada salva…",
    detalhe: "Trazendo de volta suas dicas e montagem.",
  },
  encerramento: {
    titulo: "Fechando a partida…",
    detalhe: "Consolidando o resultado final no servidor.",
  },
  saida: {
    titulo: "Pausando e salvando sua partida…",
    detalhe: "Confirmando o registro antes de voltar ao menu.",
  },
  desempate: {
    titulo: "Registrando decisão do desempate…",
    detalhe: "Conferindo a escolha dos líderes no servidor.",
  },
  inicio_partida: {
    titulo: "Montando o desafio no servidor…",
    detalhe: "Preparando as palavras e a ordem oficial.",
  },
  configuracao: {
    titulo: "Conferindo palavras disponíveis…",
    detalhe: "Consultando o catálogo para montar sua seleção.",
  },
  sincronizacao: {
    titulo: "Sincronizando a partida…",
    detalhe: "Conferindo a última versão confirmada no servidor.",
  },
};

const DETALHE_ESPERA_ESTENDIDA: Record<
  Exclude<EstagioEspera, "inicial">,
  string
> = {
  processando: "Servidor processando devagar — só mais um momento.",
  despertando:
    "O servidor gratuito está acordando. Não feche a aba: seu jogo continua salvo!",
};

/** Classifica o estágio da espera a partir do tempo decorrido em milissegundos. */
export function estagioEspera(decorridoMs: number): EstagioEspera {
  if (decorridoMs >= LIMIARES_ESPERA_MS.despertando) return "despertando";
  if (decorridoMs >= LIMIARES_ESPERA_MS.processando) return "processando";
  return "inicial";
}

/** Determina o contexto visual adequado para o fallback da rota informada. */
export function contextoDaRota(caminho: string): ContextoCarregamento {
  if (caminho === "/jogar/demonstracao") return "demonstracao";
  if (caminho.startsWith("/jogar/individual")) return "solo";
  if (caminho.startsWith("/jogar/galera")) return "galera";
  if (
    caminho === "/rankings" ||
    caminho === "/perfil/historico" ||
    caminho === "/perfil/estatisticas"
  )
    return "acompanhamento";
  return "geral";
}

/** Retorna peças temáticas e mensagens progressivas para telas em carregamento. */
export function descreverCarregamento(
  contexto: ContextoCarregamento,
  decorridoMs = 0,
): DescricaoCarregamento {
  const estagio = estagioEspera(decorridoMs);
  const modelo = CARREGAMENTO_POR_CONTEXTO[contexto];
  return {
    etiqueta: modelo.etiqueta,
    pecas: modelo.pecas,
    titulo: modelo.titulo,
    subtitulo: modelo.subtitulos[estagio],
    estagio,
  };
}

/** Retorna descrição temática para ações e esperas dentro de partidas ou configuradores. */
export function descreverProcessamento(
  opcoes: OpcoesProcessamento,
  decorridoMs = 0,
): DescricaoProcessamento {
  const estagio = estagioEspera(decorridoMs);
  const etiqueta = ETIQUETAS_MODO[opcoes.modo];

  if (opcoes.acao === "letra") {
    const letra = opcoes.letra?.trim().toLocaleUpperCase("pt-BR") || "?";
    return {
      etiqueta,
      pecaDestaque: letra,
      titulo: `Procurando a letra ${letra} no painel…`,
      detalhe:
        estagio === "inicial"
          ? opcoes.participante
            ? `Vez de ${opcoes.participante} — conferindo posições ocultas.`
            : "Conferindo todas as ocorrências do painel."
          : DETALHE_ESPERA_ESTENDIDA[estagio],
      estagio,
    };
  }

  const base = TEXTOS_ACAO[opcoes.acao];
  const titulo =
    opcoes.acao === "palpite" && opcoes.participante
      ? `Conferindo o palpite de ${opcoes.participante}…`
      : base.titulo;

  return {
    etiqueta,
    titulo,
    detalhe:
      estagio === "inicial" ? base.detalhe : DETALHE_ESPERA_ESTENDIDA[estagio],
    estagio,
  };
}
