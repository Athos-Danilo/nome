import { useCallback, useEffect, useRef, useState } from "react";
import { DURACOES_GESTOS, type GestoMenu } from "./gestos-menu";

export type GestoAtivo = { id: string; tipo: GestoMenu };

export function useToqueMascote(prefixo: string) {
  const [contagem, definirContagem] = useState(0);
  const [gesto, definirGesto] = useState<GestoAtivo>();
  const temporizador = useRef<number | undefined>(undefined);
  const contador = useRef(0);

  const limparTemporizador = useCallback(() => {
    if (temporizador.current) {
      window.clearTimeout(temporizador.current);
      temporizador.current = undefined;
    }
  }, []);

  useEffect(() => limparTemporizador, [limparTemporizador]);

  const tocar = useCallback(() => {
    limparTemporizador();
    contador.current += 1;
    const numero = contador.current;
    definirContagem(numero);
    definirGesto({ id: `${prefixo}-toque-${numero}`, tipo: "reagir_toque" });
    temporizador.current = window.setTimeout(
      () => definirGesto(undefined),
      DURACOES_GESTOS.reagir_toque,
    );
  }, [limparTemporizador, prefixo]);

  const limpar = useCallback(() => {
    limparTemporizador();
    definirGesto(undefined);
  }, [limparTemporizador]);

  return { contagem, gesto, tocar, limpar };
}
