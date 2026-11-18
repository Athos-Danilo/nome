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
    gesto:
      "Boas-vindas showman: agacha, dá um saltinho abrindo os braços e acena com ritmo.",
    etapas: [
      "Antecipação elástica dobrando os joelhos.",
      "Saltinho alegre com aceno amplo e folhear de páginas.",
      "Acomodação com atraso natural da gravata e retorno ao neutro.",
    ],
  },
  espera: {
    nome: "Espera",
    controle: "espera",
    gesto:
      "Respiração viva, olhar curioso, piscadas naturais e batidinha rítmica no chão.",
    etapas: [
      "Respiração 2.5D mantendo o volume do livro.",
      "Olhar atento e batida dupla com a ponta do sapato direito.",
      "Retorno contínuo para repetir somente no repouso.",
    ],
  },
  pensamento: {
    nome: "Pensamento",
    controle: "pensamento",
    gesto:
      "Mão esquerda na cintura, mão direita no queixo, olhos de detetive, folheada e ideia.",
    etapas: [
      "Recolhe o sorriso e inclina com pálpebras semicerradas.",
      "Contorna o livro até o queixo enquanto folheia o dicionário.",
      "O brilho acende na descoberta antes de relaxar.",
    ],
  },
  apresentacao: {
    nome: "Apresentação de dica",
    controle: "apresentação",
    gesto:
      "Abertura ampla de apresentador com os dois braços e olhar voltado à pista.",
    etapas: [
      "Comprime para criar expectativa.",
      "Abre os dois braços com brilho e folhas em movimento.",
      "Sustenta o convite e regressa suavemente.",
    ],
  },
  folhear_dica: {
    nome: "Folhear dica",
    controle: "folhear dica",
    gesto:
      "Vira páginas do próprio dicionário buscando uma nova pista e aponta entusiasmado.",
    etapas: [
      "Inclina para cima olhando o miolo do livro.",
      "Folhas dinâmicas viram enquanto a mão busca a pista.",
      "Abre a palma com brilho apresentando a nova dica.",
    ],
  },
  tensao_decisiva: {
    nome: "Tensão decisiva",
    controle: "tensão decisiva",
    gesto:
      "Clima de suspense para a 5ª dica ou empate aguardando voto decisivo.",
    etapas: [
      "Encolhe para frente com pálpebras semicerradas.",
      "Mãos perto da gravata e olhares rápidos entre as opções.",
      "Suspira aliviado e retorna ao eixo.",
    ],
  },
  erro: {
    nome: "Erro",
    controle: "erro",
    gesto:
      "Susto breve, mãos encabuladas à frente da capa e sorriso acolhedor de incentivo.",
    etapas: [
      "Pequeno salto de susto levantando páginas.",
      "Cruza as luvas no peito com pálpebras empáticas.",
      "Recupera a confiança com sorriso fechado.",
    ],
  },
  troca_amigavel: {
    nome: "Troca amigável",
    controle: "troca amigável",
    gesto:
      "Reconhece os pontos parciais conquistados e passa a vez com elegância.",
    etapas: [
      "Acena positivo com a mão esquerda pelas letras certas.",
      "Vira o corpo apontando a passagem de turno.",
      "Piscadela rápida encerrando o convite.",
    ],
  },
  comemoracao: {
    nome: "Comemoração",
    controle: "comemoração",
    gesto:
      "Agacha fundo, salta dobrando os joelhos com os dois braços erguidos e gargalha.",
    etapas: [
      "Squash forte preparando o impulso nos pés.",
      "Salto cartoon com olhos felizes (^ ^) e estrelas.",
      "Pouso com mola elástica e saltinho final.",
    ],
  },
  comemoracao_epica: {
    nome: "Comemoração épica",
    controle: "comemoração épica",
    gesto:
      "Vitória dupla para acertos de 1ª dica (100 pts) ou jogadas de 300+ pontos na Galera.",
    etapas: [
      "Agacha fundo acumulando energia máxima.",
      "Salto duplo com giro alegre, gargalhada, folhas e chuva de estrelas.",
      "Pousa vibrante mantendo a gravata balançando.",
    ],
  },
  turno: {
    nome: "Passagem de vez",
    controle: "passagem de vez",
    gesto: "Gira convidando o próximo participante com braços abertos.",
    etapas: [
      "Reconhece a jogada anterior.",
      "Abre os braços acompanhando a seta de turno.",
      "Pisca encerrando a transição.",
    ],
  },
  sorteio: {
    nome: "Sorteio",
    controle: "sorteio",
    gesto:
      "Acompanha cartões em suspense com os dois braços e faz a revelação oficial.",
    etapas: [
      "Prepara os cartões e folheia o livro.",
      "Alterna o olhar e as mãos entre as possibilidades.",
      "Salta revelando com brilho.",
    ],
  },
  resultado: {
    nome: "Resultado",
    controle: "resultado",
    gesto:
      "Exibe o selo final de showman e agradece com reverência clássica ao peito.",
    etapas: [
      "Abre os dois braços com gargalhada orgulhosa.",
      "Exibe o selo dourado de conclusão.",
      "Faz reverência com mão no peito e retorna.",
    ],
  },
};
