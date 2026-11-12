import { useRef } from "react";
import { useInView } from "motion/react";
import "./cenario-menu.css";

/** Decoração isolada: só a visibilidade muda estado React, nunca cada quadro. */
export function CenarioMenu({
  pausada,
  reduzida,
}: {
  pausada: boolean;
  reduzida: boolean;
}) {
  const elemento = useRef<HTMLDivElement>(null);
  const visivel = useInView(elemento);
  return (
    <div
      ref={elemento}
      className="cenario-menu"
      aria-hidden="true"
      data-cenario={
        reduzida ? "reduzido" : pausada || !visivel ? "pausado" : "ativo"
      }
    >
      <span className="bloco-orbita orbita-a">A</span>
      <span className="bloco-orbita orbita-b">Ç</span>
      <span className="brilho-menu brilho-principal">✦</span>
      <span className="brilho-menu brilho-secundario">✦</span>
      <span className="brilho-menu brilho-terciario">✦</span>
    </div>
  );
}

/** O recorte pertence ao fundo, preservando sombras, foco e controles da moldura. */
export function FundoMenu() {
  return (
    <div className="fundo-menu-ambiente" aria-hidden="true">
      <div className="circulos-menu" />
    </div>
  );
}
