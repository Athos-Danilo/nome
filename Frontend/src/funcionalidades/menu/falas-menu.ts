export type ContextoFalas =
  "geral" | "visitante" | "demonstracao-usada" | "conta" | "continuidade";
export type FalaMenu = { id: string; texto: string; destaque: string };
const fala = (id: string, texto: string, destaque: string): FalaMenu => ({
  id,
  texto,
  destaque,
});
const GERAIS = [
  fala("geral-curiosidade", "Siga a curiosidade.", "Ela abre caminhos!"),
  fala("geral-descoberta", "Uma pista de cada vez.", "Uma nova descoberta!"),
  fala("geral-ideia", "Às vezes, um detalhe…", "E a ideia aparece!"),
  fala("geral-ritmo", "Respira. Pensa.", "Vai no seu ritmo!"),
  fala("geral-palavras", "Tanta coisa nas letras!", "Bora descobrir?"),
] as const;
const REPERTORIOS: Record<
  ContextoFalas,
  { inicial: FalaMenu; alternativas: readonly FalaMenu[] }
> = {
  geral: {
    inicial: fala("geral-inicial", "Uma dica?", "Deixa comigo!"),
    alternativas: GERAIS,
  },
  visitante: {
    inicial: fala("visitante-inicial", "Uma dica?", "Deixa comigo!"),
    alternativas: [
      ...GERAIS,
      fala(
        "visitante-experimente",
        "Quer experimentar?",
        "Bora de Jogo rápido!",
      ),
      fala("visitante-tres", "Três descobertas.", "Seu primeiro desafio!"),
      fala("visitante-google", "Entre com Google.", "Escolha seu desafio!"),
    ],
  },
  "demonstracao-usada": {
    inicial: fala(
      "usada-inicial",
      "Gostou das pistas?",
      "Entre para continuar!",
    ),
    alternativas: [
      ...GERAIS,
      fala("usada-google", "Curtiu descobrir?", "Vem com seu Google!"),
      fala("usada-desafios", "Tem mais desafios.", "Entre para escolher!"),
      fala("usada-conta", "Sua próxima descoberta?", "Começa com o login!"),
    ],
  },
  conta: {
    inicial: fala("conta-inicial", "Uma dica?", "Deixa comigo!"),
    alternativas: [
      ...GERAIS,
      fala("conta-solo", "Um desafio só seu?", "Bora de Solo!"),
      fala("conta-galera", "Trouxe companhia?", "Bora de Galera!"),
      fala("conta-escolha", "Qual vai ser a de hoje?", "Você escolhe!"),
    ],
  },
  continuidade: {
    inicial: fala(
      "continuidade-inicial",
      "Sua partida espera.",
      "Vamos continuar?",
    ),
    alternativas: [
      ...GERAIS,
      fala(
        "continuidade-pistas",
        "Ainda tem descoberta.",
        "Continue sua partida!",
      ),
      fala("continuidade-ponto", "Volte de onde parou.", "As pistas esperam!"),
      fala("continuidade-caminho", "Ficou pela metade?", "Bora continuar!"),
    ],
  },
};

export function contextoDasFalas(
  conta: boolean,
  demonstracaoUsada: boolean | undefined,
  partidaAberta: boolean,
): ContextoFalas {
  if (conta) return partidaAberta ? "continuidade" : "conta";
  if (demonstracaoUsada === undefined) return "geral";
  return demonstracaoUsada ? "demonstracao-usada" : "visitante";
}
export function repertorioDasFalas(contexto: ContextoFalas) {
  return REPERTORIOS[contexto];
}
