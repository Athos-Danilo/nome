import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { AurelioDesenho } from "./AurelioDesenho";
import { useSomReacao } from "../audio/ProvedorAudio";
import {
  concluirReacao,
  DURACOES,
  iniciarReacoes,
  receberReacao,
  type EventoReacao,
  type Reacao,
} from "./reacoes";
import "./mascote.css";
import { useMovimentosReduzidos } from "./usar-movimentos-reduzidos";

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
  useSomReacao(evento);
  const moldura = useRef<HTMLDivElement>(null);
  const visivel = useInView(moldura);
  const preferencia = useMovimentosReduzidos();
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
      <AurelioDesenho
        reacao={reacao}
        estatico={estatico}
        descricao={descricao}
        chave={estado.ativa?.id ?? repouso}
      />
    </div>
  );
}
