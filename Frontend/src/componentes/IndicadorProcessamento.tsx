import {
  descreverProcessamento,
  type AcaoProcessamento,
  type ModoProcessamento,
} from "./carregamento";
import { useTempoEspera } from "./usar-tempo-espera";
import "../estilos/carregamento.css";

/** Faixa flutuante sem salto de layout para ações e esperas em jogo. */
export function IndicadorProcessamento({
  ativo,
  acao,
  modo,
  letra,
  participante,
  atrasoMs = 0,
}: {
  ativo: boolean;
  acao: AcaoProcessamento;
  modo: ModoProcessamento;
  letra?: string;
  participante?: string;
  atrasoMs?: number;
}) {
  const chave = `${modo}:${acao}:${letra ?? ""}`;
  const { visivel, decorridoMs } = useTempoEspera(ativo, atrasoMs, chave);
  if (!ativo || !visivel) return null;

  const descricao = descreverProcessamento(
    { acao, modo, letra, participante },
    decorridoMs,
  );

  return (
    <aside
      className="indicador-processamento"
      data-testid="indicador-processamento"
      data-estagio={descricao.estagio}
      role="status"
      aria-live="polite"
    >
      <div className="emblema-processamento" aria-hidden="true">
        {descricao.pecaDestaque ? (
          <span className="peca-destaque">{descricao.pecaDestaque}</span>
        ) : (
          <div className="mini-pecas">
            <span>?</span>
            <span>✦</span>
            <span>D</span>
            <span>✦</span>
          </div>
        )}
      </div>
      <div className="texto-processamento">
        <span className="etiqueta">{descricao.etiqueta}</span>
        <strong className="titulo-processamento">{descricao.titulo}</strong>
        <span className="detalhe-processamento" key={descricao.estagio}>
          {descricao.detalhe}
        </span>
      </div>
      <span className="barra-processamento" aria-hidden="true" />
    </aside>
  );
}
