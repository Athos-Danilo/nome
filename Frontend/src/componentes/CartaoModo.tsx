import { CenaModo } from "./CenaModo";
import { Link } from "react-router";
export function CartaoModo({
  modo,
  destino,
  titulo,
  descricao,
  imagens,
  pausada = false,
  reduzida = false,
}: {
  modo: "solo" | "galera";
  destino: string;
  titulo: string;
  descricao: string;
  imagens?: string[];
  pausada?: boolean;
  reduzida?: boolean;
}) {
  return (
    <Link to={destino} className={`cartao-modo ${modo}`} aria-label={titulo}>
      <span className="etiqueta">
        {modo === "solo" ? "NO SEU RITMO" : "ATÉ 3 PESSOAS"}
      </span>
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      <CenaModo
        modo={modo}
        imagens={imagens}
        pausada={pausada}
        reduzida={reduzida}
      />
      <span className="rodape-cartao">
        {modo === "solo" ? "Escolher desafio" : "Reunir a galera"}
        <b aria-hidden="true">↗</b>
      </span>
    </Link>
  );
}
