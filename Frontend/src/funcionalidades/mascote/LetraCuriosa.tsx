import type { PoseGestoMenu } from "./gestos-menu";
/** O olhar e a letra usam a mesma pose, sem outro ciclo ou relógio. */
export function LetraCuriosa({ pose }: { pose: PoseGestoMenu }) {
  if (pose.letra <= 0) return null;
  return (
    <g
      aria-hidden="true"
      data-efeito="letra-curiosa"
      opacity={pose.letra}
      transform={`translate(${pose.letraX} ${pose.letraY}) rotate(${pose.letraGiro})`}
    >
      <rect
        x="-44"
        y="-48"
        width="88"
        height="96"
        rx="20"
        fill="#d4fe62"
        stroke="#29271f"
        strokeWidth="5"
      />
      <text
        textAnchor="middle"
        y="23"
        fill="#444439"
        fontFamily="Bricolage, sans-serif"
        fontWeight="800"
        fontSize="68"
      >
        A
      </text>
    </g>
  );
}
