import { useEffect, useState } from "react";
import { criarRegistroEntrada, type TipoEntradaMenu } from "./entrada-menu";

const registro = criarRegistroEntrada(() => window.sessionStorage);

export function useEntradaMenu(
  reduzida: boolean,
  contexto: string,
): TipoEntradaMenu {
  const [entrada, definirEntrada] = useState<{
    contexto: string;
    tipo: TipoEntradaMenu;
  }>(() => ({
    contexto,
    tipo: reduzida ? "estatica" : registro.consultar(),
  }));
  // Trocar conta/visitante usa retorno desde o primeiro render desse contexto.
  const tipo = reduzida
    ? "estatica"
    : entrada.contexto !== contexto
      ? "retorno"
      : entrada.tipo;
  useEffect(() => {
    registro.confirmar();
  }, []);
  useEffect(() => {
    definirEntrada((atual) => {
      if (atual.contexto !== contexto)
        return { contexto, tipo: reduzida ? "estatica" : "retorno" };
      if (reduzida && atual.tipo !== "estatica")
        return { ...atual, tipo: "estatica" };
      return atual;
    });
  }, [reduzida, contexto]);
  return tipo;
}
