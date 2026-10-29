import { createContext, useContext, useRef, type ReactNode } from "react";
type ConfirmacaoSaida = (acao: () => void) => void;
const contexto = createContext<{
  registrar: (protecao: ConfirmacaoSaida | null) => void;
  solicitar: (acao: () => void) => void;
}>({ registrar: () => {}, solicitar: (acao) => acao() });
export function ProtecaoNavegacao({ children }: { children: ReactNode }) {
  const protecao = useRef<ConfirmacaoSaida | null>(null);
  const valor = useRef({
    registrar: (nova: ConfirmacaoSaida | null) => {
      protecao.current = nova;
    },
    solicitar: (acao: () => void) => {
      if (protecao.current) protecao.current(acao);
      else acao();
    },
  });
  return (
    <contexto.Provider value={valor.current}>{children}</contexto.Provider>
  );
}
export function useSaidaPartida() {
  return useContext(contexto);
}
