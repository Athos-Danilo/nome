import { Link } from "react-router";
export function CartaoModo({
  modo,
  destino,
  titulo,
  descricao,
  imagens,
}: {
  modo: "solo" | "galera";
  destino: string;
  titulo: string;
  descricao: string;
  imagens?: string[];
}) {
  return (
    <Link to={destino} className={`cartao-modo ${modo}`} aria-label={titulo}>
      <span className="etiqueta">
        {modo === "solo" ? "NO SEU RITMO" : "ATÉ 3 PESSOAS"}
      </span>
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      <span className="arte-cartao" aria-hidden="true">
        {modo === "solo"
          ? ["D", "I", "?"].map((letra) => <i key={letra}>{letra}</i>)
          : imagens?.map((imagem) => (
              <img key={imagem} src={`/avatares/${imagem}.webp`} alt="" />
            ))}
      </span>
      <span className="rodape-cartao">
        {modo === "solo" ? "Escolher desafio" : "Reunir a galera"}
        <b aria-hidden="true">↗</b>
      </span>
    </Link>
  );
}
