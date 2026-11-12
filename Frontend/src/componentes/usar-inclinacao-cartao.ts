import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { criarControleInclinacao } from "./inclinacao-cartao";
const PONTEIRO_PRECISO = "(hover: hover) and (pointer: fine)";

export function useInclinacaoCartao(reduzida: boolean, pausada: boolean) {
  const alvo = useRef<HTMLAnchorElement>(null);
  const superficie = useRef<HTMLDivElement>(null);
  const condicao = useRef({ reduzida, pausada });
  const permitir = useCallback(
    () =>
      !condicao.current.reduzida &&
      !condicao.current.pausada &&
      !document.hidden &&
      !document.querySelector("dialog[open]") &&
      !alvo.current?.matches(":focus-visible") &&
      document.documentElement.dataset.movimentos !== "reduzidos" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      window.matchMedia(PONTEIRO_PRECISO).matches,
    [],
  );
  const [controle] = useState(() =>
    criarControleInclinacao({
      permitir,
      lerCaixa: () =>
        alvo.current?.getBoundingClientRect() ?? {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
        },
      aplicar: ({ x, y }) => {
        superficie.current?.style.setProperty("--inclinacao-x", `${x}deg`);
        superficie.current?.style.setProperty("--inclinacao-y", `${y}deg`);
      },
      agendar: (acao) => window.requestAnimationFrame(acao),
      cancelar: (id) => window.cancelAnimationFrame(id),
    }),
  );
  const limpar = useCallback(() => {
    controle.limpar();
    if (alvo.current) alvo.current.dataset.ponteiroAtivo = "false";
  }, [controle]);
  useLayoutEffect(() => {
    condicao.current = { reduzida, pausada };
    limpar();
  }, [reduzida, pausada, limpar]);
  useEffect(() => {
    const ponteiro = window.matchMedia(PONTEIRO_PRECISO);
    const movimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("blur", limpar);
    window.addEventListener("resize", limpar);
    window.addEventListener("scroll", limpar, true);
    document.addEventListener("visibilitychange", limpar);
    ponteiro.addEventListener("change", limpar);
    movimento.addEventListener("change", limpar);
    return () => {
      window.removeEventListener("blur", limpar);
      window.removeEventListener("resize", limpar);
      window.removeEventListener("scroll", limpar, true);
      document.removeEventListener("visibilitychange", limpar);
      ponteiro.removeEventListener("change", limpar);
      movimento.removeEventListener("change", limpar);
      limpar();
    };
  }, [limpar]);
  function mover(evento: PointerEvent<HTMLAnchorElement>) {
    if (evento.pointerType !== "mouse") return;
    if (!permitir()) {
      limpar();
      return;
    }
    if (alvo.current) alvo.current.dataset.ponteiroAtivo = "true";
    controle.mover(evento.clientX, evento.clientY);
  }
  return { alvo, superficie, mover, limpar };
}
