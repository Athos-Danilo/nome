import { CONTORNOS_OLHOS } from "./contornos-olhos";
import type { PoseCompleta } from "./pose-base";
import type { ParteRecortada } from "./recortes";

export function RostoAurelio({
  id,
  pose,
  imagem,
}: {
  id: string;
  pose: PoseCompleta;
  imagem: (parte: ParteRecortada) => React.ReactNode;
}) {
  const referencia = (nome: string) => `url(#${id}-${nome})`;

  const olhosNeutros =
    Math.abs(pose.pupilaX) < 0.05 &&
    Math.abs(pose.pupilaY) < 0.05 &&
    pose.olhos >= 0.99 &&
    pose.olhoEsquerdo >= 0.99 &&
    pose.olhoDireito >= 0.99 &&
    pose.palpebraFeliz <= 0.01 &&
    pose.palpebraSemicerrada <= 0.01 &&
    pose.palpebraEmpatica <= 0.01;

  const somaBocasAlternativas = Math.min(
    1,
    pose.bocaFechada +
      pose.bocaSurpresa +
      pose.bocaPensativa +
      pose.bocaGargalhada +
      pose.bocaEncabulada,
  );

  return (
    <g data-parte="rosto">
      <g
        data-parte="sobrancelhas"
        transform={`translate(0 ${pose.sobrancelhaY})`}
      >
        <g transform={`rotate(${pose.sobrancelhaEsquerda} 454 302)`}>
          {imagem("sobrancelha_esquerda")}
        </g>
        <g transform={`rotate(${pose.sobrancelhaDireita} 625 236)`}>
          {imagem("sobrancelha_direita")}
        </g>
      </g>

      {(["esquerdo", "direito"] as const).map((lado, i) => {
        const olho = i ? "olho_direito" : "olho_esquerdo";
        const pupila = i ? "pupila_direita" : "pupila_esquerda";
        const cx = i ? 662 : 503;
        const cy = i ? 394 : 454;
        const abertura =
          pose.olhos * (i === 0 ? pose.olhoEsquerdo : pose.olhoDireito);
        const feliz = Math.min(1, Math.max(0, pose.palpebraFeliz));
        const opacidadeAberto = Math.max(0, 1 - feliz * 1.45);
        const desceDetetive = pose.palpebraSemicerrada * 78;
        const desceEmpatica = pose.palpebraEmpatica * 68;
        const inclinacaoEmp = i === 0 ? -16 : 16;

        return (
          <g key={lado} data-parte={`olho_${lado}`}>
            {abertura >= 0.18 && opacidadeAberto > 0.02 && (
              <g
                opacity={opacidadeAberto}
                transform={`translate(0 ${cy}) scale(1 ${abertura}) translate(0 ${-cy})`}
              >
                {olhosNeutros ? (
                  imagem(olho)
                ) : (
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
                      <circle
                        cx={i === 0 ? 488 : 644}
                        cy={i === 0 ? 450 : 395}
                        r="7"
                        fill="#fff8e7"
                        opacity="0.88"
                      />
                    </g>
                    {pose.palpebraSemicerrada > 0.02 && (
                      <g opacity={Math.min(1, pose.palpebraSemicerrada * 1.6)}>
                        <path
                          d={`M${cx - 95} ${cy - 135}H${cx + 95}V${cy - 75 + desceDetetive}Q${cx} ${cy - 58 + desceDetetive} ${cx - 95} ${cy - 75 + desceDetetive}Z`}
                          fill="#696442"
                          stroke="#211b16"
                          strokeWidth="7"
                          strokeLinejoin="round"
                        />
                      </g>
                    )}
                    {pose.palpebraEmpatica > 0.02 && (
                      <g
                        opacity={Math.min(1, pose.palpebraEmpatica * 1.6)}
                        transform={`rotate(${inclinacaoEmp * pose.palpebraEmpatica} ${cx} ${cy - 40})`}
                      >
                        <path
                          d={`M${cx - 105} ${cy - 150}H${cx + 105}V${cy - 78 + desceEmpatica}L${cx - 105} ${cy - 78 + desceEmpatica}Z`}
                          fill="#696442"
                          stroke="#211b16"
                          strokeWidth="7"
                        />
                      </g>
                    )}
                  </g>
                )}
              </g>
            )}

            {feliz > 0.12 && (
              <g opacity={feliz}>
                <path
                  d={`M${cx - 44} ${cy + 10}Q${cx - 2} ${cy - 22} ${cx + 42} ${cy + 4}`}
                  fill="none"
                  stroke="#211b16"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d={`M${cx - 30} ${cy + 2}Q${cx} ${cy - 12} ${cx + 30} ${cy - 2}`}
                  fill="none"
                  stroke="#211b16"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.35"
                />
              </g>
            )}

            {abertura < 0.18 && feliz <= 0.12 && (
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
        <g opacity={Math.max(0, 1 - somaBocasAlternativas)}>{imagem("boca")}</g>

        {pose.bocaFechada > 0.01 && (
          <g opacity={pose.bocaFechada}>
            <path
              d="M441 557Q548 614 667 550"
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

        {pose.bocaSurpresa > 0.01 && (
          <g opacity={pose.bocaSurpresa} transform="rotate(-8 560 597)">
            <ellipse
              cx="560"
              cy="597"
              rx="29"
              ry="39"
              fill="#241e17"
              stroke="#140e0b"
              strokeWidth="4"
            />
            <path
              d="M544 615Q561 603 578 615"
              fill="none"
              stroke="#e49282"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>
        )}

        {pose.bocaPensativa > 0.01 && (
          <g opacity={pose.bocaPensativa}>
            <path
              d="M505 588Q558 574 618 594"
              fill="none"
              stroke="#241e17"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M614 585Q627 593 620 603"
              fill="none"
              stroke="#241e17"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        )}

        {pose.bocaGargalhada > 0.01 && (
          <g opacity={pose.bocaGargalhada}>
            <path
              d="M425 538Q555 596 688 518C680 622 628 696 558 702C490 706 440 632 425 538Z"
              fill="#241e17"
              stroke="#140e0b"
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <path
              d="M446 549Q555 598 666 534Q658 568 634 579Q556 606 468 584Z"
              fill="#fff8e7"
            />
            <path
              d="M498 656Q558 616 614 646C596 684 532 692 498 656Z"
              fill="#e49282"
            />
          </g>
        )}

        {pose.bocaEncabulada > 0.01 && (
          <g opacity={pose.bocaEncabulada}>
            <path
              d="M472 588Q504 568 534 590Q564 610 594 586Q622 566 648 584"
              fill="none"
              stroke="#241e17"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M464 579L476 595M645 574L656 590"
              fill="none"
              stroke="#241e17"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </g>
        )}
      </g>
    </g>
  );
}
