import { AurelioRecortado } from "./AurelioRecortado";
import { useRelogioAtuacao } from "./usar-relogio-atuacao";
import { duracaoAtuacao, type TipoAtuacao } from "./atuacao-visual";
import type { DirecaoOlhar } from "./gestos-menu";

/** A atuação é apresentação; todas reutilizam a montagem da saudação aprovada. */
export function AurelioDesenho({
  reacao,
  estatico,
  descricao,
  chave,
  direcaoOlhar,
  preservarPose = false,
}: {
  reacao: TipoAtuacao;
  direcaoOlhar?: DirecaoOlhar;
  preservarPose?: boolean;
  estatico: boolean;
  descricao: string;
  chave: string;
}) {
  const tempo = useRelogioAtuacao(
    !estatico,
    duracaoAtuacao(reacao),
    0,
    chave,
    undefined,
    reacao === "espera",
  );
  return (
    <AurelioRecortado
      tempo={estatico && !preservarPose ? 0 : tempo}
      direcaoOlhar={direcaoOlhar}
      atuacao={reacao}
      descricao={descricao}
    />
  );
}
