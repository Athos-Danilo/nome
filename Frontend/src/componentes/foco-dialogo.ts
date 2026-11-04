import type { KeyboardEvent } from "react";

export function conterFocoNoDialogo(evento: KeyboardEvent<HTMLDialogElement>) {
  if (evento.key !== "Tab") return;
  const focaveis = Array.from(
    evento.currentTarget.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((controle) => controle.getClientRects().length > 0);
  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];
  if (!primeiro || !ultimo) return;
  if (evento.shiftKey && document.activeElement === primeiro) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primeiro.focus();
  }
}
