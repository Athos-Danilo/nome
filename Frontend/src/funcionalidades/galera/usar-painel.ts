import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { requisitar, ErroDaApi } from "../perfil/api";
import {
  useCronometro,
  type TransporteRelogio,
} from "../individual/usar-cronometro";
import {
  baseGalera,
  conexaoGalera,
  enviarJogada,
  lerPainel,
  confirmarTempoGalera,
  validarPainel,
  type ComandoGalera,
  type JogoGalera,
} from "./painel-api";

const relogio = (j: JogoGalera) => ({
  rodada_atual: j.painel
    ? { rodada_id: j.painel.sessao_id, tempo_ativo_ms: j.painel.tempo_ativo_ms }
    : null,
  relogio_servidor_ms: j.relogio_servidor_ms,
});
const transporte: TransporteRelogio = {
  ler: async (caminho) => relogio(validarPainel(await requisitar(caminho))),
  confirmar: async (base, token, id, inicio, fim, manterViva) =>
    relogio(
      await confirmarTempoGalera(base, token, id, inicio, fim, manterViva),
    ),
};
let identidade: { aba_id: string; documento_id: string } | undefined;
function identificar() {
  if (!identidade) {
    let aba: string = crypto.randomUUID();
    try {
      aba = sessionStorage.getItem("decifra_aba_galera") ?? aba;
      sessionStorage.setItem("decifra_aba_galera", aba);
    } catch {
      /* Sem armazenamento, preservar ambiguidades. */
    }
    identidade = { aba_id: aba, documento_id: crypto.randomUUID() };
  }
  return identidade;
}
export function usePainelGalera(
  id: string,
  token: string,
  sorteioAberto: boolean,
) {
  const consulta = useQuery({
    queryKey: ["painel-galera", id],
    queryFn: () => lerPainel(id),
    refetchOnWindowFocus: false,
  });
  const [erro, definirErro] = useState("");
  const [ocupado, definirOcupado] = useState(false);
  const [pendente, definirPendente] = useState<ComandoGalera | null>(null);
  const [pronto, definirPronto] = useState(false);
  const [reconexao, definirReconexao] = useState(0);
  const [semRede, definirSemRede] = useState(!navigator.onLine);
  const trava = useRef(false);
  const atual = useRef(consulta.data);
  atual.current = consulta.data;
  const crono = useCronometro(
    baseGalera(id),
    token,
    consulta.data ? relogio(consulta.data) : undefined,
    consulta.data?.painel?.estado === "em_andamento" &&
      pronto &&
      !semRede &&
      !ocupado &&
      !pendente &&
      !sorteioAberto,
    transporte,
  );
  useEffect(() => {
    if (!atual.current) return;
    let vivo = true;
    definirPronto(false);
    const documento = identificar();
    function atualizar(novo: JogoGalera) {
      if (vivo && (!atual.current || novo.versao >= atual.current.versao)) {
        void consulta.refetch();
      }
    }
    async function conectar() {
      const j = atual.current;
      if (!j) return;
      try {
        const entrada = performance.getEntriesByType("navigation")[0] as
          PerformanceNavigationTiming | undefined;
        const novo = await conexaoGalera(
          id,
          {
            ...documento,
            tipo: "conectar",
            navegacao: entrada?.type ?? "desconhecida",
            versao_esperada: j.versao,
          },
          token,
        );
        if (vivo) {
          atualizar(novo);
          definirPronto(true);
          definirSemRede(false);
          definirErro("");
        }
      } catch (e) {
        if (vivo) {
          definirErro((e as Error).message);
          definirPronto(false);
        }
      }
    }
    function sinal(tipo: "pagehide" | "pageshow", evento: PageTransitionEvent) {
      const j = atual.current;
      if (!j || j.estado !== "em_andamento") return;
      void conexaoGalera(
        id,
        {
          ...documento,
          tipo,
          persistido: evento.persisted,
          evento_id: crypto.randomUUID(),
          versao_esperada: j.versao,
        },
        token,
        true,
      )
        .then(atualizar)
        .catch(() => {});
    }
    const esconder = (e: PageTransitionEvent) => sinal("pagehide", e);
    const mostrar = (e: PageTransitionEvent) => {
      if (e.persisted) sinal("pageshow", e);
    };
    const offline = () => definirSemRede(true);
    const online = () => void conectar();
    void conectar();
    window.addEventListener("pagehide", esconder);
    window.addEventListener("pageshow", mostrar);
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      vivo = false;
      window.removeEventListener("pagehide", esconder);
      window.removeEventListener("pageshow", mostrar);
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, [id, token, consulta.data?.partida_id, reconexao]);
  async function executar(dados: ComandoGalera) {
    if (trava.current) return false;
    trava.current = true;
    definirOcupado(true);
    definirErro("");
    crono.suspender();
    try {
      if (!(await crono.confirmar())) return false;
      await enviarJogada(id, dados, token);
      definirPendente(null);
      await consulta.refetch();
      return true;
    } catch (e) {
      definirErro((e as Error).message);
      if (
        e instanceof ErroDaApi &&
        ["CONEXAO_INDISPONIVEL", "RESPOSTA_INVALIDA"].includes(e.codigo)
      )
        definirPendente(dados);
      else {
        definirPendente(null);
        await consulta.refetch();
      }
      return false;
    } finally {
      trava.current = false;
      definirOcupado(false);
      crono.liberar();
    }
  }
  function agir(
    tipo: ComandoGalera["tipo"],
    campos: Partial<ComandoGalera> = {},
  ) {
    const j = consulta.data;
    if (!j || pendente) return Promise.resolve(false);
    return executar({
      ...campos,
      tipo,
      id_acao: crypto.randomUUID(),
      versao_esperada: j.versao,
    });
  }
  return {
    consulta,
    agir,
    ocupado,
    erro,
    pendente,
    semRede,
    pronto,
    reconectar: () => definirReconexao((n) => n + 1),
    crono,
    reenviar: () => (pendente ? executar(pendente) : Promise.resolve(false)),
  };
}
