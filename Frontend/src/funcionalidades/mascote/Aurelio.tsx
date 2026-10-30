import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LazyMotion, domAnimation, useInView } from "motion/react";
import { AurelioDesenho } from "./AurelioDesenho";
import {
  concluirReacao,
  DURACOES,
  iniciarReacoes,
  receberReacao,
  type EventoReacao,
  type Reacao,
} from "./reacoes";
import "./mascote.css";

function observarPreferencia(avisar: () => void) {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-movimentos"],
  });
  document.addEventListener("visibilitychange", avisar);
  const aparelho = window.matchMedia("(prefers-reduced-motion: reduce)");
  aparelho.addEventListener("change", avisar);
  return () => {
    observador.disconnect();
    document.removeEventListener("visibilitychange", avisar);
    aparelho.removeEventListener("change", avisar);
  };
}
const lerPreferencia = () =>
  document.documentElement.dataset.movimentos === "reduzidos" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  document.hidden;
const lerServidor = () => true;
export function Aurelio({
  evento,
  repouso = "espera",
  tamanho = "medio",
  descricao = "Aurélio, o dicionário apresentador do Decifra",
  reduzir = false,
  pausado = false,
}: {
  evento?: EventoReacao;
  repouso?: Reacao;
  tamanho?: "pequeno" | "medio" | "grande";
  descricao?: string;
  reduzir?: boolean;
  pausado?: boolean;
}) {
  const [estado, definirEstado] = useState(iniciarReacoes);
  const moldura = useRef<HTMLDivElement>(null);
  const visivel = useInView(moldura);
  const preferencia = useSyncExternalStore(
    observarPreferencia,
    lerPreferencia,
    lerServidor,
  );
  const estatico = reduzir || pausado || preferencia || !visivel;
  useEffect(() => {
    if (evento) definirEstado((e) => receberReacao(e, evento));
  }, [evento?.id, evento?.tipo]);
  useEffect(() => {
    const ativa = estado.ativa;
    if (!ativa || pausado) return;
    const temporizador = window.setTimeout(
      () => definirEstado((e) => concluirReacao(e, ativa.id)),
      DURACOES[ativa.tipo],
    );
    return () => window.clearTimeout(temporizador);
  }, [estado.ativa, pausado]);
  const reacao = estado.ativa?.tipo ?? repouso;
  return (
    <div
      ref={moldura}
      className={`aurelio-animado aurelio-${tamanho}`}
      data-reacao={reacao}
      data-estatico={estatico}
      data-evento={estado.ativa?.id ?? "repouso"}
    >
      <LazyMotion features={domAnimation} strict>
        <AurelioDesenho
          reacao={reacao}
          estatico={estatico}
          descricao={descricao}
          chave={estado.ativa?.id ?? repouso}
        />
      </LazyMotion>
    </div>
  );
}
