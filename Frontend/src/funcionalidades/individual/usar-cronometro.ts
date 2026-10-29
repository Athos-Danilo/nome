import { useEffect, useRef, useState } from "react";
import { confirmarTempo, lerPartida, type Partida } from "./api";

export function formatarTempo(ms: number | null | undefined): string {
  if (ms == null) return "Tempo não registrado";
  const segundos = Math.floor(Math.max(0, ms) / 1000);
  const horas = Math.floor(segundos / 3600);
  return [
    ...(horas ? [horas] : []),
    Math.floor(segundos / 60) % 60,
    segundos % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

type Intervalo = [number, number];
export function useCronometro(
  base: string,
  token: string,
  partida: Partida | undefined,
  ativo: boolean,
) {
  const id = partida?.rodada_atual?.rodada_id;
  const [prontaId, definirProntaId] = useState("");
  const pronto = !!id && prontaId === id;
  const [tempo, definirTempo] = useState(0);
  const [aviso, definirAviso] = useState("");
  const [visivel, definirVisivel] = useState(
    document.visibilityState !== "hidden",
  );
  const dados = useRef({
    id: "",
    confirmado: 0,
    origem: 0,
    marco: 0,
    inicio: null as number | null,
    intervalos: [] as Intervalo[],
    emTransito: [] as Intervalo[],
    enviando: null as Promise<boolean> | null,
  });
  const vivo = useRef(true);
  const emAcao = useRef(false);
  const atual = useRef(partida);
  atual.current = partida;
  function agora() {
    const d = dados.current;
    return d.origem + performance.now() - d.marco;
  }
  function fechar() {
    const d = dados.current;
    if (d.inicio !== null) {
      const fim = agora();
      // Um salto longo pode ser suspensão do sistema: não presumir tempo ativo.
      if (fim - d.inicio <= 10000) d.intervalos.push([d.inicio, fim]);
      d.inicio = null;
    }
  }
  async function confirmar(manterViva = false): Promise<boolean> {
    const d = dados.current;
    const continuar =
      d.inicio !== null &&
      !emAcao.current &&
      document.visibilityState !== "hidden" &&
      navigator.onLine;
    fechar();
    if (continuar) d.inicio = agora();
    if (d.enviando) {
      if (!(await d.enviando)) return false;
    }
    // Intervalos antigos sem confirmação não são reconstruídos após ausência.
    d.intervalos = d.intervalos.filter(([a]) => a >= agora() - 25000);
    const intervalos = d.intervalos.splice(0);
    d.emTransito = [...intervalos];
    if (!intervalos.length || !d.id) return true;
    const promessa = (async () => {
      try {
        for (let i = 0; i < intervalos.length; i++) {
          const [a, b] = intervalos[i];
          try {
            const resposta = await confirmarTempo(
              base,
              token,
              d.id,
              a,
              b,
              manterViva,
            );
            d.emTransito.shift();
            d.confirmado =
              resposta.rodada_atual?.tempo_ativo_ms ?? d.confirmado;
          } catch (erro) {
            d.intervalos.unshift(...intervalos.slice(i));
            throw erro;
          }
        }
        if (vivo.current) definirAviso("");
        return true;
      } catch {
        if (vivo.current)
          definirAviso(
            "O tempo ainda não foi confirmado. Tente a ação novamente.",
          );
        return false;
      } finally {
        d.enviando = null;
        d.emTransito = [];
      }
    })();
    d.enviando = promessa;
    return promessa;
  }
  useEffect(() => {
    vivo.current = true;
    if (!id) return;
    dados.current = {
      id,
      confirmado: atual.current?.rodada_atual?.tempo_ativo_ms ?? 0,
      origem: atual.current?.relogio_servidor_ms ?? Date.now(),
      marco: performance.now(),
      inicio: null,
      intervalos: [],
      emTransito: [],
      enviando: null,
    };
    definirProntaId("");
    const d = dados.current;
    let cancelado = false;
    void lerPartida(`${base}/tempo`)
      .then((resposta) => {
        if (cancelado) return;
        d.origem = resposta.relogio_servidor_ms ?? Date.now();
        d.marco = performance.now();
        d.confirmado = resposta.rodada_atual?.tempo_ativo_ms ?? 0;
        definirProntaId(id);
      })
      .catch(() => {
        if (!cancelado)
          definirAviso(
            "Não foi possível sincronizar o relógio. Recarregue para tentar novamente.",
          );
      });
    return () => {
      cancelado = true;
      vivo.current = false;
      if (atual.current?.rodada_atual?.rodada_id === id) {
        fechar();
        void confirmar(true);
      }
    };
  }, [id, base, token]);
  useEffect(() => {
    function ocultar() {
      definirVisivel(document.visibilityState !== "hidden");
      if (document.visibilityState === "hidden") {
        fechar();
        void confirmar(true);
      }
    }
    function sair() {
      fechar();
      void confirmar(true);
    }
    document.addEventListener("visibilitychange", ocultar);
    window.addEventListener("pagehide", sair);
    return () => {
      document.removeEventListener("visibilitychange", ocultar);
      window.removeEventListener("pagehide", sair);
    };
  }, [id]);
  useEffect(() => {
    if (!id) return;
    const d = dados.current;
    let ultimoEnvio = performance.now();
    function atualizar() {
      if (
        pronto &&
        !emAcao.current &&
        ativo &&
        visivel &&
        navigator.onLine &&
        d.inicio === null
      )
        d.inicio = agora();
      if (emAcao.current || !pronto || !ativo || !visivel || !navigator.onLine)
        fechar();
      const parcial =
        d.inicio === null ? 0 : Math.min(10000, agora() - d.inicio);
      definirTempo(
        d.confirmado +
          [...d.intervalos, ...d.emTransito].reduce(
            (s, [a, b]) => s + b - a,
            0,
          ) +
          parcial,
      );
      if (
        performance.now() - ultimoEnvio >= 5000 &&
        pronto &&
        ativo &&
        visivel &&
        navigator.onLine
      ) {
        ultimoEnvio = performance.now();
        void confirmar();
      }
    }
    atualizar();
    const timer = setInterval(atualizar, 100);
    return () => {
      clearInterval(timer);
      fechar();
    };
  }, [id, ativo, visivel, pronto]);
  return {
    tempo,
    confirmar,
    suspender: () => {
      emAcao.current = true;
      fechar();
    },
    liberar: () => {
      emAcao.current = false;
    },
    aviso,
    ativo: pronto && ativo && visivel && navigator.onLine,
  };
}
