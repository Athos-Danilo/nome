import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { Link } from "react-router";

export function Botao({
  className = "",
  ...propriedades
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...propriedades} className={`botao-jogo ${className}`} />;
}
export function EstadoVazio({
  titulo,
  children,
  simbolo = "✦",
}: {
  titulo: string;
  children: ReactNode;
  simbolo?: string;
}) {
  return (
    <section className="estado-vazio">
      <span className="emblema-vazio" aria-hidden="true">
        {simbolo}
      </span>
      <h1 tabIndex={-1}>{titulo}</h1>
      {children}
    </section>
  );
}
export function Carregando() {
  return (
    <div className="carregando-jogo" role="status">
      <span aria-hidden="true">D</span>
      <p>Preparando suas próximas descobertas…</p>
    </div>
  );
}
export function VoltarAoMenu() {
  return (
    <Link className="voltar-menu" to="/">
      ← <span>Voltar ao menu</span>
    </Link>
  );
}
export function Dialogo({
  aberto,
  titulo,
  children,
  aoFechar,
  textoFechar = "Entendi",
  etiqueta = "UMA DICA ANTES DAS DICAS",
}: {
  aberto: boolean;
  titulo: string;
  children: ReactNode;
  aoFechar: () => void;
  textoFechar?: string;
  etiqueta?: string;
}) {
  const tituloId = useId();
  const elemento = useRef<HTMLDialogElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialogo = elemento.current;
    if (!aberto || !dialogo) return;
    const anterior = document.activeElement;
    dialogo.showModal();
    fechar.current?.focus();
    return () => {
      dialogo.close();
      if (anterior instanceof HTMLElement && anterior.isConnected)
        anterior.focus();
    };
  }, [aberto]);
  return (
    <dialog
      ref={elemento}
      aria-labelledby={tituloId}
      onCancel={(evento) => {
        evento.preventDefault();
        aoFechar();
      }}
    >
      <span className="etiqueta">{etiqueta}</span>
      <h2 id={tituloId}>{titulo}</h2>
      {children}
      <div className="acoes-dialogo">
        <button className="acao" ref={fechar} onClick={aoFechar}>
          {textoFechar}
        </button>
      </div>
    </dialog>
  );
}
