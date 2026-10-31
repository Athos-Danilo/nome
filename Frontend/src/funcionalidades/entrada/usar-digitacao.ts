import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type KeyboardEvent,
  type InputHTMLAttributes,
  type CompositionEvent,
  type ChangeEvent,
  type ClipboardEvent,
} from "react";
import {
  inserir,
  montarPalpite,
  mover,
  selecionar,
  apagar,
  type EstadoEntrada,
} from "./modelo";
import { useAudio } from "../audio/ProvedorAudio";
export function useDigitacao({
  estado,
  aoAlterar,
  aoEscolher,
  aoEnviar,
  ocupado,
  aoAtivarBotao,
}: {
  estado: EstadoEntrada;
  aoAlterar: Dispatch<SetStateAction<EstadoEntrada>>;
  aoEscolher: (valor: string) => void;
  aoEnviar: (palpite: string) => void;
  ocupado: boolean;
  aoAtivarBotao: () => void;
}) {
  const composicao = useRef(false);
  const audio = useAudio();
  const ignorarFinal = useRef("");
  const [texto, definirTexto] = useState("");
  function inserirTexto(valor: string) {
    if (ocupado) return;
    const normal = valor.normalize("NFC").toUpperCase();
    if (estado.acao === "letra") {
      const letras = [...normal].filter((c) => /^[\p{L}0-9]$/u.test(c));
      if (letras.length === 1) aoEscolher(letras[0]);
      else
        aoAlterar((anterior) => ({
          ...anterior,
          aviso: "Escolha uma única letra ou um número por vez.",
        }));
      return;
    }
    if (/[\p{L}0-9]/u.test(normal)) audio?.efeito("tecla");
    aoAlterar((anterior) => {
      let proximo = anterior;
      const caracteres = [...normal].filter((c) => /^[\p{L}0-9]$/u.test(c));
      for (let i = 0; i < caracteres.length; i++) {
        const posicao = proximo.selecionada;
        proximo = inserir(proximo, caracteres[i]);
        if (proximo.aviso) break;
        if (proximo.selecionada === posicao) {
          if (i < caracteres.length - 1)
            proximo = {
              ...proximo,
              aviso:
                "O texto ultrapassa as posições disponíveis. O excesso não foi inserido.",
            };
          break;
        }
      }
      return proximo;
    });
  }
  function enviar() {
    if (ocupado) return;
    const palpite = montarPalpite(estado);
    if (palpite === null) {
      aoAlterar((anterior) => ({
        ...anterior,
        aviso: "Preencha todos os quadradinhos antes de enviar.",
      }));
      return;
    }
    aoEnviar(palpite);
  }
  function digitar(evento: KeyboardEvent<HTMLDivElement>) {
    if (
      ocupado ||
      evento.nativeEvent.isComposing ||
      composicao.current ||
      evento.ctrlKey ||
      evento.metaKey ||
      evento.altKey
    )
      return;
    ignorarFinal.current = "";
    if (evento.target instanceof HTMLButtonElement) {
      if (evento.key === "Enter" || evento.key === " ") aoAtivarBotao();
      return;
    }
    const tecla = evento.key;
    if (tecla === "Enter") {
      evento.preventDefault();
      if (estado.acao === "palpite") enviar();
      return;
    }
    if (tecla === "ArrowLeft" || tecla === "ArrowRight") {
      evento.preventDefault();
      aoAlterar((anterior) => mover(anterior, tecla === "ArrowLeft" ? -1 : 1));
      return;
    }
    if (tecla === "Home" || tecla === "End") {
      evento.preventDefault();
      aoAlterar((anterior) => {
        const indices = anterior.posicoes.flatMap((c, i) =>
          c === null ? [i] : [],
        );
        return selecionar(
          anterior,
          indices[tecla === "Home" ? 0 : indices.length - 1] ?? -1,
        );
      });
      return;
    }
    if (tecla === "Backspace" || tecla === "Delete") {
      audio?.efeito("apagar");
      evento.preventDefault();
      aoAlterar((anterior) => apagar(anterior, tecla === "Backspace"));
      return;
    }
    if (evento.target instanceof HTMLInputElement) return;
    if (/^[\p{L}0-9]$/u.test(tecla.normalize("NFC"))) {
      evento.preventDefault();
      aoEscolher(tecla);
    }
  }

  const campo: InputHTMLAttributes<HTMLInputElement> = {
    "aria-label": "Digitação pelo teclado",
    autoComplete: "off",
    autoCapitalize: "characters",
    spellCheck: false,
    value: texto,
    disabled: ocupado,
    onCompositionStart: () => {
      composicao.current = true;
      ignorarFinal.current = "";
    },
    onCompositionEnd: (evento: CompositionEvent<HTMLInputElement>) => {
      composicao.current = false;
      const valor = evento.data || evento.currentTarget.value;
      inserirTexto(valor);
      ignorarFinal.current = valor.normalize("NFC");
      definirTexto("");
    },
    onChange: (evento: ChangeEvent<HTMLInputElement>) => {
      const valor = evento.currentTarget.value;
      if (composicao.current) {
        definirTexto(valor);
        return;
      }
      if (
        ignorarFinal.current &&
        valor.normalize("NFC") === ignorarFinal.current
      ) {
        ignorarFinal.current = "";
        definirTexto("");
        return;
      }
      ignorarFinal.current = "";
      inserirTexto(valor);
      definirTexto("");
    },
  };
  function aoColar(evento: ClipboardEvent<HTMLDivElement>) {
    if (ocupado || composicao.current) return;
    evento.preventDefault();
    ignorarFinal.current = "";
    inserirTexto(evento.clipboardData.getData("text"));
  }
  return { campo, aoTeclar: digitar, aoColar, enviar };
}
