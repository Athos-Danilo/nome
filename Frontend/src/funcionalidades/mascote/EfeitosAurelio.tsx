import type { PoseAtuacao } from "./atuacoes";

/** Acentos de apresentação: não revelam dicas, números de pontos ou o sorteado. */
export function EfeitosAurelio({
  pose,
  progresso,
}: {
  pose: PoseAtuacao;
  progresso: number;
}) {
  const estrela = "M0-24 7-7 24 0 7 7 0 24-7 7-24 0-7-7Z";
  return (
    <g
      data-parte="acentos"
      aria-hidden="true"
      stroke="#29271f"
      strokeWidth="5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {pose.duvida > 0 && (
        <g
          data-efeito="duvida"
          opacity={pose.duvida}
          transform={`translate(875 ${205 - 15 * pose.duvida}) rotate(${4 * Math.sin(progresso * 12)} 0 0)`}
        >
          <circle r="65" fill="#f8f0d7" />
          <path
            d="M-18-20C-17-49 29-47 29-20 29-2 6 1 6 17"
            fill="none"
            strokeWidth="10"
          />
          <circle cx="6" cy="36" r="5" fill="#29271f" stroke="none" />
          <circle cx="-55" cy="80" r="11" fill="#f8f0d7" />
          <circle cx="-76" cy="105" r="5" fill="#f8f0d7" stroke="none" />
        </g>
      )}
      {pose.brilho > 0 && (
        <g
          data-efeito="ideia"
          opacity={pose.brilho}
          transform={`translate(830 220) scale(${0.65 + pose.brilho * 0.35})`}
        >
          <path d={estrela} fill="#d4fe62" transform="scale(1.7)" />
          <path
            d={estrela}
            fill="#e5e37d"
            transform="translate(62 31) scale(.65)"
          />
          <path d="M-15-77-20-99M43-61 57-81M-63-42-82-51" fill="none" />
        </g>
      )}
      {pose.direcao > 0 && (
        <g
          data-efeito="passagem"
          opacity={pose.direcao}
          transform={`translate(${945 + pose.direcao * 30} 245)`}
        >
          <path d="M-50 0H45M15-28 45 0 15 28" fill="none" strokeWidth="10" />
          <path d="M-75-28-66 0-75 28" fill="none" stroke="#8b8669" />
        </g>
      )}
      {pose.suspense > 0 && (
        <g data-efeito="suspense" opacity={pose.suspense}>
          {[-1, 0, 1].map((indice) => (
            <g
              key={indice}
              transform={`translate(${820 + indice * 83} ${150 + Math.sin(progresso * 19 + indice * 1.6) * 16}) rotate(${indice * 12})`}
            >
              <rect
                x="-31"
                y="-43"
                width="62"
                height="86"
                rx="13"
                fill={indice === 0 ? "#d4fe62" : "#f8f0d7"}
              />
              <circle r="9" fill="#444439" />
              <path d="M-13 23H13" fill="none" strokeWidth="4" />
            </g>
          ))}
        </g>
      )}
      {pose.festa > 0 && (
        <g data-efeito="festa" opacity={pose.festa}>
          {[0, 1, 2, 3, 4, 5].map((indice) => {
            const lado = indice % 2 ? 1 : -1;
            const abertura = Math.min(1, progresso * 2.8);
            const x = 550 + lado * (310 + indice * 27) * abertura;
            const y =
              320 + indice * 100 + 90 * Math.pow(progresso, 2) - abertura * 120;
            return (
              <g
                key={indice}
                transform={`translate(${x} ${y}) rotate(${lado * (indice * 17 + progresso * 140)}) scale(${0.65 + pose.festa * 0.5})`}
              >
                <path d={estrela} fill={indice % 3 ? "#d4fe62" : "#e5e37d"} />
                <path d="M-35 28-46 39" fill="none" strokeWidth="4" />
              </g>
            );
          })}
        </g>
      )}
      {pose.medalha > 0 && (
        <g
          data-efeito="conclusao"
          opacity={pose.medalha}
          transform={`translate(880 ${200 - pose.medalha * 20}) scale(${0.8 + pose.medalha * 0.2})`}
        >
          <path d="M-35 30-42 95 0 70 42 95 35 30" fill="#d4fe62" />
          <circle r="61" fill="#e5e37d" />
          <circle r="45" fill="#f8f0d7" strokeWidth="3" />
          <path d="M-20 0-5 16 24-19" fill="none" strokeWidth="9" />
        </g>
      )}
    </g>
  );
}
