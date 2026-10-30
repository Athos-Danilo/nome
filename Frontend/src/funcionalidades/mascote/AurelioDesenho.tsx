import { AurelioRecortado } from "./AurelioRecortado";
import { useRelogioSaudacao } from "./usar-relogio-saudacao";
import type { Reacao } from "./reacoes";

/** Saudação em revisão; demais atuações mantêm a arte aprovada em pose neutra. */
export function AurelioDesenho({
  reacao,
  estatico,
  descricao,
  chave,
}: {
  reacao: Reacao;
  estatico: boolean;
  descricao: string;
  chave: string;
}) {
  const tempo = useRelogioSaudacao(
    reacao === "saudacao" && !estatico,
    0,
    chave,
  );
  return (
    <AurelioRecortado
      tempo={reacao === "saudacao" && !estatico ? tempo : 0}
      descricao={descricao}
    />
  );
}
