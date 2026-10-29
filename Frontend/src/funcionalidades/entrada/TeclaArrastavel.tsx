import { useDraggable } from "@dnd-kit/react";
export function TeclaArrastavel({
  letra,
  desabilitada,
  arrastavel,
  aoEscolher,
}: {
  letra: string;
  desabilitada: boolean;
  arrastavel: boolean;
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
      ref={ref}
      className="tecla-letra"
      aria-label={`Tecla ${letra}`}
      disabled={desabilitada}
      data-arrastando={isDragging || undefined}
      onClick={aoEscolher}
    >
      {letra}
    </button>
  );
}
