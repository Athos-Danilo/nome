import { useEffect, useRef, useState } from "react";

/** Um relógio para todas as partes; só o repouso do jogo se repete. */
export function useRelogioAtuacao(
  ativo: boolean,
  duracao: number,
  origem = 0,
  reinicio: string | number = 0,
  aoConcluir?: () => void,
  repetir = false,
) {
  const [tempo, definirTempo] = useState(origem);
  const atual = useRef(origem),
    conclusao = useRef(aoConcluir);
  conclusao.current = aoConcluir;
  useEffect(() => {
    atual.current = origem;
    definirTempo(origem);
  }, [origem, reinicio, duracao]);
  useEffect(() => {
    if (!ativo) return;
    const inicio = performance.now(),
      base = atual.current;
    let quadro = 0;
    function avancar(agora: number) {
      const decorrido = base + agora - inicio;
      atual.current = repetir
        ? decorrido % duracao
        : Math.min(duracao, decorrido);
      definirTempo(atual.current);
      if (repetir || atual.current < duracao)
        quadro = requestAnimationFrame(avancar);
      else conclusao.current?.();
    }
    quadro = requestAnimationFrame(avancar);
    return () => cancelAnimationFrame(quadro);
  }, [ativo, origem, reinicio, duracao, repetir]);
  return tempo;
}
