import { useDraggable } from "@dnd-kit/react";
export function TeclaArrastavel({
  letra,
  desabilitada,
  arrastavel,
  processando = false,
  aoEscolher,
}: {
  letra: string;
  desabilitada: boolean;
  arrastavel: boolean;
  processando?: boolean;
  aoEscolher: () => void;
}) {
  const { ref, isDragging } = useDraggable({
    id: `tecla-${letra}`,
    data: { letra },
    disabled: desabilitada || !arrastavel,
  });
  return (
    <button
      type="button"
      ref={arrastavel ? ref : undefined}
      className="tecla-letra"
      aria-label={`Tecla ${letra}`}
      disabled={desabilitada}
      aria-disabled={desabilitada}
      data-arrastando={isDragging || undefined}
      data-processando={processando || undefined}
      onClick={aoEscolher}
    >
      {letra}
    </button>
  );
}
