import { useEffect, useState, type SubmitEvent } from "react";
import { PALETAS, type Preferencias } from "./preferencias";
import { MUSICAS } from "../audio/catalogo";
import { PreviasAudio } from "../audio/PreviasAudio";

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
  useEffect(() => {
    definirDados((anteriores) => ({ ...anteriores, tema: inicial.tema }));
  }, [inicial.tema]);
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
        <fieldset className="escolha-paletas">
          <legend>Paleta de cores</legend>
          <p>
            Escolha o cenário. Use o botão de lua/sol para alternar entre claro
            e escuro.
          </p>
          <div className="opcoes-paletas">
            {PALETAS.map((paleta) => (
              <label key={paleta} className={`opcao-paleta amostra-${paleta}`}>
                <input
                  type="radio"
                  name="paleta"
                  value={paleta}
                  checked={dados.paleta === paleta}
                  onChange={() => alterar("paleta", paleta)}
                />
                <span className="cores-paleta" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <strong>
                  {paleta === "original"
                    ? "Original"
                    : paleta === "azul"
                      ? "Azul"
                      : paleta === "roxa"
                        ? "Roxa"
                        : "Grafite"}
                </strong>
              </label>
            ))}
          </div>
        </fieldset>
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
            {MUSICAS.map((musica) => (
              <option key={musica.id} value={musica.id}>
                {musica.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="alternativa">
          <input
            type="checkbox"
            checked={dados.musica_menu_ativa}
            onChange={(evento) =>
              alterar("musica_menu_ativa", evento.target.checked)
            }
          />{" "}
          Música exclusiva do menu
        </label>
        <PreviasAudio dados={dados} />
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
