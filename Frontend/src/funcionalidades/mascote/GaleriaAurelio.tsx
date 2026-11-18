import { useEffect, useRef, useState } from "react";
import { Botao } from "../../componentes/Comuns";
import { AurelioRecortado } from "./AurelioRecortado";
import { REACOES } from "./reacoes";
import { GESTOS_MENU, ehGestoMenu } from "./gestos-menu";
import { duracaoAtuacao, poseVisual, type TipoAtuacao } from "./atuacao-visual";
import { REPERTORIO_GESTOS } from "./repertorio-gestos-menu";
import { REPERTORIO } from "./repertorio";
import { useRelogioAtuacao } from "./usar-relogio-atuacao";
import { useMovimentosReduzidos } from "./usar-movimentos-reduzidos";
import type { PoseCompleta } from "./pose-base";
import { DURACAO_BLENDING_MS, misturarPoses } from "./transicao-poses";
import "./mascote.css";

const TODAS_ATUACOES: readonly TipoAtuacao[] = [...REACOES, ...GESTOS_MENU];
const VELOCIDADES = [0.25, 0.5, 1] as const;

export function GaleriaAurelio() {
  const [atuacao, definirAtuacao] = useState<TipoAtuacao>("saudacao");
  const roteiro = ehGestoMenu(atuacao)
    ? REPERTORIO_GESTOS[atuacao]
    : REPERTORIO[atuacao];
  const duracao = duracaoAtuacao(atuacao);
  const [executando, definirExecutando] = useState(false);
  const [apresentandoTudo, definirApresentandoTudo] = useState(false);
  const [velocidade, definirVelocidade] = useState<number>(1);
  const [origem, definirOrigem] = useState(0);
  const [reinicio, definirReinicio] = useState(0);
  const [partes, definirPartes] = useState(false);
  const [reduzir, definirReduzir] = useState(false);
  const preferencia = useMovimentosReduzidos();
  const reduzidos = reduzir || preferencia;

  // Suporte opcional para testar transição suave (pose blending) ao vivo no estúdio.
  const ultimaPose = useRef<PoseCompleta>(poseVisual(atuacao, 0));
  const origemBlending = useRef<PoseCompleta | null>(null);
  const inicioBlending = useRef(0);
  const [blendingAtivo, definirBlendingAtivo] = useState(false);

  const tempo = useRelogioAtuacao(
    executando && !reduzidos,
    duracao,
    origem,
    reinicio,
    () => {
      if (apresentandoTudo) {
        const indice = TODAS_ATUACOES.indexOf(atuacao);
        const proximo = TODAS_ATUACOES[(indice + 1) % TODAS_ATUACOES.length];
        if (indice + 1 >= TODAS_ATUACOES.length) {
          definirApresentandoTudo(false);
          definirExecutando(false);
          return;
        }
        origemBlending.current = ultimaPose.current;
        inicioBlending.current = performance.now();
        definirBlendingAtivo(true);
        definirAtuacao(proximo);
        definirOrigem(0);
        definirReinicio((n) => n + 1);
      } else {
        definirExecutando(false);
      }
    },
    false,
    velocidade,
  );

  let poseExibida = poseVisual(atuacao, tempo);
  if (blendingAtivo && origemBlending.current && executando && !reduzidos) {
    const decorrido = performance.now() - inicioBlending.current;
    if (decorrido < DURACAO_BLENDING_MS) {
      poseExibida = misturarPoses(
        origemBlending.current,
        poseExibida,
        decorrido / DURACAO_BLENDING_MS,
      );
    } else {
      origemBlending.current = null;
    }
  }

  useEffect(() => {
    ultimaPose.current = poseExibida;
  });

  function selecionarAtuacao(nova: TipoAtuacao, continuarComBlending = false) {
    if (continuarComBlending && !reduzidos) {
      origemBlending.current = ultimaPose.current;
      inicioBlending.current = performance.now();
      definirBlendingAtivo(true);
      definirExecutando(true);
    } else {
      origemBlending.current = null;
      definirBlendingAtivo(false);
      definirExecutando(false);
      definirApresentandoTudo(false);
    }
    definirOrigem(0);
    definirReinicio((n) => n + 1);
    definirAtuacao(nova);
  }

  function reproduzir() {
    origemBlending.current = null;
    definirBlendingAtivo(false);
    definirOrigem(tempo >= duracao ? 0 : tempo);
    definirReinicio((n) => n + 1);
    definirExecutando(!reduzidos);
  }

  function alternarApresentacaoCompleta() {
    if (reduzidos) return;
    if (apresentandoTudo) {
      definirApresentandoTudo(false);
      definirExecutando(false);
      return;
    }
    origemBlending.current = null;
    definirBlendingAtivo(false);
    definirAtuacao(TODAS_ATUACOES[0]);
    definirOrigem(0);
    definirReinicio((n) => n + 1);
    definirApresentandoTudo(true);
    definirExecutando(true);
  }

  function testarTransicaoAoVivo() {
    if (reduzidos) return;
    const atualIndice = TODAS_ATUACOES.indexOf(atuacao);
    const proxima = TODAS_ATUACOES[(atualIndice + 1) % TODAS_ATUACOES.length];
    selecionarAtuacao(proxima, true);
  }

  const estado = reduzidos
    ? "Movimentos reduzidos: examine as poses pelo controle de tempo."
    : apresentandoTudo
      ? `Apresentação contínua (${TODAS_ATUACOES.indexOf(atuacao) + 1}/${TODAS_ATUACOES.length}): ${roteiro.nome}`
      : executando
        ? `${roteiro.nome} em reprodução`
        : tempo >= duracao
          ? `${roteiro.nome} concluíd${ehGestoMenu(atuacao) || ["pensamento", "erro", "sorteio", "resultado"].includes(atuacao) ? "o" : "a"}`
          : "Examine o desenho e depois dê o play.";

  return (
    <section className="galeria-aurelio ensaio-saudacao">
      <span className="etiqueta">ESTÚDIO DO APRESENTADOR · AURÉLIO 2.0</span>
      <h1 tabIndex={-1}>Aurélio em cena.</h1>
      <p>
        O mesmo personagem com rigging híbrido 2.5D: {REACOES.length} momentos
        do jogo e {GESTOS_MENU.length} surpresas do menu. Escolha uma atuação,
        ajuste a velocidade, inspecione o esqueleto ou apresente o repertório
        completo.
      </p>

      <div
        className="botoes-reacoes repertorio-aurelio"
        role="group"
        aria-label="Atuações do Aurélio"
      >
        {REACOES.map((tipo) => (
          <Botao
            key={tipo}
            aria-pressed={atuacao === tipo}
            onClick={() => selecionarAtuacao(tipo, false)}
          >
            {REPERTORIO[tipo].nome}
          </Botao>
        ))}
      </div>

      <div
        className="botoes-reacoes repertorio-aurelio"
        role="group"
        aria-label="Surpresas do menu"
      >
        {GESTOS_MENU.map((tipo) => (
          <Botao
            key={tipo}
            aria-pressed={atuacao === tipo}
            onClick={() => selecionarAtuacao(tipo, false)}
          >
            {REPERTORIO_GESTOS[tipo].nome}
          </Botao>
        ))}
      </div>

      <p className="descricao-atuacao">
        <b>{roteiro.nome}.</b> {roteiro.gesto}
      </p>

      <div className="ensaio-comparacao">
        <article className="ensaio-montagem">
          <header>
            <span className="etiqueta">RIGGING HÍBRIDO 2.5D</span>
            <h2>Nosso apresentador em ação.</h2>
          </header>
          <AurelioRecortado
            tempo={tempo}
            atuacao={atuacao}
            partes={partes}
            poseDireta={blendingAtivo ? poseExibida : undefined}
            descricao={`Aurélio: ${roteiro.controle}`}
          />
        </article>
        <article className="ensaio-referencia">
          <header>
            <span className="etiqueta">REFERÊNCIA APROVADA</span>
            <h2>O Aurélio original.</h2>
          </header>
          <img
            src="/mascote/aurelio.png"
            width="1158"
            height="1359"
            alt="Aurélio original aprovado"
          />
        </article>
      </div>

      <div className="ensaio-controles">
        <div className="controles-aurelio">
          <Botao
            className="acao"
            onClick={
              executando
                ? () => {
                    definirExecutando(false);
                    definirApresentandoTudo(false);
                  }
                : reproduzir
            }
          >
            {executando
              ? `Pausar ${roteiro.controle}`
              : `Reproduzir ${roteiro.controle}`}
          </Botao>
          <Botao
            onClick={() => {
              definirExecutando(false);
              definirApresentandoTudo(false);
              definirBlendingAtivo(false);
              definirOrigem(0);
              definirReinicio((n) => n + 1);
            }}
          >
            Voltar à pose original
          </Botao>
          <Botao
            aria-pressed={apresentandoTudo}
            disabled={reduzidos}
            onClick={alternarApresentacaoCompleta}
          >
            {apresentandoTudo
              ? "Parar apresentação"
              : "Apresentar tudo em sequência"}
          </Botao>
          <Botao disabled={reduzidos} onClick={testarTransicaoAoVivo}>
            Transição suave (próxima)
          </Botao>
        </div>

        <div
          className="velocidades-aurelio"
          role="group"
          aria-label="Velocidade da prévia"
        >
          <span>Velocidade:</span>
          {VELOCIDADES.map((v) => (
            <Botao
              key={v}
              aria-pressed={velocidade === v}
              onClick={() => definirVelocidade(v)}
            >
              {String(v).replace(".", ",")}×
            </Botao>
          ))}
        </div>

        <label className="ensaio-tempo">
          Instante {atuacao === "saudacao" ? "da saudação" : "da atuação"}{" "}
          <input
            type="range"
            min="0"
            max={duracao}
            step="10"
            value={Math.round(tempo / 10) * 10}
            onChange={(e) => {
              definirExecutando(false);
              definirApresentandoTudo(false);
              definirBlendingAtivo(false);
              definirOrigem(Number(e.target.value));
              definirReinicio((n) => n + 1);
            }}
          />
          <output>
            {(tempo / 1000).toFixed(2).replace(".", ",")} s /{" "}
            {(duracao / 1000).toFixed(2).replace(".", ",")} s
          </output>
        </label>

        <p role="status">{estado}</p>

        <div className="ensaio-opcoes">
          <label>
            <input
              type="checkbox"
              checked={partes}
              onChange={(e) => definirPartes(e.target.checked)}
            />{" "}
            Mostrar esqueleto IK, recortes e articulações
          </label>
          <label>
            <input
              type="checkbox"
              checked={reduzir}
              onChange={(e) => definirReduzir(e.target.checked)}
            />{" "}
            Prévia com movimentos reduzidos
          </label>
        </div>
      </div>

      <ol className="ensaio-etapas">
        <li>
          <b>01 · Preparar</b>
          <span>{roteiro.etapas[0]}</span>
        </li>
        <li>
          <b>02 · Atuar</b>
          <span>{roteiro.etapas[1]}</span>
        </li>
        <li>
          <b>03 · Acomodar</b>
          <span>{roteiro.etapas[2]}</span>
        </li>
      </ol>

      <p className="nota-aurelio">
        Repertório completo do Aurélio 2.0 com cinemática rubber-hose 2.5D,
        folhas animáveis e pose blending. No estúdio cada atuação toca uma vez
        (ou em sequência no modo apresentação); no jogo, somente a espera se
        repete enquanto o personagem estiver visível.
      </p>
    </section>
  );
}
