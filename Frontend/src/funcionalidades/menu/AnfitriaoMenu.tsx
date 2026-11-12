import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Aurelio } from "../mascote/Aurelio";
import type { EventoReacao } from "../mascote/reacoes";
import {
  DURACOES_GESTOS,
  ehGestoMenu,
  surpresasDisponiveis,
  type DirecaoOlhar,
} from "../mascote/gestos-menu";
import { BalaoMenu } from "./BalaoMenu";
import { FALA_TOQUE, FALA_PEDIDO, type ContextoFalas } from "./falas-menu";
import type { useAgendaMenu } from "./usar-agenda-menu";
import "./anfitriao-menu.css";

/** Integra atuação, intenção manual e balão; a agenda continua dona dos acontecimentos. */
export function AnfitriaoMenu({
  agenda,
  conta,
  evento,
  palco,
  contexto,
}: {
  agenda: ReturnType<typeof useAgendaMenu>;
  conta: boolean;
  evento?: EventoReacao;
  palco: RefObject<HTMLDivElement | null>;
  contexto: ContextoFalas;
}) {
  const [visivel, definirVisivel] = useState(false);
  const [pedida, definirPedida] = useState(false);
  const [respostaReduzida, definirRespostaReduzida] = useState(false);
  const [olhar, definirOlhar] = useState<DirecaoOlhar>();
  const numero = useRef(0);
  const candidatos = useMemo(() => surpresasDisponiveis(conta), [conta]);
  const configurar = agenda.configurar;
  useLayoutEffect(() => {
    configurar({
      surpresas: visivel ? candidatos : [],
      duracoesSurpresas: DURACOES_GESTOS,
    });
    return () => configurar({ surpresas: [] });
  }, [candidatos, configurar, visivel]);
  useEffect(() => {
    if (
      (agenda.ativa?.tipo !== "entrada" && agenda.ativa?.tipo !== "surpresa") ||
      agenda.reduzida
    )
      definirPedida(false);
    if (!agenda.reduzida) definirRespostaReduzida(false);
  }, [agenda.ativa?.tipo, agenda.reduzida]);
  const gesto =
    (agenda.ativa?.tipo === "surpresa" || agenda.ativa?.tipo === "interacao") &&
    ehGestoMenu(agenda.ativa.conteudo)
      ? { id: agenda.ativa.id, tipo: agenda.ativa.conteudo }
      : undefined;
  useLayoutEffect(() => {
    if (gesto?.tipo !== "olhar_solo" && gesto?.tipo !== "olhar_galera") {
      definirOlhar(undefined);
      return;
    }
    const origem = palco.current
      ?.querySelector(".aurelio-animado")
      ?.getBoundingClientRect();
    const alvo = palco.current
      ?.closest(".sala-jogo")
      ?.querySelector(
        gesto.tipo === "olhar_solo"
          ? '.cartao-modo[href$="individual/novo"]'
          : '.cartao-modo[href$="galera/novo"]',
      )
      ?.getBoundingClientRect();
    if (!origem || !alvo) return;
    const x = alvo.x + alvo.width / 2 - (origem.x + origem.width * 0.48);
    const y = alvo.y + alvo.height * 0.35 - (origem.y + origem.height * 0.3);
    const comprimento = Math.max(1, Math.hypot(x, y));
    definirOlhar({ x: (x / comprimento) * 16, y: (y / comprimento) * 12 });
  }, [gesto?.id, gesto?.tipo, palco]);
  const ocupado =
    pedida ||
    agenda.ativa?.tipo === "interacao" ||
    agenda.bloqueada ||
    agenda.ausente;
  const resposta =
    respostaReduzida || agenda.ativa?.tipo === "interacao"
      ? FALA_TOQUE
      : pedida
        ? FALA_PEDIDO
        : undefined;
  function ativar() {
    if (ocupado || agenda.ausente || agenda.bloqueada) return;
    if (agenda.reduzida) {
      definirRespostaReduzida(true);
      return;
    }
    if (
      agenda.solicitar({
        id: `toque-aurelio-${++numero.current}`,
        tipo: "interacao",
        conteudo: "reagir_toque",
        duracao: DURACOES_GESTOS.reagir_toque,
      })
    )
      definirPedida(
        agenda.ativa?.tipo === "entrada" || agenda.ativa?.tipo === "surpresa",
      );
  }
  return (
    <>
      <Aurelio
        evento={evento}
        gesto={gesto}
        direcaoOlhar={olhar}
        pausado={agenda.pausada}
        tamanho="grande"
        aoAtivar={ativar}
        aoVer={definirVisivel}
        ocupado={ocupado}
      />
      <BalaoMenu
        key={contexto}
        contexto={contexto}
        ativa={agenda.ativa}
        configurar={configurar}
        resposta={resposta}
      />
      {resposta && (
        <span className="somente-leitor" role="status">
          {`${resposta.texto} ${resposta.destaque}`}
        </span>
      )}
    </>
  );
}
