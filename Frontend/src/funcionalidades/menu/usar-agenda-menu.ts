import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { AgendaMenu, type OpcoesAgenda } from "./agenda-menu";
import type { AcontecimentoMenu } from "./politica-agenda";

/** Ausência e redução são motivos independentes; voltar à aba não cancela a preferência. */
function lerSinais(elemento: HTMLElement | null) {
  return [
    document.hidden,
    document.documentElement.dataset.movimentos === "reduzidos" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    !!document.querySelector("dialog[open]"),
    !!elemento?.querySelector('[role="alert"]'),
  ]
    .map(Number)
    .join("");
}
const lerServidor = () => "1000";

export function useAgendaMenu(
  elemento: RefObject<HTMLElement | null>,
  contexto: string,
  bloqueioExterno = false,
) {
  const agenda = useMemo(
    () =>
      new AgendaMenu({
        agora: () => performance.now(),
        sortear: () => Math.random(),
        agendar: (acao, atraso) => {
          const id = window.setTimeout(acao, atraso);
          return () => window.clearTimeout(id);
        },
      }),
    [contexto],
  );
  const ler = useCallback(() => lerSinais(elemento.current), [elemento]);
  const observar = useCallback((avisar: () => void) => {
    const aparelho = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observador = new MutationObserver(avisar);
    observador.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open", "data-movimentos"],
    });
    document.addEventListener("visibilitychange", avisar);
    aparelho.addEventListener("change", avisar);
    avisar();
    return () => {
      observador.disconnect();
      document.removeEventListener("visibilitychange", avisar);
      aparelho.removeEventListener("change", avisar);
    };
  }, []);
  const sinais = useSyncExternalStore(observar, ler, lerServidor);
  const estado = useSyncExternalStore(
    agenda.observar,
    agenda.estado,
    agenda.estado,
  );
  const ausente = sinais[0] === "1",
    reduzida = sinais[1] === "1",
    bloqueada = bloqueioExterno || sinais[2] === "1" || sinais[3] === "1";
  useEffect(() => {
    agenda.condicoes({ oculta: ausente, reduzida, bloqueada });
  }, [agenda, ausente, reduzida, bloqueada]);
  useEffect(() => {
    agenda.iniciar();
    return () => agenda.parar();
  }, [agenda]);
  const solicitar = useCallback(
    (evento: AcontecimentoMenu) => agenda.solicitar(evento),
    [agenda],
  );
  const configurar = useCallback(
    (opcoes: OpcoesAgenda) => agenda.configurar(opcoes),
    [agenda],
  );
  return {
    ativa: estado.ativa,
    pausada: ausente || reduzida || bloqueada,
    ausente,
    reduzida,
    bloqueada,
    solicitar,
    configurar,
  };
}
