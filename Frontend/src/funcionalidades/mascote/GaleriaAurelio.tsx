import { useState } from "react";
import { Botao } from "../../componentes/Comuns";
import { AurelioRecortado } from "./AurelioRecortado";
import { DURACAO_SAUDACAO } from "./saudacao";
import { useRelogioSaudacao } from "./usar-relogio-saudacao";
import { useMovimentosReduzidos } from "./usar-movimentos-reduzidos";
import "./mascote.css";

export function GaleriaAurelio() {
  const [executando, definirExecutando] = useState(false),
    [origem, definirOrigem] = useState(0),
    [reinicio, definirReinicio] = useState(0);
  const [partes, definirPartes] = useState(false),
    [reduzir, definirReduzir] = useState(false);
  const preferencia = useMovimentosReduzidos();
  const reduzidos = reduzir || preferencia;
  const tempo = useRelogioSaudacao(
    executando && !reduzidos,
    origem,
    reinicio,
    () => definirExecutando(false),
  );
  function reproduzir() {
    definirOrigem(0);
    definirReinicio((n) => n + 1);
    definirExecutando(!reduzidos);
  }
  const estado = reduzidos
    ? "Movimentos reduzidos: examine as poses pelo controle de tempo."
    : executando
      ? "Saudação em reprodução"
      : tempo >= DURACAO_SAUDACAO
        ? "Saudação concluída"
        : "Examine o desenho e depois dê o play.";
  return (
    <section className="galeria-aurelio ensaio-saudacao">
      <span className="etiqueta">ESTUDO DE PERSONAGEM · SAUDAÇÃO 02</span>
      <h1 tabIndex={-1}>O mesmo Aurélio. Uma nova saudação.</h1>
      <p>
        Primeiro, a aparência. Depois, o gesto. Compare com o desenho que você
        aprovou e examine cada instante do aceno.
      </p>
      <div className="ensaio-comparacao">
        <article className="ensaio-montagem">
          <header>
            <span className="etiqueta">MONTAGEM PARA ANIMAÇÃO</span>
            <h2>Nosso apresentador, por partes.</h2>
          </header>
          <AurelioRecortado tempo={tempo} partes={partes} />
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
            {executando ? "Pausar saudação" : "Reproduzir saudação"}
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
          Instante da saudação{" "}
          <input
            type="range"
            min="0"
            max={DURACAO_SAUDACAO}
            step="10"
            value={Math.round(tempo / 10) * 10}
            onChange={(e) => {
              definirExecutando(false);
              definirOrigem(Number(e.target.value));
              definirReinicio((n) => n + 1);
            }}
          />
          <output>
            {(tempo / 1000).toFixed(2).replace(".", ",")} s / 5,40 s
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
          <b>01 · Perceber</b>
          <span>Olhar, sobrancelhas e preparação do corpo.</span>
        </li>
        <li>
          <b>02 · Cumprimentar</b>
          <span>Ombro, cotovelo e punho em ritmos diferentes.</span>
        </li>
        <li>
          <b>03 · Acomodar</b>
          <span>O gesto desacelera; gravata e páginas chegam depois.</span>
        </li>
      </ol>
      <p className="nota-aurelio">
        Só a saudação está sendo trabalhada nesta revisão. As outras atuações
        serão refeitas depois da aprovação da aparência e do movimento. No jogo,
        a arte original fica preservada.
      </p>
    </section>
  );
}
