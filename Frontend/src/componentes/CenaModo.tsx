import { useRef, useState, type AnimationEvent } from "react";
import { criarCicloPalavras, avancarCicloPalavras } from "./palavras-cena-solo";
import { useInView } from "motion/react";
import { Icone } from "./Icone";
import "./cenas-modos.css";

/** CSS move os quadros; React só acompanha condições, imagem e renovação de palavras. */
export function CenaModo({
  modo,
  imagens = [],
  pausada,
  reduzida,
}: {
  modo: "solo" | "galera";
  imagens?: string[];
  pausada: boolean;
  reduzida: boolean;
}) {
  const elemento = useRef<HTMLSpanElement>(null);
  const visivel = useInView(elemento);
  const estado = reduzida
    ? "reduzida"
    : pausada || !visivel
      ? "pausada"
      : "ativa";
  return (
    <span
      ref={elemento}
      className={`arte-cartao cena-modo cena-${modo}`}
      aria-hidden="true"
      data-cena={estado}
    >
      {modo === "solo" ? (
        <CenaSolo ativa={estado === "ativa"} />
      ) : (
        [0, 1, 2].map((indice) => (
          <RetratoCena
            key={imagens[indice] ?? indice}
            imagem={imagens[indice]}
          />
        ))
      )}
    </span>
  );
}
function CenaSolo({ ativa }: { ativa: boolean }) {
  const [ciclo, definirCiclo] = useState(() => criarCicloPalavras(Math.random));
  const primeira = ciclo.ordem[ciclo.inicio];
  const segunda = ciclo.ordem[ciclo.inicio + 1];
  function aoCompletar(evento: AnimationEvent<HTMLSpanElement>) {
    if (
      !ativa ||
      evento.target !== evento.currentTarget ||
      evento.animationName !== "montar-palavra"
    )
      return;
    // O fim do ciclo está em mistério: nenhuma palavra visível é substituída.
    definirCiclo(avancarCicloPalavras(ciclo, Math.random));
  }
  return (
    <>
      {["D", "I", "?"].map((letra, indice) => (
        <span
          className="peca-solo"
          key={indice}
          onAnimationIteration={indice === 0 ? aoCompletar : undefined}
        >
          <i className="face-misterio">{letra}</i>
          <i className="face-primeira">{primeira[indice]}</i>
          <i className="face-segunda">{segunda[indice]}</i>
        </span>
      ))}
      <span className="descoberta-ilustrada">✦</span>
    </>
  );
}
function RetratoCena({ imagem }: { imagem?: string }) {
  const [falhou, definirFalhou] = useState(false);
  return (
    <span className="retrato-cena" data-falhou={falhou || !imagem}>
      <span className="reserva-retrato">
        <Icone nome="perfil" />
      </span>
      {imagem && !falhou && (
        <img
          src={`/avatares/${imagem}.webp`}
          alt=""
          onError={() => definirFalhou(true)}
        />
      )}
      <span className="vez-ilustrada">✦</span>
    </span>
  );
}
