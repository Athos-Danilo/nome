import { useEffect, useRef, useState } from "react";

/** Um relógio para todas as partes; só o repouso do jogo se repete. */
export function useRelogioAtuacao(
  ativo: boolean,
  duracao: number,
  origem = 0,
  reinicio: string | number = 0,
  aoConcluir?: () => void,
  repetir = false,
  velocidade = 1,
) {
  const [tempo, definirTempo] = useState(origem);
  const atual = useRef(origem);
  const conclusao = useRef(aoConcluir);
  conclusao.current = aoConcluir;

  useEffect(() => {
    atual.current = origem;
    definirTempo(origem);
  }, [origem, reinicio, duracao]);

  useEffect(() => {
    if (!ativo) return;
    const inicio = performance.now();
    const base = atual.current;
    const fator =
      Number.isFinite(velocidade) && velocidade > 0 ? velocidade : 1;
    let quadro = 0;

    function avancar(agora: number) {
      const decorrido = base + (agora - inicio) * fator;
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
  }, [ativo, origem, reinicio, duracao, repetir, velocidade]);

  return tempo;
}
