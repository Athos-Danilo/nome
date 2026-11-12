import { useRef, useState } from "react";
import { useInView } from "motion/react";
import { Icone } from "./Icone";
import "./cenas-modos.css";

/** Ciclos CSS locais; apenas visibilidade e falha de imagem atualizam o React. */
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
  return (
    <span
      ref={elemento}
      className={`arte-cartao cena-modo cena-${modo}`}
      aria-hidden="true"
      data-cena={
        reduzida ? "reduzida" : pausada || !visivel ? "pausada" : "ativa"
      }
    >
      {modo === "solo" ? (
        <CenaSolo />
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
function CenaSolo() {
  return (
    <>
      {["D", "I", "?"].map((letra, indice) => (
        <span className="peca-solo" key={indice}>
          <i className="face-misterio">{letra}</i>
          <i className="face-sol">{"SOL"[indice]}</i>
          <i className="face-lua">{"LUA"[indice]}</i>
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
