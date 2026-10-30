import type { Reacao } from "./reacoes";

export const REPERTORIO: Record<
  Reacao,
  {
    nome: string;
    controle: string;
    gesto: string;
    etapas: readonly [string, string, string];
  }
> = {
  saudacao: {
    nome: "Saudação",
    controle: "saudação",
    gesto: "O aceno aprovado: atenção, cumprimento e acomodação.",
    etapas: [
      "Olhar e preparação do corpo.",
      "Ombro, cotovelo e punho em ritmos diferentes.",
      "Gravata e páginas chegam depois do gesto.",
    ],
  },
  espera: {
    nome: "Espera",
    controle: "espera",
    gesto:
      "Respira, observa o jogo e pisca. Um repouso discreto, sem pedir atenção o tempo todo.",
    etapas: [
      "Respiração leve, apoiado nos pés.",
      "O olhar passeia e os olhos piscam.",
      "Retorno suave para repetir somente no repouso.",
    ],
  },
  pensamento: {
    nome: "Pensamento",
    controle: "pensamento",
    gesto: "Uma dúvida, dois olhares e aquele instante de descoberta.",
    etapas: [
      "Recolhe o sorriso e inclina o livro.",
      "Sobrancelhas desencontradas e olhar curioso.",
      "O brilho marca uma ideia; o corpo se acomoda.",
    ],
  },
  apresentacao: {
    nome: "Apresentação de dica",
    controle: "apresentação",
    gesto: "Abre o gesto com a palma, como quem apresenta uma boa pista.",
    etapas: [
      "Recolhe o gesto para criar expectativa.",
      "Palma, olhar e brilho apresentam a dica.",
      "Sustenta a apresentação e retorna com calma.",
    ],
  },
  erro: {
    nome: "Erro",
    controle: "erro",
    gesto:
      "Um pequeno susto, um encolher de ombros e um sorriso de incentivo para seguir.",
    etapas: [
      "Surpresa breve, sem repreender o jogador.",
      "Ombros erguidos e balanço encabulado.",
      "Recupera a expressão acolhedora.",
    ],
  },
  comemoracao: {
    nome: "Comemoração",
    controle: "comemoração",
    gesto: "Prepara nos pés, dá um pulinho e pousa com o peso do livro.",
    etapas: [
      "Comprime o corpo antes do salto.",
      "Salta inteiro, com braços, gravata e estrelas.",
      "Amortece a aterrissagem e termina o balanço.",
    ],
  },
  turno: {
    nome: "Passagem de vez",
    controle: "passagem de vez",
    gesto: "Olha de um lado para o outro e convida o próximo participante.",
    etapas: [
      "Reconhece quem acabou de jogar.",
      "Palma e olhar acompanham a passagem de vez.",
      "Um aceno curto encerra o convite.",
    ],
  },
  sorteio: {
    nome: "Sorteio",
    controle: "sorteio",
    gesto:
      "Acompanha as possibilidades, segura o suspense e apresenta a escolha oficial do jogo.",
    etapas: [
      "Prepara a expectativa.",
      "Olhares alternados acompanham os cartões.",
      "Abre o gesto para a revelação.",
    ],
  },
  resultado: {
    nome: "Resultado",
    controle: "resultado",
    gesto:
      "Apresenta o fechamento da partida e agradece com uma pequena reverência.",
    etapas: [
      "Olhar e gesto anunciam o encerramento.",
      "O selo de conclusão acompanha a apresentação.",
      "Faz uma reverência e volta ao repouso.",
    ],
  },
};
