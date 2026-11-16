import { useEffect, useState } from "react";
import { LIMIARES_ESPERA_MS } from "./carregamento";

/** Acompanha o atraso de exibição e os limiares progressivos enquanto ativo. */
export function useTempoEspera(ativo: boolean, atrasoMs = 0, chave = "") {
  const [visivel, definirVisivel] = useState(ativo && atrasoMs <= 0);
  const [decorridoMs, definirDecorridoMs] = useState(0);

  useEffect(() => {
    if (!ativo) {
      definirVisivel(false);
      definirDecorridoMs(0);
      return;
    }

    definirDecorridoMs(0);
    definirVisivel(atrasoMs <= 0);

    const temporizadores: number[] = [];
    if (atrasoMs > 0) {
      temporizadores.push(
        window.setTimeout(() => definirVisivel(true), atrasoMs),
      );
    }

    temporizadores.push(
      window.setTimeout(
        () => definirDecorridoMs(LIMIARES_ESPERA_MS.processando),
        LIMIARES_ESPERA_MS.processando,
      ),
    );
    temporizadores.push(
      window.setTimeout(
        () => definirDecorridoMs(LIMIARES_ESPERA_MS.despertando),
        LIMIARES_ESPERA_MS.despertando,
      ),
    );

    return () => {
      temporizadores.forEach((id) => window.clearTimeout(id));
    };
  }, [ativo, atrasoMs, chave]);

  return { visivel, decorridoMs };
}
