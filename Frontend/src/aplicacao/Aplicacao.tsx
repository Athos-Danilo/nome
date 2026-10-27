import { useEffect, useState } from "react";
import { consultarEstadoDaApi } from "../servicos/estado-da-api";

export function Aplicacao() {
  const [situacao, definirSituacao] = useState("Verificando a API…");
  useEffect(() => {
    let ativo = true;
    consultarEstadoDaApi()
      .then((texto) => {
        if (ativo) definirSituacao(texto);
      })
      .catch(() => {
        if (ativo)
          definirSituacao("API indisponível. Inicie o backend na porta 8000.");
      });
    return () => {
      ativo = false;
    };
  }, []);
  return (
    <main>
      <span className="marca">D</span>
      <h1>Decifra</h1>
      <p>Ambiente de desenvolvimento preparado.</p>
      <p role="status">{situacao}</p>
      <small>
        O jogo será implementado nas próximas fases. O protótipo aprovado
        permanece em Doc/Prototipos.
      </small>
    </main>
  );
}
