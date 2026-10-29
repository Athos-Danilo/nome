import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  conectarPartida,
  lerPartida,
  sinalizarPartida,
  type IdentidadeDocumento,
  type Partida,
} from "./api";
let identidade: IdentidadeDocumento | undefined;
function identificar(): IdentidadeDocumento {
  if (identidade) return identidade;
  let aba: string = crypto.randomUUID();
  try {
    aba = sessionStorage.getItem("decifra_aba_jogo") ?? aba;
    sessionStorage.setItem("decifra_aba_jogo", aba);
  } catch {
    /* Sem armazenamento, o retorno é conservado como ambíguo. */
  }
  identidade = { aba_id: aba, documento_id: crypto.randomUUID() };
  return identidade;
}
function navegacao() {
  const entrada = performance.getEntriesByType("navigation")[0];
  return entrada instanceof PerformanceNavigationTiming &&
    ["reload", "navigate", "back_forward"].includes(entrada.type)
    ? entrada.type
    : "desconhecida";
}
export function useConexaoIndividual(
  base: string,
  token: string,
  partida: Partida | undefined,
) {
  const cache = useQueryClient();
  const atual = useRef(partida);
  atual.current = partida;
  const [pronta, definirPronta] = useState(false);
  const [erro, definirErro] = useState("");
  const [semRede, definirSemRede] = useState(!navigator.onLine);
  useEffect(() => {
    if (!partida) return;
    let vivo = true;
    const documento = identificar();
    function aplicar(nova: Partida) {
      if (!vivo) return;
      cache.setQueryData<Partida>(["individual", base], (anterior) =>
        !anterior || nova.versao >= anterior.versao ? nova : anterior,
      );
    }
    async function conectar() {
      try {
        if (!navigator.onLine) {
          definirSemRede(true);
          return;
        }
        const nova =
          atual.current?.estado === "em_andamento"
            ? await conectarPartida(base, documento, navegacao(), token)
            : await lerPartida(base);
        if (!vivo) return;
        aplicar(nova);
        definirPronta(true);
        definirSemRede(false);
        definirErro("");
      } catch (e) {
        if (vivo) {
          definirErro((e as Error).message);
          definirPronta(false);
        }
      }
    }
    async function sinal(tipo: string, persistido = false) {
      const estado = atual.current;
      if (!estado || estado.estado !== "em_andamento") return;
      try {
        aplicar(
          await sinalizarPartida(
            base,
            {
              ...documento,
              evento_id: crypto.randomUUID(),
              versao_esperada: estado.versao,
              tipo,
              persistido,
            },
            token,
          ),
        );
      } catch {
        /* Ausência de confirmação nunca aplica penalidade no cliente. */
      }
    }
    definirPronta(false);
    void conectar();
    const pagehide = (e: PageTransitionEvent) =>
      void sinal("pagehide", e.persisted);
    const pageshow = (e: PageTransitionEvent) => {
      if (e.persisted) void sinal("pageshow", true);
    };
    const offline = () => definirSemRede(true);
    const online = () => void conectar();
    const foco = () => {
      if (document.visibilityState !== "hidden") void conectar();
    };
    const visibilidade = () => {
      if (document.visibilityState === "hidden") void sinal("oculta");
      else void conectar();
    };
    window.addEventListener("pagehide", pagehide);
    window.addEventListener("pageshow", pageshow);
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    window.addEventListener("focus", foco);
    document.addEventListener("visibilitychange", visibilidade);
    const temporizador = setInterval(() => void sinal("atividade"), 15000);
    return () => {
      vivo = false;
      clearInterval(temporizador);
      window.removeEventListener("pagehide", pagehide);
      window.removeEventListener("pageshow", pageshow);
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
      window.removeEventListener("focus", foco);
      document.removeEventListener("visibilitychange", visibilidade);
    };
  }, [base, token, partida?.partida_id, partida?.estado]);
  return { pronta, erro, semRede };
}
