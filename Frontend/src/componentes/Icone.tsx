import type { ReactNode } from "react";

// Lucide: geometria oficial; licença e origem em Doc/Identidade-visual/icones-interface.md.
const DESENHOS = {
  inicio: (
    <>
      <path d={"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"} />
      <path
        d={
          "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        }
      />
    </>
  ),
  rankings: (
    <>
      <path d={"M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"} />
      <path d={"M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"} />
      <path d={"M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"} />
      <path d={"M4 22h16"} />
      <path d={"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"} />
      <path d={"M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"} />
    </>
  ),
  configuracoes: (
    <>
      <path d={"M14 17H5"} />
      <path d={"M19 7h-9"} />
      <circle cx={"17"} cy={"17"} r={"3"} />
      <circle cx={"7"} cy={"7"} r={"3"} />
    </>
  ),
  sol: (
    <>
      <circle cx={"12"} cy={"12"} r={"4"} />
      <path d={"M12 2v2"} />
      <path d={"M12 20v2"} />
      <path d={"m4.93 4.93 1.41 1.41"} />
      <path d={"m17.66 17.66 1.41 1.41"} />
      <path d={"M2 12h2"} />
      <path d={"M20 12h2"} />
      <path d={"m6.34 17.66-1.41 1.41"} />
      <path d={"m19.07 4.93-1.41 1.41"} />
    </>
  ),
  lua: (
    <>
      <path d={"M18 5h4"} />
      <path d={"M20 3v4"} />
      <path
        d={
          "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
        }
      />
    </>
  ),
  musica: (
    <>
      <path
        d={
          "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"
        }
      />
      <path d={"M16 9a5 5 0 0 1 0 6"} />
      <path d={"M19.364 18.364a9 9 0 0 0 0-12.728"} />
    </>
  ),
  musicaDesativada: (
    <>
      <path
        d={
          "M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z"
        }
      />
      <path d={"m16.5 14.5 5-5"} />
      <path d={"m16.5 9.5 5 5"} />
    </>
  ),
  perfil: (
    <>
      <circle cx={"12"} cy={"8"} r={"5"} />
      <path d={"M20 21a8 8 0 0 0-16 0"} />
    </>
  ),
  historico: (
    <>
      <path d={"M12 6v6l1.5.8"} />
      <path d={"M12.338 21.994a10 10 0 1 1 9.587-8.767"} />
      <path d={"M14 18h8"} />
      <path d={"m18 22-4-4 4-4"} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type NomeIcone = keyof typeof DESENHOS;

export function Icone({ nome }: { nome: NomeIcone }) {
  return (
    <svg
      className="icone-interface"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {DESENHOS[nome]}
    </svg>
  );
}
