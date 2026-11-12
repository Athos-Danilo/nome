import { useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  repertorioDasFalas,
  type ContextoFalas,
  type FalaMenu,
} from "./falas-menu";
import type { AcontecimentoMenu } from "./politica-agenda";
import type { OpcoesAgenda } from "./agenda-menu";
import "./falas-menu.css";

/** A agenda escolhe quando; o balão conserva a última fala durante o descanso. */
export function BalaoMenu({
  contexto,
  ativa,
  configurar,
}: {
  contexto: ContextoFalas;
  ativa: AcontecimentoMenu | null;
  configurar: (opcoes: OpcoesAgenda) => void;
}) {
  const elemento = useRef<HTMLSpanElement>(null);
  const visivel = useInView(elemento);
  const repertorio = repertorioDasFalas(contexto);
  const [exibicao, definirExibicao] = useState<{
    atual: FalaMenu;
    anterior: FalaMenu | null;
    troca: string;
  }>({ atual: repertorio.inicial, anterior: null, troca: "inicial" });
  const ids = useMemo(
    () => repertorio.alternativas.map((fala) => fala.id),
    [repertorio],
  );
  useEffect(() => {
    configurar({ falas: visivel ? ids : [] });
    return () => configurar({});
  }, [configurar, ids, visivel]);
  useEffect(() => {
    if (ativa?.tipo !== "fala") return;
    const fala = repertorio.alternativas.find(
      (fala) => fala.id === ativa.conteudo,
    );
    if (fala)
      definirExibicao((anterior) =>
        anterior.atual.id === fala.id
          ? anterior
          : { atual: fala, anterior: anterior.atual, troca: ativa.id },
      );
  }, [ativa, repertorio]);
  return (
    <span
      ref={elemento}
      className="balao-menu"
      data-visivel={visivel}
      data-contexto={contexto}
      data-fala={exibicao.atual.id}
    >
      <span className="espaco-falas" aria-hidden="true">
        {[repertorio.inicial, ...repertorio.alternativas].map((fala) => (
          <TextoFala key={fala.id} fala={fala} />
        ))}
      </span>
      <span
        key={exibicao.troca}
        className={exibicao.anterior ? "troca-falas" : "fala-inicial"}
      >
        {exibicao.anterior && (
          <span className="fala-anterior" aria-hidden="true">
            <TextoFala fala={exibicao.anterior} />
          </span>
        )}
        <span className="fala-atual">
          <TextoFala fala={exibicao.atual} />
        </span>
      </span>
    </span>
  );
}
function TextoFala({ fala }: { fala: FalaMenu }) {
  return (
    <span>
      {fala.texto}
      <br />
      <b>{fala.destaque}</b>
    </span>
  );
}
