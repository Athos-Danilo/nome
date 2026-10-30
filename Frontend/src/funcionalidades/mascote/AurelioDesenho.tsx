import { useId } from "react";
import { m } from "motion/react";
import { DURACOES, type Reacao } from "./reacoes";

/** Desenho autoral em camadas; referências e pivôs documentados em Doc/Aurelio-animado.md. */
export function AurelioDesenho({
  reacao,
  estatico,
  descricao,
  chave,
}: {
  reacao: Reacao;
  estatico: boolean;
  descricao: string;
  chave: string;
}) {
  const id = useId().replaceAll(":", "");
  const tinta = `url(#${id}-tinta)`,
    papel = `url(#${id}-papel)`,
    lima = `url(#${id}-lima)`;
  const alegria = reacao === "comemoracao" || reacao === "resultado";
  const pensando = reacao === "pensamento";
  const erro = reacao === "erro";
  const onda =
    reacao === "saudacao" || reacao === "turno" || reacao === "sorteio";
  const apresentar = reacao === "apresentacao" || reacao === "sorteio";
  const duracao = DURACOES[reacao] / 1000;
  const movimento = estatico
    ? { y: 0, rotate: 0, scale: 1 }
    : alegria
      ? {
          y: [0, -24, 0, -12, 0],
          rotate: [0, -5, 3, -2, 0],
          scale: [1, 1.035, 1],
        }
      : erro
        ? { y: [0, 5, 0], rotate: [0, -4, 4, -2, 0], scale: 1 }
        : { y: [0, -3, 0], rotate: [0, pensando ? -3 : 1.2, 0], scale: 1 };
  const transicao = {
    duration: estatico ? 0 : duracao,
    repeat: !estatico && reacao === "espera" ? Infinity : 0,
  };
  return (
    <svg
      viewBox="0 0 420 500"
      role="img"
      aria-label={descricao}
      className="desenho-aurelio"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-tinta`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#909065" />
          <stop offset=".4" stopColor="#646449" />
          <stop offset="1" stopColor="#454536" />
        </linearGradient>
        <linearGradient id={`${id}-papel`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff7dd" />
          <stop offset="1" stopColor="#e7ce92" />
        </linearGradient>
        <linearGradient id={`${id}-lima`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f2ff9b" />
          <stop offset=".4" stopColor="#d4fe62" />
          <stop offset="1" stopColor="#bddc40" />
        </linearGradient>
        <filter id={`${id}-textura`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".65"
            numOctaves="3"
            seed="12"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".13" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="soft-light" />
        </filter>
        <clipPath id={`${id}-capa`}>
          <path d="M107 108 306 65Q314 65 315 78L329 344Q329 355 317 358L133 393Q122 395 120 382Z" />
        </clipPath>
      </defs>
      <m.ellipse
        cx="211"
        cy="480"
        rx="133"
        ry="9"
        fill="#444439"
        opacity=".13"
        initial={false}
        animate={{ scaleX: !estatico && alegria ? [1, 0.75, 1] : 1 }}
        transition={transicao}
      />
      <m.g
        key={chave}
        data-parte="corpo_inteiro"
        initial={false}
        animate={movimento}
        transition={transicao}
        style={{ originX: 0.5, originY: 1 }}
        stroke="#242018"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <m.g
          data-parte="perna_esquerda"
          initial={false}
          animate={{ rotate: !estatico && alegria ? [0, 12, -4, 0] : 0 }}
          transition={transicao}
          style={{ originX: 0.8, originY: 0 }}
        >
          <path d="M161 375Q145 412 131 442" fill="none" strokeWidth="15" />
          <path
            d="M161 375Q145 412 131 442"
            fill="none"
            stroke="#454235"
            strokeWidth="9"
          />
          <ellipse cx="128" cy="443" rx="23" ry="12" fill={papel} />
          <path
            d="M123 444C91 430 57 457 53 472Q54 489 112 488Q153 487 165 472L158 458Z"
            fill="#c6b762"
          />
          <path
            d="M126 441C93 429 60 448 57 468C64 481 137 488 161 467Q159 450 145 446L143 453Q136 441 126 441Z"
            fill={tinta}
          />
          <path d="M77 455Q82 449 91 449" stroke="#dac66c" strokeWidth="8" />
        </m.g>
        <m.g
          data-parte="perna_direita"
          initial={false}
          animate={{ rotate: !estatico && alegria ? [0, -16, 6, 0] : 0 }}
          transition={transicao}
          style={{ originX: 0.3, originY: 0 }}
        >
          <path d="M248 369Q263 414 251 439" fill="none" strokeWidth="16" />
          <path
            d="M248 369Q263 414 251 439"
            fill="none"
            stroke="#454235"
            strokeWidth="10"
          />
          <ellipse cx="252" cy="441" rx="23" ry="12" fill={papel} />
          <path
            d="M244 443C284 422 326 440 331 466Q330 487 261 486Q222 482 222 468Z"
            fill="#c6b762"
          />
          <path
            d="M241 442Q222 452 225 467C243 484 314 478 328 463C325 440 295 431 278 438L268 451L272 439Q252 437 241 449Z"
            fill={tinta}
          />
          <path d="M294 444l11 4" stroke="#dac66c" strokeWidth="7" />
        </m.g>
        <m.g
          data-parte="braco_direito"
          initial={false}
          animate={{
            rotate: estatico
              ? 0
              : onda
                ? [0, -14, 12, -14, 0]
                : alegria
                  ? [0, -23, -10, 0]
                  : [0, -4, 0],
          }}
          transition={transicao}
          style={{ originX: 0, originY: 0.8 }}
        >
          <path
            d="M310 263C342 288 359 258 367 238"
            fill="none"
            strokeWidth="17"
          />
          <path
            d="M310 260C339 283 355 256 362 238"
            fill="none"
            stroke="#454235"
            strokeWidth="9"
          />
          <path
            d="M358 243C347 241 346 228 355 219Q354 206 366 199Q380 186 377 176C375 159 389 161 391 173Q396 185 389 194Q396 200 408 199C422 200 420 211 407 211Q424 215 413 225Q416 235 401 239Q372 249 366 239Z"
            fill={papel}
          />
          <path
            d="M366 216Q375 210 385 216M392 211Q400 208 409 212M393 224Q402 221 412 225M365 230Q380 243 401 235"
            fill="none"
            strokeWidth="2"
          />
        </m.g>
        <g data-parte="corpo_miolo">
          <path
            d="M68 94Q62 80 78 75L270 33Q281 30 283 43L285 67L104 115Z"
            fill={tinta}
          />
          <path d="M82 81 273 41 270 51 287 64 104 106Z" fill={papel} />
          <path
            d="M91 85 270 48M94 91 274 54M99 98 281 61"
            stroke="#c8ae70"
            strokeWidth="1.5"
            opacity=".65"
          />
          <path
            d="M68 92Q75 89 95 98L113 109 135 389Q108 392 87 377Z"
            fill={tinta}
          />
          <path
            d="M73 139 102 149 103 163 76 154M84 293 119 302 121 319 86 307"
            fill="#d9c36b"
            stroke="none"
          />
          <path d="M78 166l26 9M88 321l34 9" stroke="#d9c36b" strokeWidth="3" />
        </g>
        <g data-parte="corpo_capa">
          <path
            d="M107 108 306 65Q314 65 315 78L329 344Q329 355 317 358L133 393Q122 395 120 382Z"
            fill={tinta}
          />
          <g clipPath={`url(#${id}-capa)`} filter={`url(#${id}-textura)`}>
            <path d="M101 65H335V397H101Z" fill={tinta} stroke="none" />
          </g>
          <path
            d="M113 114 305 74 320 347 132 384Z"
            fill="none"
            stroke="#b4a969"
            strokeWidth="2.7"
          />
          <path
            d="M132 139Q149 135 148 119L282 91Q283 105 302 102L314 321Q298 326 299 341L150 371Q148 353 132 356Z"
            fill="none"
            stroke="#b4a969"
            strokeWidth="1.5"
          />
          <path
            d="M119 121 140 117Q140 133 130 132Q133 144 121 147Z M290 87 303 84 305 104Q291 107 290 87Z M139 366Q150 365 153 375L140 378Z M306 332Q317 326 317 343L307 345Z"
            fill={lima}
            strokeWidth="2"
          />
          <path
            d="M117 110 137 384"
            stroke="#e4d496"
            strokeWidth="2"
            opacity=".5"
          />
        </g>
        <m.g
          data-parte="rosto"
          initial={false}
          animate={{ y: !estatico && erro ? [0, 3, 0] : 0 }}
          transition={transicao}
        >
          <g data-parte="sobrancelhas" fill="#242018" stroke="none">
            <path
              d={
                erro
                  ? "M153 180Q169 153 182 172L181 181Q167 168 153 188Z"
                  : "M151 179Q164 143 178 146Q185 148 186 161Q166 161 151 179Z"
              }
            />
            <path
              d={
                erro
                  ? "M228 152Q243 134 260 157L261 168Q242 150 228 164Z"
                  : "M227 151Q223 124 235 123Q251 124 263 150Q244 135 227 151Z"
              }
            />
          </g>
          <m.g
            data-parte="olhos"
            initial={false}
            animate={{
              scaleY: !estatico && reacao === "espera" ? [1, 1, 1, 0.08, 1] : 1,
            }}
            transition={{
              duration: estatico ? 0 : 4.7,
              repeat: !estatico && reacao === "espera" ? Infinity : 0,
            }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            {alegria ? (
              <g fill="none" strokeWidth="5">
                <path d="M155 215Q166 188 184 207M229 190Q239 165 258 184" />
              </g>
            ) : (
              <>
                <ellipse
                  cx="170"
                  cy="217"
                  rx="23"
                  ry="37"
                  transform="rotate(-14 170 217)"
                  fill={papel}
                />
                <ellipse
                  cx="245"
                  cy="193"
                  rx="22"
                  ry="36"
                  transform="rotate(-12 245 193)"
                  fill={papel}
                />
                <g
                  data-parte="pupilas"
                  transform={pensando ? "translate(7 -9)" : ""}
                  stroke="none"
                >
                  <ellipse cx="163" cy="225" rx="12" ry="23" fill="#1e1b17" />
                  <ellipse cx="237" cy="200" rx="12" ry="23" fill="#1e1b17" />
                  <ellipse cx="159" cy="213" rx="4.5" ry="7" fill="#fffdf0" />
                  <ellipse cx="233" cy="189" rx="4.5" ry="7" fill="#fffdf0" />
                </g>
              </>
            )}
          </m.g>
          <g data-parte="boca">
            {erro ? (
              <path d="M175 284Q211 257 246 271" fill="none" strokeWidth="4" />
            ) : pensando ? (
              <path d="M199 274Q213 263 228 269" fill="none" strokeWidth="4" />
            ) : (
              <>
                <path
                  d="M158 265Q214 291 273 237Q252 309 220 309Q190 308 158 265Z"
                  fill="#221c18"
                />
                <path
                  d="M167 270Q218 289 264 247Q246 279 212 281Q185 282 167 270Z"
                  fill="#fff8e5"
                  strokeWidth="1.5"
                />
                <path
                  d="M207 302Q223 278 244 291Q232 311 220 309Z"
                  fill="#f48d85"
                  strokeWidth="1.5"
                />
              </>
            )}
            <path
              d="M151 271Q151 259 161 258M211 316Q228 323 242 311"
              fill="none"
              strokeWidth="2"
            />
          </g>
        </m.g>
        <m.g
          data-parte="acessorio_gravata"
          initial={false}
          animate={{ rotate: !estatico && alegria ? [0, -9, 9, 0] : 0 }}
          transition={transicao}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <path
            d="M212 340Q185 310 170 326Q165 343 177 369Q187 381 215 352M230 337Q261 303 271 318Q281 333 272 356Q263 368 233 349"
            fill={lima}
          />
          <path
            d="M183 330Q191 329 207 341M243 333Q253 320 264 322"
            fill="none"
            stroke="#f0ffad"
            strokeWidth="4"
          />
          <path d="M201 345l14 1M234 342l13 -4" fill="none" strokeWidth="2" />
          <ellipse cx="223" cy="344" rx="13" ry="16" fill="#7f8e40" />
          <path
            d="M217 334Q225 328 232 338"
            fill="none"
            stroke="#b1bc67"
            strokeWidth="2"
          />
        </m.g>
        <m.g
          data-parte="braco_esquerdo"
          initial={false}
          animate={{
            rotate: estatico
              ? 0
              : pensando
                ? [0, -11, -7, 0]
                : alegria
                  ? [0, 17, 8, 0]
                  : [0, 3, 0],
          }}
          transition={transicao}
          style={{ originX: 0.8, originY: 0.1 }}
        >
          <path d="M96 268Q24 287 55 329" fill="none" strokeWidth="17" />
          <path
            d="M96 265Q30 285 55 326"
            fill="none"
            stroke="#454235"
            strokeWidth="9"
          />
          <path
            d="M52 321Q40 318 39 333Q40 344 51 346Q41 353 46 364Q61 382 86 372Q113 359 104 335Q98 320 80 327Q72 315 65 325Q66 336 57 340"
            fill={papel}
          />
          <path
            d="M53 346Q65 360 79 357M67 361Q76 373 88 366M89 332Q100 342 96 355"
            fill="none"
            strokeWidth="2"
          />
        </m.g>
      </m.g>
      {(pensando || erro || apresentar || alegria || onda) && (
        <m.g
          data-parte="acentos_expressivos"
          initial={false}
          animate={{
            opacity: estatico ? 1 : [0, 1, 1, 0],
            y: estatico ? 0 : [5, -5, 0],
          }}
          transition={transicao}
          fill="#d4fe62"
          stroke="#454536"
          strokeWidth="1.2"
        >
          {pensando ? (
            <text x="338" y="105" fontSize="54" fontWeight="800" stroke="none">
              ?
            </text>
          ) : erro ? (
            <path
              d="M325 117q36 -24 24 -36q-14 -8 -22 1q-3 9 25 9q20 -2 8 -13"
              fill="none"
              strokeWidth="3"
            />
          ) : (
            <>
              <path d="m44 164 8 -17 8 17 17 7 -17 7 -8 17 -8 -17 -17 -7Z" />
              <path d="m347 121 5 -11 5 11 11 5 -11 5 -5 11 -5 -11 -11 -5Z" />
              <path
                d="M326 43l9 -16M347 58l17 -9M303 28l-1 -13"
                strokeWidth="4"
              />
            </>
          )}
        </m.g>
      )}
    </svg>
  );
}
