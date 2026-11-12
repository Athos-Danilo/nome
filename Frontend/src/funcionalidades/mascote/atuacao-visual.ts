import { poseAtuacao } from "./atuacoes";
import { DURACOES, type Reacao } from "./reacoes";
import {
  COMPLEMENTO_POSE,
  DURACOES_GESTOS,
  ehGestoMenu,
  poseGestoMenu,
  type GestoMenu,
  type DirecaoOlhar,
} from "./gestos-menu";
export type TipoAtuacao = Reacao | GestoMenu;
export const duracaoAtuacao = (tipo: TipoAtuacao) =>
  ehGestoMenu(tipo) ? DURACOES_GESTOS[tipo] : DURACOES[tipo];
export const poseVisual = (
  tipo: TipoAtuacao,
  tempo: number,
  direcao?: DirecaoOlhar,
) =>
  ehGestoMenu(tipo)
    ? poseGestoMenu(tipo, tempo, direcao)
    : { ...poseAtuacao(tipo, tempo), ...COMPLEMENTO_POSE };
