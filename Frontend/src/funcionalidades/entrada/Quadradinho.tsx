import { useDroppable } from "@dnd-kit/react";
export function Quadradinho({
  indice,
  letra,
  fixo,
  selecionado,
  desabilitado,
  aoSelecionar,
}: {
  indice: number;
  letra: string;
  fixo: boolean;
  selecionado: boolean;
  desabilitado: boolean;
  aoSelecionar: () => void;
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `posicao-${indice}`,
    data: { posicao: indice },
    disabled: fixo || desabilitado,
  });
  return (
    <button
      ref={ref}
      type="button"
      className="quadradinho"
      aria-label={`Posição ${indice + 1}: ${letra || "vazia"}${fixo ? ", revelada" : ""}`}
      aria-pressed={selecionado}
      data-fixa={fixo || undefined}
      data-alvo={isDropTarget || undefined}
      disabled={fixo || desabilitado}
      onClick={aoSelecionar}
    >
      <span className="caractere" key={letra}>
        {letra}
      </span>
      <small aria-hidden="true">{indice + 1}</small>
    </button>
  );
}
