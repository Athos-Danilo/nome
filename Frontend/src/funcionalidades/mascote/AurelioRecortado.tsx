import { useId } from "react";
import { DefinicoesAurelio } from "./DefinicoesAurelio";
import { RECORTES, type ParteRecortada } from "./recortes";
import { poseAtuacao } from "./atuacoes";
import { DURACOES, type Reacao } from "./reacoes";
import { EfeitosAurelio } from "./EfeitosAurelio";
import { CONTORNOS_OLHOS } from "./contornos-olhos";

export function AurelioRecortado({
  tempo = 0,
  partes = false,
  descricao = "Aurélio, o dicionário apresentador",
  atuacao = "saudacao",
}: {
  tempo?: number;
  partes?: boolean;
  descricao?: string;
  atuacao?: Reacao;
}) {
  const id = useId().replaceAll(":", "");
  const pose = poseAtuacao(atuacao, tempo);
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
  const neutro = tempo <= 0 || tempo >= DURACOES[atuacao];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1158 1359"
      className="desenho-aurelio recorte-aurelio"
      role="img"
      aria-label={descricao}
      data-arte="png-aprovado"
      data-tempo={Math.round(tempo)}
      data-atuacao={atuacao}
    >
      <DefinicoesAurelio id={id} />
      {pose.saltoY < 0 && (
        <ellipse
          data-parte="sombra_salto"
          cx="500"
          cy="1270"
          rx={290 + pose.saltoY}
          ry="23"
          fill="#444439"
          opacity={0.12 + pose.saltoY / 1000}
        />
      )}
      <g
        data-parte="personagem"
        transform={`translate(${pose.deslocamentoX} ${pose.saltoY}) rotate(${pose.inclinacao} 550 1250)`}
      >
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
            href="/mascote/aurelio-capa-limpa-02.webp"
            width="1158"
            height="1359"
            data-parte="capa_reconstruida"
          />
          <g data-parte="corpo_capa" mask={referencia("silhueta-livro")}>
            <use href={`#${id}-original`} mask={referencia("corpo")} />
          </g>
          <g
            data-parte="corpo_miolo"
            transform={`translate(0 ${pose.paginasY})`}
          >
            {imagem("paginas")}
          </g>
          <g data-parte="rosto">
            <g
              data-parte="sobrancelhas"
              transform={`translate(0 ${pose.sobrancelhaY})`}
            >
              <g transform={girar(pose.sobrancelhaEsquerda, 454, 302)}>
                {imagem("sobrancelha_esquerda")}
              </g>
              <g transform={girar(pose.sobrancelhaDireita, 625, 236)}>
                {imagem("sobrancelha_direita")}
              </g>
            </g>
            {(["esquerdo", "direito"] as const).map((lado, i) => {
              const olho = i ? "olho_direito" : "olho_esquerdo",
                pupila = i ? "pupila_direita" : "pupila_esquerda";
              const cx = i ? 662 : 503,
                cy = i ? 394 : 454;
              return (
                <g key={lado} data-parte={`olho_${lado}`}>
                  {pose.olhos >= 0.18 && (
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
                  )}
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
              <g
                opacity={Math.max(0, 1 - pose.bocaFechada - pose.bocaSurpresa)}
              >
                {imagem("boca")}
              </g>
              {pose.bocaFechada > 0 && (
                <g opacity={pose.bocaFechada}>
                  <path
                    d="M441 557Q548 610 667 550"
                    fill="none"
                    stroke="#241e17"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M432 551 447 565M658 548 674 553"
                    fill="none"
                    stroke="#241e17"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </g>
              )}
              {pose.bocaSurpresa > 0 && (
                <g opacity={pose.bocaSurpresa} transform="rotate(-8 560 597)">
                  <ellipse cx="560" cy="597" rx="28" ry="38" fill="#241e17" />
                  <path
                    d="M544 615Q561 603 578 615"
                    fill="none"
                    stroke="#e49282"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                </g>
              )}
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
      </g>
      <EfeitosAurelio pose={pose} progresso={tempo / DURACOES[atuacao]} />
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
