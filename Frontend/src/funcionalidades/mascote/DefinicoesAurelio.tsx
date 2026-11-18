import { memo } from "react";
import { RECORTES } from "./recortes";
import { CONTORNOS_OLHOS } from "./contornos-olhos";

const PARTES_LIMPEZA_CORPO = [
  "braco_esquerdo",
  "luva_esquerda_limpeza",
  "sobrancelha_esquerda",
  "sobrancelha_direita",
  "olho_esquerdo",
  "olho_direito",
  "pupila_esquerda",
  "pupila_direita",
  "boca",
  "gravata",
  "paginas",
] as const;

/** Máscaras e recortes fixos em 1158 × 1359; IDs exclusivos por instância para evitar colisões. */
export const DefinicoesAurelio = memo(function DefinicoesAurelio({
  id,
}: {
  id: string;
}) {
  return (
    <defs>
      {Object.entries(CONTORNOS_OLHOS).map(([lado, contorno]) => (
        <clipPath key={lado} id={`${id}-contorno-${lado}`}>
          <path d={contorno} />
        </clipPath>
      ))}
      <image
        id={`${id}-original`}
        href="/mascote/aurelio.webp"
        width="1158"
        height="1359"
      />
      <image
        id={`${id}-capa-limpa`}
        href="/mascote/aurelio-capa-limpa-02.webp"
        width="1158"
        height="1359"
      />
      <mask
        id={`${id}-silhueta-livro`}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1158"
        height="1359"
        style={{ maskType: "alpha" }}
      >
        <use href={`#${id}-capa-limpa`} />
      </mask>
      {Object.entries(RECORTES).map(([nome, caminho]) => (
        <clipPath key={nome} id={`${id}-${nome}`}>
          <path d={caminho} />
        </clipPath>
      ))}
      <mask
        id={`${id}-corpo`}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1158"
        height="1359"
      >
        <rect width="1158" height="1359" fill="white" />
        {PARTES_LIMPEZA_CORPO.map((nome) => (
          <path
            key={nome}
            d={RECORTES[nome]}
            fill="black"
            stroke="black"
            strokeWidth={nome.startsWith("sobrancelha_") ? 10 : 0}
          />
        ))}
        {Object.entries(CONTORNOS_OLHOS).map(([lado, caminho]) => (
          <path
            key={`limpeza-${lado}`}
            d={caminho}
            fill="black"
            stroke="black"
            strokeWidth="5"
          />
        ))}
        <path d={RECORTES.boca} fill="black" stroke="black" strokeWidth="12" />
      </mask>
      <linearGradient id={`${id}-creme`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#fff7dc" />
        <stop offset="1" stopColor="#fff8e7" />
      </linearGradient>
    </defs>
  );
});
