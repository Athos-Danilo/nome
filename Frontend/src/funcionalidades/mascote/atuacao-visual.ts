import { poseAtuacao } from "./atuacoes";
import { DURACOES, type Reacao } from "./reacoes";
import {
  DURACOES_GESTOS,
  ehGestoMenu,
  poseGestoMenu,
  type GestoMenu,
  type DirecaoOlhar,
} from "./gestos-menu";
import type { PoseCompleta } from "./pose-base";

export type TipoAtuacao = Reacao | GestoMenu;

export const duracaoAtuacao = (tipo: TipoAtuacao) =>
  ehGestoMenu(tipo) ? DURACOES_GESTOS[tipo] : DURACOES[tipo];

export const poseVisual = (
  tipo: TipoAtuacao,
  tempo: number,
  direcao?: DirecaoOlhar,
): PoseCompleta =>
  ehGestoMenu(tipo)
    ? poseGestoMenu(tipo, tempo, direcao)
    : poseAtuacao(tipo, tempo);
