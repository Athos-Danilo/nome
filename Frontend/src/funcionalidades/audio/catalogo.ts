export const MUSICAS = [
  {
    id: "lofi_01",
    nome: "Lo-fi 01 · Chill Loopable",
    autor: "Alex McCulloch (Pro Sensory)",
    arquivo: "/audio/musicas/lofi_01.mp3",
    fonte: "https://opengameart.org/content/chill-loopable",
  },
  {
    id: "lofi_02",
    nome: "Lo-fi 02 · Lofi Again",
    autor: "omfgdude",
    arquivo: "/audio/musicas/lofi_02.mp3",
    fonte: "https://opengameart.org/content/lofi-again",
  },
  {
    id: "lofi_03",
    nome: "Lo-fi 03 · Happy Lofi Day",
    autor: "Tarush Singhal",
    arquivo: "/audio/musicas/lofi_03.mp3",
    fonte: "https://opengameart.org/content/happy-lofi-day",
  },
  {
    id: "arcade_01",
    nome: "Arcade 01 · Puzzling",
    autor: "Ruskerdax",
    arquivo: "/audio/musicas/arcade_01.mp3",
    fonte: "https://opengameart.org/content/puzzling",
  },
  {
    id: "arcade_02",
    nome: "Arcade 02 · April’s Finale",
    autor: "Alex McCulloch (Pro Sensory)",
    arquivo: "/audio/musicas/arcade_02.mp3",
    fonte: "https://opengameart.org/content/aprils-finale-v2-loop-electronic",
  },
] as const;
export type MusicaId = (typeof MUSICAS)[number]["id"];
export const MUSICA_MENU = {
  id: "menu",
  nome: "Cozy Puzzle Title",
  autor: "MintoDog",
  arquivo: "/audio/musicas/menu.mp3",
  fonte: "https://opengameart.org/content/cozy-puzzle-title",
} as const;
export const TODAS_MUSICAS = [...MUSICAS, MUSICA_MENU];
export const EFEITOS = {
  botao: "interface",
  tecla: "interface",
  apagar: "interface",
  acento: "interface",
  arrastar: "interface",
  abrir: "interface",
  fechar: "interface",
  acerto: "eventos",
  erro: "eventos",
  dica: "eventos",
  turno: "eventos",
  sorteio: "eventos",
  resultado: "eventos",
} as const;
export type TipoEfeito = keyof typeof EFEITOS;
