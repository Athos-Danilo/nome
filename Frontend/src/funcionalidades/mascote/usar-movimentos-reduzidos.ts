import { useSyncExternalStore } from "react";

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

export function useMovimentosReduzidos() {
  return useSyncExternalStore(observarPreferencia, lerPreferencia, lerServidor);
}
