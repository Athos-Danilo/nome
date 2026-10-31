import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Preferencias } from "../perfil/preferencias";
import { GerenciadorAudio, type EstadoAudio } from "./gerenciador";
import { fabricarSom } from "./howler";
import type { EventoReacao } from "../mascote/reacoes";
import type { TipoEfeito } from "./catalogo";

const ContextoAudio = createContext<GerenciadorAudio | null>(null);
export const useAudio = () => useContext(ContextoAudio);
const vazio: EstadoAudio = { faixa: null, previa: false, aviso: "" };
const semObservacao = () => () => {};
export function useEstadoAudio() {
  const audio = useAudio();
  return useSyncExternalStore(
    audio?.observar ?? semObservacao,
    audio?.estado ?? (() => vazio),
    () => vazio,
  );
}

export function ProvedorAudio({
  preferencias,
  menu,
  children,
}: {
  preferencias: Preferencias;
  menu: boolean;
  children: ReactNode;
}) {
  const [audio] = useState(() => new GerenciadorAudio(fabricarSom));
  useEffect(() => {
    audio.preferencias(preferencias);
  }, [audio, preferencias]);
  useEffect(() => {
    audio.prever(null);
    audio.areaMenu(menu);
  }, [audio, menu]);
  useEffect(() => {
    function gesto(evento: Event) {
      if (
        evento.isTrusted &&
        !(
          evento.target instanceof Element &&
          evento.target.closest("[data-audio-menu]")
        )
      )
        audio.desbloquear();
    }
    function clique(evento: MouseEvent) {
      if (!evento.isTrusted || !(evento.target instanceof Element)) return;
      const alvo = evento.target.closest<HTMLElement>(
        "button,a,[role='button']",
      );
      if (
        !alvo ||
        alvo.matches(
          ":disabled,[aria-disabled='true'],[data-audio-menu],.tecla-letra",
        )
      )
        return;
      audio.efeito(
        alvo.closest(".acentos-entrada")
          ? "acento"
          : alvo.textContent?.includes("Apagar posição")
            ? "apagar"
            : "botao",
      );
    }
    const visibilidade = () => audio.visivel(!document.hidden);
    document.addEventListener("pointerdown", gesto, true);
    document.addEventListener("keydown", gesto, true);
    document.addEventListener("click", gesto, true);
    document.addEventListener("click", clique, true);
    document.addEventListener("visibilitychange", visibilidade);
    visibilidade();
    return () => {
      document.removeEventListener("pointerdown", gesto, true);
      document.removeEventListener("keydown", gesto, true);
      document.removeEventListener("click", gesto, true);
      document.removeEventListener("click", clique, true);
      document.removeEventListener("visibilitychange", visibilidade);
      audio.destruir();
    };
  }, [audio]);
  return (
    <ContextoAudio.Provider value={audio}>{children}</ContextoAudio.Provider>
  );
}

export function useTrilhaPartida(ativa: boolean) {
  const audio = useAudio();
  useEffect(() => {
    audio?.partida(ativa);
    return () => audio?.partida(false);
  }, [audio, ativa]);
}

export function useSomReacao(evento?: EventoReacao) {
  const audio = useAudio();
  useEffect(() => {
    if (!evento) return;
    const efeito: Partial<Record<EventoReacao["tipo"], TipoEfeito>> = {
      apresentacao: "dica",
      erro: "erro",
      comemoracao: "acerto",
      turno: "turno",
      sorteio: "sorteio",
      resultado: "resultado",
    };
    const tipo = efeito[evento.tipo];
    if (tipo) audio?.efeito(tipo, `reacao:${evento.id}`);
  }, [audio, evento?.id, evento?.tipo]);
}

export function BotaoMusicaMenu({
  preferencias,
  ocupado,
  aoAlternar,
}: {
  preferencias: Preferencias;
  ocupado: boolean;
  aoAlternar: (novas: Preferencias) => void;
}) {
  const audio = useAudio();
  const ativa = preferencias.musica_menu_ativa;
  return (
    <button
      type="button"
      className="botao-jogo"
      data-audio-menu="true"
      aria-label={ativa ? "Desativar música do menu" : "Ativar música do menu"}
      aria-pressed={ativa}
      disabled={ocupado}
      onClick={() => {
        const novas = { ...preferencias, musica_menu_ativa: !ativa };
        if (!ativa) audio?.desbloquear();
        aoAlternar(novas);
      }}
    >
      <span aria-hidden="true">{ativa ? "♫" : "♪̸"}</span>
    </button>
  );
}
