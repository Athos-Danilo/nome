import { memo } from "react";
import { RECORTES } from "./recortes";
import { CONTORNOS_OLHOS } from "./contornos-olhos";

/** Máscaras e recortes não dependem da pose; preservar IDs exclusivos por personagem. */
export const DefinicoesAurelio = memo(function DefinicoesAurelio({
  id,
}: {
  id: string;
}) {
  const referencia = (nome: string) => `url(#${id}-${nome})`;
  return (
    <defs>
      <filter id={`${id}-alpha-preto`} colorInterpolationFilters="sRGB">
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
        />
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="0 1 1 1" />
        </feComponentTransfer>
      </filter>
      <mask
        id={`${id}-fora-livro`}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1158"
        height="1359"
      >
        <rect width="1158" height="1359" fill="white" />
        <image
          href="/mascote/aurelio-capa-limpa-02.webp"
          width="1158"
          height="1359"
          filter={referencia("alpha-preto")}
        />
      </mask>
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
      <mask
        id={`${id}-silhueta-livro`}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="1158"
        height="1359"
        style={{ maskType: "alpha" }}
      >
        <image
          href="/mascote/aurelio-capa-limpa-02.webp"
          width="1158"
          height="1359"
        />
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
        {Object.entries(RECORTES)
          .filter(
            ([nome]) =>
              !nome.startsWith("perna_") &&
              !nome.includes("braco_direito") &&
              nome !== "luva_direita",
          )
          .map(([nome, caminho]) => (
            <path
              key={nome}
              d={caminho}
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
