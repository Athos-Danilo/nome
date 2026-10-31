import {
  Component,
  Suspense,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { Botao, Carregando, EstadoVazio } from "./Comuns";

class ProtecaoTela extends Component<
  { children: ReactNode },
  { falhou: boolean }
> {
  state = { falhou: false };
  static getDerivedStateFromError() {
    return { falhou: true };
  }
  render() {
    if (this.state.falhou)
      return (
        <EntradaTela>
          <EstadoVazio titulo="Não foi possível preparar esta tela">
            <p>
              Confira sua conexão e tente recarregar. Seu progresso confirmado
              continua salvo.
            </p>
            <Botao onClick={() => window.location.reload()}>
              Recarregar tela
            </Botao>
          </EstadoVazio>
        </EntradaTela>
      );
    return this.props.children;
  }
}

function EntradaTela({ children }: { children: ReactNode }) {
  const elemento = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const painel = elemento.current;
    if (!painel) return;
    // Consultas e módulos podem terminar depois da navegação; focar somente o primeiro título.
    const observador = new MutationObserver(focar);
    function focar() {
      const titulo = painel?.querySelector<HTMLElement>("h1");
      if (!titulo) return;
      titulo.tabIndex = -1;
      titulo.focus({ preventScroll: true });
      document.title = `${titulo.textContent} — Decifra`;
      observador.disconnect();
    }
    observador.observe(painel, { childList: true, subtree: true });
    focar();
    return () => observador.disconnect();
  }, []);
  return (
    <div ref={elemento} className="entrada-tela">
      {children}
    </div>
  );
}

export function Tela({
  children,
  caminho,
}: {
  children: ReactNode;
  caminho: string;
}) {
  return (
    <ProtecaoTela key={caminho}>
      <Suspense fallback={<Carregando />}>
        <EntradaTela>{children}</EntradaTela>
      </Suspense>
    </ProtecaoTela>
  );
}

/** O valor confirmado fica disponível imediatamente, mesmo sem animação. */
export function ValorAnimado({ valor }: { valor: number | string }) {
  return (
    <span key={valor} className="valor-animado">
      {valor}
    </span>
  );
}
