import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { PointerSensor, PointerActivationConstraints } from "@dnd-kit/dom";
import { Quadradinho } from "./Quadradinho";
import { TeclaArrastavel } from "./TeclaArrastavel";
import {
  ALFABETO,
  NUMEROS,
  acentuar,
  apagar,
  bloqueada,
  familia,
  inserir,
  mover,
  selecionar,
  type Acento,
  type EstadoEntrada,
} from "./modelo";
import { useDigitacao } from "./usar-digitacao";
import { useAudio } from "../audio/ProvedorAudio";
import "./entrada.css";
const SENSORES = [
  PointerSensor.configure({
    activationConstraints(evento) {
      return evento.pointerType === "touch"
        ? [new PointerActivationConstraints.Delay({ value: 250, tolerance: 6 })]
        : [new PointerActivationConstraints.Distance({ value: 7 })];
    },
  }),
];
const ACENTOS: { valor: Acento; nome: string; simbolo: string }[] = [
  { valor: "agudo", nome: "Aplicar acento agudo", simbolo: "´" },
  { valor: "grave", nome: "Aplicar acento grave", simbolo: "`" },
  { valor: "circunflexo", nome: "Aplicar circunflexo", simbolo: "^" },
  { valor: "til", nome: "Aplicar til", simbolo: "~" },
  { valor: "trema", nome: "Aplicar trema", simbolo: "¨" },
  { valor: "nenhum", nome: "Remover acento", simbolo: "Sem acento" },
];
export function EditorResposta({
  estado,
  aoAlterar,
  aoEnviar,
  aoEscolherLetra,
  ocupado = false,
  exibirMontagem = true,
}: {
  estado: EstadoEntrada;
  aoAlterar: Dispatch<SetStateAction<EstadoEntrada>>;
  aoEnviar: (palpite: string) => void;
  aoEscolherLetra?: (letra: string) => void;
  ocupado?: boolean;
  exibirMontagem?: boolean;
}) {
  const area = useRef<HTMLDivElement>(null);
  const audio = useAudio();
  const houveArraste = useRef(false);
  const [arrastada, definirArrastada] = useState("");
  function focar() {
    area.current?.focus({ preventScroll: true });
  }
  function escolher(valor: string, posicao?: number) {
    if (ocupado) return;
    if (estado.acao === "letra") {
      const letra = familia(valor);
      if (!/^[\p{L}0-9]$/u.test(letra)) return;
      if (bloqueada(estado, letra)) {
        aoAlterar((anterior) => ({
          ...anterior,
          aviso:
            "Esta letra está bloqueada nesta sessão. Sua vez foi preservada.",
        }));
        return;
      }
      aoEscolherLetra?.(letra);
      audio?.efeito("tecla");
      return;
    }
    audio?.efeito("tecla");
    aoAlterar((anterior) => inserir(anterior, valor, posicao));
  }
  const { campo, aoTeclar, aoColar, enviar } = useDigitacao({
    estado,
    aoAlterar,
    aoEscolher: escolher,
    aoEnviar,
    ocupado,
    aoAtivarBotao: () => {
      houveArraste.current = false;
    },
  });
  const grupos: number[][] = [[]];
  estado.posicoes.forEach((valor, i) => {
    if (valor === " ") {
      grupos.push([]);
    } else grupos[grupos.length - 1].push(i);
  });
  const base = familia(estado.letras[estado.selecionada] ?? "");
  return (
    <DragDropProvider
      sensors={SENSORES}
      onDragStart={(evento) => {
        audio?.efeito("arrastar");
        houveArraste.current = true;
        const letra = evento.operation.source?.data.letra;
        if (typeof letra === "string") definirArrastada(letra);
      }}
      onDragEnd={(evento) => {
        definirArrastada("");
        if (evento.canceled || ocupado) return;
        const letra = evento.operation.source?.data.letra;
        const posicao = evento.operation.target?.data.posicao;
        if (typeof letra === "string" && typeof posicao === "number")
          escolher(letra, posicao);
      }}
    >
      <div
        ref={area}
        role="group"
        aria-label="Área de montagem"
        tabIndex={0}
        className="editor-resposta"
        aria-busy={ocupado}
        onKeyDown={aoTeclar}
        onPointerDownCapture={() => {
          houveArraste.current = false;
        }}
        onPaste={aoColar}
      >
        {exibirMontagem && (
          <div
            className="resposta-montada"
            aria-label="Quadradinhos da resposta"
          >
            {grupos.map((grupo, i) => (
              <div className="palavra-montada" key={i}>
                {grupo.map((indice) =>
                  estado.posicoes[indice] !== null &&
                  !/^[\p{L}0-9]$/u.test(estado.posicoes[indice]!) ? (
                    <span
                      className="separador"
                      aria-label={`Separador: ${estado.posicoes[indice]}`}
                      key={indice}
                    >
                      {estado.posicoes[indice]}
                    </span>
                  ) : (
                    <Quadradinho
                      key={indice}
                      indice={indice}
                      letra={estado.letras[indice]}
                      fixo={estado.posicoes[indice] !== null}
                      selecionado={estado.selecionada === indice}
                      desabilitado={ocupado || estado.acao === "letra"}
                      aoSelecionar={() => {
                        aoAlterar((anterior) => selecionar(anterior, indice));
                        focar();
                      }}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        )}
        <p className="instrucao-entrada">
          {estado.acao === "letra"
            ? "Escolha uma letra para o painel. Vogais também representam suas versões acentuadas."
            : "Selecione um quadradinho. Clique, arraste uma letra ou use seu teclado."}
        </p>
        {estado.acao === "palpite" && (
          <>
            <div
              className="acentos-entrada"
              role="group"
              aria-label="Acentos da posição selecionada"
            >
              {ACENTOS.map((acento) => (
                <button
                  type="button"
                  key={acento.valor}
                  aria-label={acento.nome}
                  disabled={
                    ocupado ||
                    !/^[AEIOU]$/.test(base) ||
                    (acento.valor === "til" && !"AO".includes(base))
                  }
                  onClick={() => {
                    aoAlterar((anterior) => acentuar(anterior, acento.valor));
                    focar();
                  }}
                >
                  {acento.simbolo}
                </button>
              ))}
            </div>
            <div className="acoes-montagem">
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  aoAlterar((anterior) => mover(anterior, -1));
                  focar();
                }}
                aria-label="Posição anterior"
              >
                ←
              </button>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  aoAlterar((anterior) => apagar(anterior));
                  focar();
                }}
              >
                Apagar posição
              </button>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => {
                  aoAlterar((anterior) => mover(anterior, 1));
                  focar();
                }}
                aria-label="Próxima posição"
              >
                →
              </button>
            </div>
          </>
        )}
        <div className="teclado-entrada" aria-label="Teclado virtual">
          {[
            NUMEROS,
            ALFABETO.slice(0, 10),
            ALFABETO.slice(10, 20),
            ALFABETO.slice(20),
          ].map((linha, i) => (
            <div className="linha-teclas" key={i}>
              {linha.map((letra) => (
                <TeclaArrastavel
                  key={letra}
                  letra={letra}
                  desabilitada={ocupado || bloqueada(estado, letra)}
                  arrastavel={estado.acao === "palpite"}
                  aoEscolher={() => {
                    if (houveArraste.current) return;
                    escolher(letra);
                    focar();
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <label className="acesso-digitacao">
          Usar meu teclado
          <input {...campo} />
        </label>
        <p className="aviso-entrada" role="status" aria-live="polite">
          {estado.aviso}
        </p>
        {estado.acao === "palpite" && (
          <button
            type="button"
            className="acao confirmar-palpite"
            disabled={ocupado}
            onClick={enviar}
          >
            {ocupado ? "Aguarde…" : "Enviar palpite"}
            <span aria-hidden="true">↗</span>
          </button>
        )}
      </div>
      <DragOverlay dropAnimation={null}>
        <span className="letra-arrastada">{arrastada}</span>
      </DragOverlay>
    </DragDropProvider>
  );
}
