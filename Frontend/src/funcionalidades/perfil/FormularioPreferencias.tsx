import { useState, type SubmitEvent } from "react";
import type { Preferencias } from "./preferencias";

export function FormularioPreferencias({
  inicial,
  ocupado,
  aoSalvar,
  aoPrever,
  visitante = false,
}: {
  inicial: Preferencias;
  ocupado: boolean;
  aoSalvar: (dados: Preferencias) => void;
  aoPrever: (dados: Preferencias) => void;
  visitante?: boolean;
}) {
  const [dados, definirDados] = useState<Preferencias>({ ...inicial });
  function alterar<C extends keyof Preferencias>(
    campo: C,
    valor: Preferencias[C],
  ) {
    const nova = { ...dados, [campo]: valor };
    definirDados(nova);
    aoPrever(nova);
  }
  function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    aoSalvar(dados);
  }
  return (
    <form onSubmit={enviar} className="formulario-perfil">
      <span className="etiqueta">AJUSTE O CLIMA</span>
      <h1>Do seu jeito</h1>
      <p>
        {visitante
          ? "Suas escolhas ficam neste navegador."
          : "Suas preferências te acompanham em qualquer dispositivo."}
      </p>
      <fieldset disabled={ocupado} className="campos-preferencias">
        <legend className="somente-leitor">
          Preferências de aparência e áudio
        </legend>
        <label>
          Tema
          <select
            value={dados.tema}
            onChange={(evento) =>
              alterar(
                "tema",
                evento.target.value === "escuro" ? "escuro" : "claro",
              )
            }
          >
            <option value="claro">Claro</option>
            <option value="escuro">Escuro</option>
          </select>
        </label>
        <label className="alternativa">
          <input
            type="checkbox"
            checked={dados.movimentos_reduzidos}
            onChange={(evento) =>
              alterar("movimentos_reduzidos", evento.target.checked)
            }
          />{" "}
          Reduzir movimentos
        </label>
        <div className="divisor" />
        <label className="alternativa">
          <input
            type="checkbox"
            checked={dados.silenciado}
            onChange={(evento) => alterar("silenciado", evento.target.checked)}
          />{" "}
          Silenciar tudo
        </label>
        <label>
          Faixa preferida
          <select
            disabled={dados.silenciado}
            value={dados.musica_id ?? ""}
            onChange={(evento) =>
              alterar("musica_id", evento.target.value || null)
            }
          >
            <option value="">Sem música</option>
            <option value="lofi_01">Lo-fi 01</option>
            <option value="lofi_02">Lo-fi 02</option>
            <option value="lofi_03">Lo-fi 03</option>
            <option value="arcade_01">Arcade 01</option>
            <option value="arcade_02">Arcade 02</option>
          </select>
        </label>
        <p className="nota">
          A seleção já fica guardada. As músicas e os efeitos ainda estão em
          preparação.
        </p>
        {(
          [
            ["volume_musica", "Música"],
            ["volume_interface", "Interface e teclado"],
            ["volume_eventos", "Eventos da partida"],
          ] as const
        ).map(([campo, titulo]) => (
          <label key={campo} className="volume">
            <span>
              {titulo}
              <output>{dados[campo]}%</output>
            </span>
            <input
              aria-label={`Volume de ${titulo.toLowerCase()}`}
              type="range"
              min="0"
              max="100"
              value={dados[campo]}
              disabled={dados.silenciado}
              onChange={(evento) => alterar(campo, Number(evento.target.value))}
            />
          </label>
        ))}
      </fieldset>
      <button className="acao botao-grande" disabled={ocupado} type="submit">
        {ocupado ? "Salvando…" : "Salvar preferências"}
      </button>
    </form>
  );
}
