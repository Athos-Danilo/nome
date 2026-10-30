import { useId } from "react";
import { RECORTES, type ParteRecortada } from "./recortes";
import { poseSaudacao } from "./saudacao";
import { CONTORNOS_OLHOS } from "./contornos-olhos";

export function AurelioRecortado({
  tempo = 0,
  partes = false,
  descricao = "Aurélio original, saudação em revisão",
}: {
  tempo?: number;
  partes?: boolean;
  descricao?: string;
}) {
  const id = useId().replaceAll(":", "");
  const pose = poseSaudacao(tempo);
  const referencia = (nome: string) => `url(#${id}-${nome})`;
  const imagem = (parte: ParteRecortada) => (
    <use
      href={`#${id}-original`}
      clipPath={referencia(parte)}
      mask={
        parte.startsWith("perna_") || parte === "braco_direito"
          ? referencia("fora-livro")
          : undefined
      }
    />
  );
  const girar = (graus: number, x: number, y: number) =>
    `rotate(${graus} ${x} ${y})`;
  const neutro = tempo <= 0 || tempo >= 5400;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1158 1359"
      className="desenho-aurelio recorte-aurelio"
      role="img"
      aria-label={descricao}
      data-arte="png-aprovado"
      data-tempo={Math.round(tempo)}
    >
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
            href="/mascote/aurelio-capa-limpa-02.png"
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
          href="/mascote/aurelio.png"
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
            href="/mascote/aurelio-capa-limpa-02.png"
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
              <path key={nome} d={caminho} fill="black" />
            ))}
        </mask>
        <linearGradient id={`${id}-creme`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff7dc" />
          <stop offset="1" stopColor="#fff8e7" />
        </linearGradient>
      </defs>
      <g data-parte="encaixes_pernas" fill="none" strokeLinecap="round">
        <path
          d={`M435 ${927 + pose.corpoY - 3}L421 959`}
          stroke="#231e18"
          strokeWidth="46"
        />
        <path
          d={`M435 ${927 + pose.corpoY - 3}L421 959`}
          stroke="#353128"
          strokeWidth="33"
        />
        <path
          d={`M612 ${903 + pose.corpoY - 3}L619 959`}
          stroke="#231e18"
          strokeWidth="49"
        />
        <path
          d={`M612 ${903 + pose.corpoY - 3}L619 959`}
          stroke="#353128"
          strokeWidth="36"
        />
      </g>
      <g
        data-parte="perna_esquerda"
        transform={girar(pose.pernaEsquerda, 427, 927)}
      >
        {imagem("perna_esquerda")}
      </g>
      <g
        data-parte="perna_direita"
        transform={girar(pose.pernaDireita, 606, 915)}
      >
        {imagem("perna_direita")}
      </g>
      <g
        data-parte="corpo_inteiro"
        transform={`translate(0 ${pose.corpoY}) rotate(${pose.corpoRotacao} 554 940) translate(0 940) scale(1 ${pose.corpoEscalaY}) translate(0 -940)`}
      >
        <g data-parte="braco_direito" transform={girar(pose.ombro, 858, 635)}>
          {imagem("braco_direito")}
          <g
            data-parte="antebraco_direito"
            transform={girar(pose.cotovelo, 925, 622)}
          >
            <g data-parte="encaixe_punho" fill="none" strokeLinecap="round">
              <path
                d="M916 635Q935 617 951 600"
                stroke="#231e18"
                strokeWidth="34"
              />
              <path
                d="M916 635Q935 617 951 600"
                stroke="#343027"
                strokeWidth="22"
              />
            </g>
            <g
              data-parte="punho_direito"
              transform={girar(pose.punho, 951, 600)}
            >
              {imagem("luva_direita")}
            </g>
          </g>
        </g>
        <image
          href="/mascote/aurelio-capa-limpa-02.png"
          width="1158"
          height="1359"
          data-parte="capa_reconstruida"
        />
        <g data-parte="corpo_capa" mask={referencia("silhueta-livro")}>
          <use href={`#${id}-original`} mask={referencia("corpo")} />
        </g>
        <g data-parte="corpo_miolo" transform={`translate(0 ${pose.paginasY})`}>
          {imagem("paginas")}
        </g>
        <g data-parte="rosto">
          <g
            data-parte="sobrancelhas"
            transform={`translate(0 ${pose.sobrancelhaY})`}
          >
            {imagem("sobrancelha_esquerda")}
            {imagem("sobrancelha_direita")}
          </g>
          {(["esquerdo", "direito"] as const).map((lado, i) => {
            const olho = i ? "olho_direito" : "olho_esquerdo",
              pupila = i ? "pupila_direita" : "pupila_esquerda";
            const cx = i ? 662 : 503,
              cy = i ? 394 : 454;
            return (
              <g key={lado} data-parte={`olho_${lado}`}>
                <g
                  transform={`translate(0 ${cy}) scale(1 ${pose.olhos}) translate(0 ${-cy})`}
                >
                  {neutro ? (
                    imagem(olho)
                  ) : (
                    <>
                      <g clipPath={referencia(`contorno-${lado}`)}>
                        <path
                          d={CONTORNOS_OLHOS[lado]}
                          fill={referencia("creme")}
                          stroke="#211b16"
                          strokeWidth="9"
                        />
                        <g
                          data-parte={`pupila_${lado}`}
                          transform={`translate(${pose.pupilaX} ${pose.pupilaY})`}
                        >
                          {imagem(pupila)}
                        </g>
                      </g>
                    </>
                  )}
                </g>
                {pose.olhos < 0.18 && (
                  <path
                    d={`M${cx - 40} ${cy + 5}q40 22 78 -16`}
                    fill="none"
                    stroke="#211b16"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                )}
              </g>
            );
          })}
          <g
            data-parte="boca"
            transform={`translate(558 585) scale(${pose.bocaEscala} ${pose.bocaEscala}) translate(-558 -585)`}
          >
            {imagem("boca")}
          </g>
        </g>
        <g
          data-parte="acessorio_gravata"
          transform={girar(pose.gravata, 612, 780)}
        >
          {imagem("gravata")}
        </g>
        <g
          data-parte="braco_esquerdo"
          transform={girar(pose.bracoEsquerdo, 226, 646)}
        >
          {imagem("braco_esquerdo")}
          {imagem("luva_esquerda")}
        </g>
      </g>
      {partes && (
        <g
          fill="none"
          stroke="#e87b54"
          strokeWidth="3"
          strokeDasharray="8 8"
          pointerEvents="none"
        >
          {Object.entries(RECORTES).map(([nome, caminho]) => (
            <path key={nome} d={caminho} />
          ))}
          <g fill="#d4fe62" stroke="#211b16">
            {[
              [858, 635],
              [925, 622],
              [951, 600],
              [612, 780],
              [427, 927],
              [606, 915],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="10" />
            ))}
          </g>
        </g>
      )}
    </svg>
  );
}
