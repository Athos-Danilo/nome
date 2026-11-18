/** Folhas vetoriais no tom do miolo original para animar viradas de página do dicionário. */
export function FolhasAurelio({ folheada }: { folheada: number }) {
  if (folheada <= 0.01) return null;

  const amplitude = Math.sin(Math.min(1, Math.max(0, folheada)) * Math.PI);
  return (
    <g
      data-parte="folhas_livro"
      aria-hidden="true"
      transform="translate(465 135) rotate(-12)"
      opacity={Math.min(1, amplitude * 2.2)}
    >
      {[0, 1, 2].map((indice) => {
        const fase = Math.max(0, Math.min(1, folheada * 1.45 - indice * 0.22));
        const onda = Math.sin(fase * Math.PI);
        const giro = -16 - onda * (58 + indice * 14);
        const abertura = 18 + onda * 38;
        return (
          <g
            key={indice}
            transform={`translate(${-80 + indice * 48} ${12 - onda * 14}) rotate(${giro} 0 0)`}
            opacity={onda > 0.05 ? Math.min(1, onda * 1.6) : 0}
          >
            <path
              d={`M-65 16 Q-6 ${-abertura * 0.72} 102 -6 Q116 ${-abertura * 0.28} 130 6 L10 28 Z`}
              fill="#fce9be"
              stroke="#211b16"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d={`M-30 14 Q18 ${-abertura * 0.5} 104 0`}
              fill="none"
              stroke="#c9b569"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}
