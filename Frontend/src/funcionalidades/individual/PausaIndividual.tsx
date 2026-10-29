import { useState } from "react";
import { Link } from "react-router";
import { Botao, Dialogo } from "../../componentes/Comuns";
import type { Partida } from "./api";
export function PausaIndividual({
  partida,
  ocupado,
  erro,
  pendente,
  aoRetomar,
  aoEncerrar,
  aoReenviar,
}: {
  partida: Partida;
  ocupado: boolean;
  erro: string;
  pendente: boolean;
  aoRetomar: () => void;
  aoEncerrar: () => void;
  aoReenviar: () => void;
}) {
  const [encerrar, definirEncerrar] = useState(false);
  return (
    <section className="pausa-solo">
      <span className="etiqueta">UMA PAUSA NA DESCOBERTA</span>
      <h1 tabIndex={-1}>Suas pistas estão guardadas</h1>
      <p>
        Esta pausa descontou 100 pontos. Reabrir este aviso não desconta
        novamente.
      </p>
      <div className="placar-final">
        <span>SALDO ATUAL</span>
        <strong>{partida.pontuacao}</strong>
        <span>
          {partida.quantidade_pausas ?? 1}{" "}
          {partida.quantidade_pausas === 1 ? "pausa" : "pausas"} na partida
        </span>
      </div>
      <p>
        Você volta à dica {partida.rodada_atual?.dica_atual}, na palavra{" "}
        {partida.rodada_atual?.ordem}. As letras confirmadas estão guardadas.
      </p>
      {erro && <p role="alert">{erro}</p>}
      <div className="acoes-resultado">
        <Botao
          className="acao"
          disabled={ocupado || pendente}
          onClick={aoRetomar}
        >
          Retomar partida
        </Botao>
        {pendente && (
          <Botao disabled={ocupado} onClick={aoReenviar}>
            Reenviar mesma ação
          </Botao>
        )}
        <Link to="/" className="botao-jogo">
          Voltar ao menu
        </Link>
        <Botao
          disabled={ocupado || pendente}
          onClick={() => definirEncerrar(true)}
        >
          Encerrar partida
        </Botao>
      </div>
      <Dialogo
        aberto={encerrar}
        titulo="Encerrar por aqui?"
        aoFechar={() => definirEncerrar(false)}
      >
        <p>
          Esta partida não poderá ser retomada. Seu saldo será mantido, sem
          desconto adicional.
        </p>
        <Botao
          className="acao"
          disabled={ocupado}
          onClick={() => {
            aoEncerrar();
            definirEncerrar(false);
          }}
        >
          Encerrar definitivamente
        </Botao>
      </Dialogo>
    </section>
  );
}
