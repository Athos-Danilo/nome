import type { CSSProperties } from "react";
import {
  descreverCarregamento,
  type ContextoCarregamento,
} from "./carregamento";
import { useTempoEspera } from "./usar-tempo-espera";
import "../estilos/carregamento.css";

/** Tela de carregamento temática com peças do jogo e mensagens progressivas. */
export function Carregando({
  contexto = "geral",
}: {
  contexto?: ContextoCarregamento;
}) {
  const { decorridoMs } = useTempoEspera(true, 0, contexto);
  const descricao = descreverCarregamento(contexto, decorridoMs);

  return (
    <div
      className="carregando-jogo"
      data-testid="carregando-jogo"
      data-contexto={contexto}
      data-estagio={descricao.estagio}
      role="status"
      aria-live="polite"
    >
      <div className="palco-carregamento">
        <span className="etiqueta">{descricao.etiqueta}</span>
        <div className="pecas-carregamento" aria-hidden="true">
          {descricao.pecas.map((letra, indice) => (
            <span
              key={`${contexto}-${indice}`}
              className="peca-carregamento"
              style={{ "--indice": indice } as CSSProperties}
            >
              {letra}
            </span>
          ))}
        </div>
        <div className="trilha-carregamento" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((passo) => (
            <i key={passo} style={{ "--passo": passo } as CSSProperties} />
          ))}
        </div>
        <p className="titulo-carregamento">{descricao.titulo}</p>
        <p className="subtitulo-carregamento" key={descricao.estagio}>
          {descricao.subtitulo}
        </p>
      </div>
    </div>
  );
}

/** Indicador compacto para consultas em curso dentro de painéis e convites. */
export function CarregandoInline({ texto }: { texto: string }) {
  return (
    <div className="carregando-inline" role="status">
      <span className="mini-pecas-inline" aria-hidden="true">
        <i>D</i>
        <i>✦</i>
        <i>?</i>
      </span>
      <span>{texto}</span>
    </div>
  );
}
