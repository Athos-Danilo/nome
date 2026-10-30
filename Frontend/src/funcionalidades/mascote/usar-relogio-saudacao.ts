import { useEffect, useRef, useState } from "react";
import { DURACAO_SAUDACAO } from "./saudacao";

export function useRelogioSaudacao(
  ativo: boolean,
  origem = 0,
  reinicio: string | number = 0,
  aoConcluir?: () => void,
) {
  const [tempo, definirTempo] = useState(origem);
  const atual = useRef(origem),
    conclusao = useRef(aoConcluir);
  conclusao.current = aoConcluir;
  useEffect(() => {
    atual.current = origem;
    definirTempo(origem);
  }, [origem, reinicio]);
  useEffect(() => {
    if (!ativo) return;
    const inicio = performance.now(),
      base = atual.current;
    let quadro = 0;
    function avancar(agora: number) {
      atual.current = Math.min(DURACAO_SAUDACAO, base + agora - inicio);
      definirTempo(atual.current);
      if (atual.current < DURACAO_SAUDACAO)
        quadro = requestAnimationFrame(avancar);
      else conclusao.current?.();
    }
    quadro = requestAnimationFrame(avancar);
    return () => cancelAnimationFrame(quadro);
  }, [ativo, origem, reinicio]);
  return tempo;
}
