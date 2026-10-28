import { ErroDaApi, requisitar } from "../perfil/api";
export type PartidaEmAberto = {
  partida_id: string;
  estado: string;
  pontuacao: number;
  quantidade_palavras: number;
  rodadas_concluidas: number;
};
export async function consultarPartidaEmAberto(): Promise<PartidaEmAberto | null> {
  const dados = await requisitar("/api/partidas/em-aberto");
  if (dados && typeof dados === "object" && "individual" in dados) {
    const partida = dados.individual;
    if (partida === null) return null;
    if (
      partida &&
      typeof partida === "object" &&
      "partida_id" in partida &&
      typeof partida.partida_id === "string" &&
      "estado" in partida &&
      typeof partida.estado === "string" &&
      "pontuacao" in partida &&
      typeof partida.pontuacao === "number" &&
      Number.isInteger(partida.pontuacao) &&
      "quantidade_palavras" in partida &&
      typeof partida.quantidade_palavras === "number" &&
      Number.isInteger(partida.quantidade_palavras) &&
      partida.quantidade_palavras > 0 &&
      "rodadas_concluidas" in partida &&
      typeof partida.rodadas_concluidas === "number" &&
      Number.isInteger(partida.rodadas_concluidas) &&
      partida.rodadas_concluidas >= 0 &&
      partida.rodadas_concluidas <= partida.quantidade_palavras
    )
      return {
        partida_id: partida.partida_id,
        estado: partida.estado,
        pontuacao: partida.pontuacao,
        quantidade_palavras: partida.quantidade_palavras,
        rodadas_concluidas: partida.rodadas_concluidas,
      };
  }
  throw new ErroDaApi(
    "RESPOSTA_INVALIDA",
    "Não foi possível conferir sua partida. Tente novamente.",
  );
}
