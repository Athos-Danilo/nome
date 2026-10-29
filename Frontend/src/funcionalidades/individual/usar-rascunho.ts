import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { salvarMontagem } from "./api";
import { criarEntrada, type EstadoEntrada } from "../entrada/modelo";
import type { Rodada } from "./api";
export function useRascunho(
  base: string,
  token: string,
  rodada: Rodada,
  versao: number,
) {
  function restaurar() {
    const estado = criarEntrada({
      posicoes: rodada.posicoes,
      limites: rodada.limites,
    });
    return rodada.rascunho
      ? {
          ...estado,
          letras: [...rodada.rascunho.letras],
          selecionada: rodada.rascunho.selecionada,
        }
      : estado;
  }
  const [entrada, definirEntrada] = useState(restaurar);
  const atual = useRef(entrada);
  const revisao = useRef(rodada.rascunho?.revisao ?? 0);
  const versaoAtual = useRef(versao);
  versaoAtual.current = versao;
  const pendente = useRef<EstadoEntrada | null>(null);
  const emCurso = useRef<Promise<boolean> | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const vivo = useRef(true);
  const [aviso, definirAviso] = useState(
    rodada.rascunho ? "Montagem salva" : "As letras em edição serão guardadas.",
  );
  const [erro, definirErro] = useState("");
  async function salvar(manterViva = false): Promise<boolean> {
    clearTimeout(temporizador.current);
    if (emCurso.current) {
      const ok = await emCurso.current;
      return ok ? salvar(manterViva) : false;
    }
    const montagem = pendente.current;
    if (!montagem) return true;
    pendente.current = null;
    const promessa = (async () => {
      try {
        if (vivo.current) {
          definirAviso("Guardando montagem…");
          definirErro("");
        }
        const resposta = await salvarMontagem(
          base,
          {
            versao_esperada: versaoAtual.current,
            rodada_id: rodada.rodada_id,
            revisao_esperada: revisao.current,
            letras: montagem.letras,
            selecionada: montagem.selecionada,
          },
          token,
          manterViva,
        );
        const salva = resposta.rodada_atual?.rascunho;
        if (!salva) throw new Error("Não foi possível confirmar a montagem.");
        revisao.current = salva.revisao;
        if (vivo.current) definirAviso("Montagem salva");
        return true;
      } catch (e) {
        if (!pendente.current) pendente.current = montagem;
        if (vivo.current) {
          definirAviso("Montagem ainda não confirmada");
          definirErro((e as Error).message);
        }
        return false;
      } finally {
        emCurso.current = null;
      }
    })();
    emCurso.current = promessa;
    const ok = await promessa;
    return ok && pendente.current ? salvar(manterViva) : ok;
  }
  const alterar: Dispatch<SetStateAction<EstadoEntrada>> = (mudanca) => {
    const nova =
      typeof mudanca === "function" ? mudanca(atual.current) : mudanca;
    const mudou =
      nova.letras.join("\u0000") !== atual.current.letras.join("\u0000") ||
      nova.selecionada !== atual.current.selecionada;
    atual.current = nova;
    definirEntrada(nova);
    if (mudou) {
      pendente.current = nova;
      definirAviso("Guardando montagem…");
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => void salvar(), 350);
    }
  };
  useEffect(() => {
    vivo.current = true;
    const online = () => void salvar();
    const aoSair = () => void salvar(true);
    window.addEventListener("online", online);
    window.addEventListener("pagehide", aoSair);
    return () => {
      vivo.current = false;
      clearTimeout(temporizador.current);
      window.removeEventListener("online", online);
      window.removeEventListener("pagehide", aoSair);
    };
  }, []);
  return { entrada, alterar, salvar, aviso, erro };
}
