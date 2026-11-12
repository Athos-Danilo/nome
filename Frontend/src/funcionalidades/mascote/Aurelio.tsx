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
import type { GestoMenu, DirecaoOlhar } from "./gestos-menu";

export function Aurelio({
  evento,
  repouso = "espera",
  tamanho = "medio",
  descricao = "Aurélio, o dicionário apresentador do Decifra",
  reduzir = false,
  pausado = false,
  gesto,
  direcaoOlhar,
  aoAtivar,
  aoVer,
  ocupado = false,
}: {
  evento?: EventoReacao;
  repouso?: Reacao;
  tamanho?: "pequeno" | "medio" | "grande";
  descricao?: string;
  reduzir?: boolean;
  pausado?: boolean;
  gesto?: { id: string; tipo: GestoMenu };
  direcaoOlhar?: DirecaoOlhar;
  aoAtivar?: () => void;
  aoVer?: (visivel: boolean) => void;
  ocupado?: boolean;
}) {
  const contagem = useRef({ id: "", restante: 0 });
  const [estado, definirEstado] = useState(iniciarReacoes);
  useSomReacao(evento);
  const moldura = useRef<HTMLDivElement>(null);
  const visivel = useInView(moldura);
  useEffect(() => {
    aoVer?.(visivel);
  }, [aoVer, visivel]);
  const preferencia = useMovimentosReduzidos();
  const estatico = reduzir || pausado || preferencia || !visivel;
  useEffect(() => {
    if (evento) definirEstado((e) => receberReacao(e, evento));
    // No menu, cancelar a entrada preserva o botão e o foco; partidas mantêm seu contrato.
    else if (aoAtivar) definirEstado(iniciarReacoes());
  }, [evento?.id, evento?.tipo, !!aoAtivar]);
  useEffect(() => {
    const ativa = estado.ativa;
    if (!ativa) return;
    if (contagem.current.id !== ativa.id)
      contagem.current = { id: ativa.id, restante: DURACOES[ativa.tipo] };
    if (pausado) return;
    const inicio = performance.now();
    const temporizador = window.setTimeout(
      () => definirEstado((e) => concluirReacao(e, ativa.id)),
      contagem.current.restante,
    );
    return () => {
      window.clearTimeout(temporizador);
      contagem.current.restante = Math.max(
        0,
        contagem.current.restante - (performance.now() - inicio),
      );
    };
  }, [estado.ativa, pausado]);
  const reacao = gesto?.tipo ?? estado.ativa?.tipo ?? repouso;
  return (
    <div
      ref={moldura}
      className={`aurelio-animado aurelio-${tamanho}`}
      data-reacao={reacao}
      data-estatico={estatico}
      data-evento={gesto?.id ?? estado.ativa?.id ?? "repouso"}
    >
      <AurelioDesenho
        reacao={reacao}
        estatico={estatico}
        descricao={descricao}
        chave={gesto?.id ?? estado.ativa?.id ?? repouso}
        direcaoOlhar={direcaoOlhar}
        preservarPose={!!gesto && !reduzir && !preferencia}
      />
      {aoAtivar && (
        <button
          type="button"
          className="interagir-aurelio"
          aria-label="Conversar com Aurélio"
          aria-disabled={ocupado}
          title="Toque ou clique para conversar com Aurélio"
          onClick={() => {
            if (!ocupado) aoAtivar();
          }}
        />
      )}
    </div>
  );
}
