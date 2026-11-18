import type { GestoMenu } from "./gestos-menu";

export const REPERTORIO_GESTOS: Record<
  GestoMenu,
  {
    nome: string;
    controle: string;
    gesto: string;
    etapas: readonly [string, string, string];
  }
> = {
  olhar_solo: {
    nome: "Olhar para o Solo",
    controle: "olhar para o Solo",
    gesto:
      "Mira exatamente o cartão Solo no layout atual e aponta convidando com arco suave.",
    etapas: [
      "Antecipação curta do livro e dos olhos.",
      "Inclina e aponta para a posição real do cartão Solo.",
      "Retorna o olhar e acomoda as folhas.",
    ],
  },
  olhar_galera: {
    nome: "Olhar para a Galera",
    controle: "olhar para a Galera",
    gesto:
      "Convite aberto com os dois braços apontando para a posição real da Galera.",
    etapas: [
      "Recolhe o corpo preparando o gesto.",
      "Abre os dois braços com sobrancelha erguida na direção do cartão.",
      "Relaxa o gesto antes de voltar ao neutro.",
    ],
  },
  ajeitar_gravata: {
    nome: "Ajeitar a gravata",
    controle: "ajuste da gravata",
    gesto:
      "O braço direito sai de trás do livro, contorna a lateral em 2.5D e dá dois ajustes no laço.",
    etapas: [
      "Olha para o nó e inicia o arco externo pela direita.",
      "Contorna a borda sem fendas, dá dois ajustes no laço e sorri.",
      "Recua em arco suave com piscadela confiante.",
    ],
  },
  seguir_letra: {
    nome: "Seguir a letra",
    controle: "perseguição da letra",
    gesto:
      "Uma letra A atravessa o palco em arco enquanto olhar, corpo e braços tentam alcançá-la.",
    etapas: [
      "Percebe a letra surgindo à esquerda.",
      "Ergue os dois braços e acompanha o voo por cima da cabeça.",
      "A letra se despede em brilho e o apresentador pisca curioso.",
    ],
  },
  reagir_toque: {
    nome: "Reagir ao toque",
    controle: "resposta ao toque",
    gesto:
      "Agacha surpreso, dá um salto com os braços bem abertos e solta uma piscadela cúmplice.",
    etapas: [
      "Reage ao chamado comprimindo o corpo.",
      "Salta dobrando os joelhos com braços abertos no alto.",
      "Pousa com piscadela e sorriso brilhante.",
    ],
  },
};
