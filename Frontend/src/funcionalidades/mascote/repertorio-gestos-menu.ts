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
      "O olhar chega primeiro ao cartão; livro, palma e gravata acompanham depois. No celular ele olha para baixo, onde o cartão está.",
    etapas: [
      "Uma breve preparação dos olhos.",
      "Apresenta o desafio com uma pequena inclinação e a palma.",
      "O olhar retorna e as páginas se acomodam.",
    ],
  },
  olhar_galera: {
    nome: "Olhar para a Galera",
    controle: "olhar para a Galera",
    gesto:
      "Um convite mais aberto para jogar junto, com sobrancelha levantada e gesto da mão, sem mover o foco do jogador.",
    etapas: [
      "Recolhe o corpo antes do convite.",
      "Olhar, ombro e punho apontam para a Galera.",
      "O gesto descansa antes de devolver o olhar.",
    ],
  },
  ajeitar_gravata: {
    nome: "Ajeitar a gravata",
    controle: "ajuste da gravata",
    gesto:
      "Confere o laço, aproxima a luva, dá dois pequenos ajustes e volta com ar satisfeito. A mão passa à frente da capa somente nesta atuação.",
    etapas: [
      "Olha para o laço e prepara o braço.",
      "Ombro, cotovelo e punho levam a luva até a gravata.",
      "Solta o laço, a mão recua e a gravata termina de oscilar.",
    ],
  },
  seguir_letra: {
    nome: "Seguir a letra",
    controle: "perseguição da letra",
    gesto:
      "Uma letra passeia de um lado ao outro; pupilas e sobrancelhas acompanham a mesma trajetória. Ela some com um pequeno brilho.",
    etapas: [
      "Percebe a letra do lado esquerdo.",
      "Segue o arco por cima da cabeça, sem girar o personagem inteiro.",
      "A letra se despede e uma piscada encerra a curiosidade.",
    ],
  },
  reagir_toque: {
    nome: "Reagir ao toque",
    controle: "resposta ao toque",
    gesto:
      "Surpresa breve, pequeno salto e uma piscadela cúmplice. O corpo inteiro acompanha o salto e os pés continuam ligados.",
    etapas: [
      "Reconhece que você o chamou.",
      "Dá um saltinho e acomoda o peso.",
      "Pisca um olho e retorna ao sorriso original.",
    ],
  },
};
