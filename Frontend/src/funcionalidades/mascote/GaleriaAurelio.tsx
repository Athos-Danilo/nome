import { useState } from "react";
import { Botao } from "../../componentes/Comuns";
import { AurelioRecortado } from "./AurelioRecortado";
import { DURACOES, REACOES, type Reacao } from "./reacoes";
import { REPERTORIO } from "./repertorio";
import { useRelogioAtuacao } from "./usar-relogio-atuacao";
import { useMovimentosReduzidos } from "./usar-movimentos-reduzidos";
import "./mascote.css";

export function GaleriaAurelio() {
  const [atuacao, definirAtuacao] = useState<Reacao>("saudacao");
  const roteiro = REPERTORIO[atuacao];
  const duracao = DURACOES[atuacao];
  const [executando, definirExecutando] = useState(false),
    [origem, definirOrigem] = useState(0),
    [reinicio, definirReinicio] = useState(0);
  const [partes, definirPartes] = useState(false),
    [reduzir, definirReduzir] = useState(false);
  const preferencia = useMovimentosReduzidos();
  const reduzidos = reduzir || preferencia;
  const tempo = useRelogioAtuacao(
    executando && !reduzidos,
    duracao,
    origem,
    reinicio,
    () => definirExecutando(false),
  );
  function reproduzir() {
    definirOrigem(tempo >= duracao ? 0 : tempo);
    definirReinicio((n) => n + 1);
    definirExecutando(!reduzidos);
  }
  const estado = reduzidos
    ? "Movimentos reduzidos: examine as poses pelo controle de tempo."
    : executando
      ? `${roteiro.nome} em reprodução`
      : tempo >= duracao
        ? `${roteiro.nome} concluíd${atuacao === "pensamento" || atuacao === "erro" || atuacao === "sorteio" || atuacao === "resultado" ? "o" : "a"}`
        : "Examine o desenho e depois dê o play.";
  return (
    <section className="galeria-aurelio ensaio-saudacao">
      <span className="etiqueta">ESTÚDIO DO APRESENTADOR · REPERTÓRIO</span>
      <h1 tabIndex={-1}>Aurélio em cena.</h1>
      <p>
        O mesmo personagem, nove momentos do jogo. Escolha uma atuação, dê o
        play e examine cada gesto ao lado do desenho aprovado.
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
            onClick={() => {
              definirExecutando(false);
              definirOrigem(0);
              definirReinicio((n) => n + 1);
              definirAtuacao(tipo);
            }}
          >
            {REPERTORIO[tipo].nome}
          </Botao>
        ))}
      </div>
      <p className="descricao-atuacao">
        <b>{roteiro.nome}.</b> {roteiro.gesto}
      </p>
      <div className="ensaio-comparacao">
        <article className="ensaio-montagem">
          <header>
            <span className="etiqueta">MONTAGEM PARA ANIMAÇÃO</span>
            <h2>Nosso apresentador, por partes.</h2>
          </header>
          <AurelioRecortado
            tempo={tempo}
            atuacao={atuacao}
            partes={partes}
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
            onClick={executando ? () => definirExecutando(false) : reproduzir}
          >
            {executando
              ? `Pausar ${roteiro.controle}`
              : `Reproduzir ${roteiro.controle}`}
          </Botao>
          <Botao
            onClick={() => {
              definirExecutando(false);
              definirOrigem(0);
              definirReinicio((n) => n + 1);
            }}
          >
            Voltar à pose original
          </Botao>
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
            Mostrar recortes e articulações
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
        A primeira saudação já foi aprovada. As oito novas atuações estão
        prontas para sua avaliação visual. Aqui cada atuação toca uma vez; no
        jogo, somente a espera se repete enquanto o personagem estiver visível.
      </p>
    </section>
  );
}
