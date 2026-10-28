import { useEffect, useRef, useState } from "react";

export function ExcluirConta({
  aberto,
  ocupado,
  erro,
  aoCancelar,
  aoConfirmar,
}: {
  aberto: boolean;
  ocupado: boolean;
  erro: string;
  aoCancelar: () => void;
  aoConfirmar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const [confirmacao, definirConfirmacao] = useState("");
  useEffect(() => {
    const elemento = dialogo.current;
    if (aberto && elemento && !elemento.open) {
      definirConfirmacao("");
      elemento.showModal();
      cancelar.current?.focus();
    } else if (!aberto && elemento?.open) elemento.close();
  }, [aberto]);
  return (
    <dialog
      ref={dialogo}
      aria-labelledby="titulo-excluir"
      aria-describedby="efeitos-excluir"
      onCancel={(evento) => {
        evento.preventDefault();
        if (!ocupado) aoCancelar();
      }}
    >
      <span className="etiqueta">ANTES DE SE DESPEDIR</span>
      <h2 id="titulo-excluir">Excluir sua conta?</h2>
      <p id="efeitos-excluir">
        Seu nome, e-mail, avatar, preferências e acessos serão removidos. Os
        nomes dos convidados das suas partidas também serão apagados.
      </p>
      <p>
        Resultados antigos continuam anônimos como{" "}
        <strong>Jogador excluído</strong>. Ao voltar com o Google, você começa
        do zero, sem recuperar histórico ou pontos.
      </p>
      <label htmlFor="confirmacao-excluir">Digite EXCLUIR</label>
      <input
        id="confirmacao-excluir"
        value={confirmacao}
        disabled={ocupado}
        onChange={(evento) => definirConfirmacao(evento.target.value)}
        autoComplete="off"
      />
      {erro && (
        <p role="alert" className="aviso-erro">
          {erro}
        </p>
      )}
      <div className="acoes-dialogo">
        <button
          ref={cancelar}
          type="button"
          onClick={aoCancelar}
          disabled={ocupado}
        >
          Cancelar
        </button>
        <button
          className="perigo"
          type="button"
          onClick={aoConfirmar}
          disabled={ocupado || confirmacao !== "EXCLUIR"}
        >
          {ocupado ? "Excluindo…" : "Excluir definitivamente"}
        </button>
      </div>
    </dialog>
  );
}
