import { useEffect, useState } from "react";
import {
  MUSICAS,
  MUSICA_MENU,
  EFEITOS,
  type MusicaId,
  type TipoEfeito,
} from "./catalogo";
import { useAudio, useEstadoAudio } from "./ProvedorAudio";
import type { Preferencias } from "../perfil/preferencias";

const NOMES: Record<TipoEfeito, string> = {
  botao: "Botão",
  tecla: "Tecla",
  apagar: "Apagar",
  acento: "Acento",
  arrastar: "Arrastar",
  abrir: "Abrir",
  fechar: "Fechar",
  acerto: "Acerto",
  erro: "Erro",
  dica: "Dica",
  turno: "Passagem de vez",
  sorteio: "Sorteio",
  resultado: "Resultado",
};
export function PreviasAudio({ dados }: { dados: Preferencias }) {
  const audio = useAudio();
  const estado = useEstadoAudio();
  const [efeito, definirEfeito] = useState<TipoEfeito>("acerto");
  useEffect(() => {
    audio?.prever(null);
  }, [audio, dados.musica_id]);
  useEffect(() => () => audio?.prever(null), [audio]);
  return (
    <div className="previas-audio">
      <p>
        Escolha seu clima para a partida. As prévias respeitam os volumes abaixo
        e não alteram sua escolha até salvar.
      </p>
      <div className="controles-audio">
        <button
          type="button"
          className="botao-jogo"
          disabled={
            dados.silenciado || !dados.musica_id || !dados.volume_musica
          }
          onClick={() => {
            audio?.desbloquear();
            audio?.prever(dados.musica_id as MusicaId);
          }}
        >
          Ouvir faixa selecionada
        </button>
        <button
          type="button"
          className="botao-jogo"
          disabled={dados.silenciado || !dados.volume_musica}
          onClick={() => {
            audio?.desbloquear();
            audio?.prever("menu");
          }}
        >
          Ouvir trilha do menu
        </button>
        {estado.previa && (
          <button
            type="button"
            className="botao-jogo"
            onClick={() => audio?.prever(null)}
          >
            Parar prévia
          </button>
        )}
      </div>
      <label>
        Efeito para testar{" "}
        <select
          value={efeito}
          onChange={(evento) =>
            definirEfeito(evento.target.value as TipoEfeito)
          }
        >
          {Object.keys(EFEITOS).map((nome) => (
            <option key={nome} value={nome}>
              {NOMES[nome as TipoEfeito]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="botao-jogo"
        disabled={
          dados.silenciado ||
          !(EFEITOS[efeito] === "interface"
            ? dados.volume_interface
            : dados.volume_eventos)
        }
        onClick={() => {
          audio?.desbloquear();
          audio?.efeito(efeito);
        }}
      >
        Testar efeito
      </button>
      <details className="creditos-audio">
        <summary>Créditos das músicas</summary>
        <p>
          Faixas disponibilizadas pelos autores sob CC0. Conversão e equilíbrio
          de volume para o Decifra.
        </p>
        <ul>
          {[...MUSICAS, MUSICA_MENU].map((faixa) => (
            <li key={faixa.id}>
              <a href={faixa.fonte} target="_blank" rel="noreferrer">
                {faixa.nome}
              </a>{" "}
              — {faixa.autor}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export function AvisoAudio() {
  const audio = useAudio();
  const estado = useEstadoAudio();
  return estado.aviso ? (
    <div className="aviso-audio" role="status">
      <p>{estado.aviso}</p>
      <button
        type="button"
        className="botao-jogo"
        onClick={() => {
          audio?.desbloquear();
          audio?.tentarNovamente();
        }}
      >
        Tentar áudio novamente
      </button>
    </div>
  ) : null;
}
