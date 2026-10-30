import { AurelioRecortado } from "./AurelioRecortado";
import { useRelogioAtuacao } from "./usar-relogio-atuacao";
import { DURACOES, type Reacao } from "./reacoes";

/** A atuação é apresentação; todas reutilizam a montagem da saudação aprovada. */
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
  const tempo = useRelogioAtuacao(
    !estatico,
    DURACOES[reacao],
    0,
    chave,
    undefined,
    reacao === "espera",
  );
  return (
    <AurelioRecortado
      tempo={estatico ? 0 : tempo}
      atuacao={reacao}
      descricao={descricao}
    />
  );
}
