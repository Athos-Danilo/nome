import { useState } from "react";
import { usePartida } from "./usar-partida";
import {
  Botao,
  Carregando,
  Dialogo,
  EstadoVazio,
} from "../../componentes/Comuns";
import { EditorResposta } from "../entrada/EditorResposta";
import { criarEntrada } from "../entrada/modelo";
import { ResultadoIndividual } from "./ResultadoIndividual";
import { NIVEIS, TEMAS } from "./apresentacao";
import type { Rodada } from "./api";
function Montagem({
  rodada,
  ocupado,
  aoEnviar,
}: {
  rodada: Rodada;
  ocupado: boolean;
  aoEnviar: (palpite: string) => void;
}) {
  const [entrada, definirEntrada] = useState(() =>
    criarEntrada({ posicoes: rodada.posicoes, limites: rodada.limites }),
  );
  return (
    <EditorResposta
      estado={entrada}
      aoAlterar={definirEntrada}
      aoEnviar={aoEnviar}
      ocupado={ocupado}
    />
  );
}
export function PainelIndividual({
  base,
  token,
  demo = false,
}: {
  base: string;
  token: string;
  demo?: boolean;
}) {
  const jogo = usePartida(base, token);
  const [anteriores, definirAnteriores] = useState(false);
  const [confirmacao, definirConfirmacao] = useState<
    "palavra" | "partida" | null
  >(null);
  const estado = jogo.consulta.data;
  if (jogo.consulta.isPending) return <Carregando />;
  if (!estado)
    return (
      <EstadoVazio titulo="Sua descoberta está esperando">
        <p role="alert">{jogo.consulta.error?.message}</p>
        <Botao onClick={() => void jogo.consulta.refetch()}>
          Tentar novamente
        </Botao>
      </EstadoVazio>
    );
  if (jogo.retorno)
    return (
      <section className="reacao-solo">
        <span className="selo-acerto" aria-hidden="true">
          {jogo.retorno.resultado === "acerto" ? "✦" : "✧"}
        </span>
        <span className="etiqueta">
          {jogo.retorno.resultado === "acerto"
            ? "AH, JÁ SEI!"
            : "MAIS UMA PARA O REPERTÓRIO"}
        </span>
        <h1 tabIndex={-1}>
          {jogo.retorno.resultado === "acerto"
            ? "Boa descoberta!"
            : "Uma descoberta para guardar"}
        </h1>
        <p className="palavra-revelada">{jogo.retorno.resposta_revelada}</p>
        <strong className="pontos-acerto">+{jogo.retorno.pontos} pontos</strong>
        <img
          src="/mascote/aurelio.png"
          width="180"
          alt="Aurélio celebrando sua descoberta"
        />
        <Botao className="acao botao-grande" onClick={jogo.continuar}>
          {estado.estado === "concluida" ? "Ver resultado" : "Próxima palavra"}{" "}
          →
        </Botao>
        {demo && (
          <a className="convite-google" href="/api/autenticacao/google">
            Guardar com Google
          </a>
        )}
      </section>
    );
  if (["concluida", "abandonada"].includes(estado.estado))
    return <ResultadoIndividual partida={estado} demo={demo} />;
  const rodada = estado.rodada_atual;
  if (!rodada)
    return (
      <EstadoVazio titulo="Vamos retomar suas pistas?">
        <p>A partida ainda não está disponível para jogar.</p>
        <Botao onClick={() => void jogo.consulta.refetch()}>
          Conferir novamente
        </Botao>
      </EstadoVazio>
    );
  const bloqueado = jogo.ocupado || !!jogo.pendente;
  return (
    <section className="partida-solo" aria-busy={jogo.ocupado}>
      <header className="hud-solo">
        <div>
          <span className="etiqueta">
            {demo ? "SEU PRIMEIRO DECIFRA" : "MODO SOLO"}
          </span>
          <h1 tabIndex={-1}>Siga sua curiosidade.</h1>
        </div>
        <div className="placar-solo">
          <span>SEUS PONTOS</span>
          <strong>{estado.pontuacao}</strong>
        </div>
        <div className="progresso-solo">
          <span>PALAVRA</span>
          <strong>
            {rodada.ordem}
            <small> / {estado.quantidade_palavras}</small>
          </strong>
        </div>
      </header>
      <div
        className="trilha-solo"
        aria-label={`${estado.rodadas_concluidas} palavras concluídas`}
      >
        {Array.from({ length: estado.quantidade_palavras }, (_, i) => (
          <span
            key={i}
            className={
              i < estado.rodadas_concluidas
                ? "completa"
                : i === rodada.ordem - 1
                  ? "atual"
                  : ""
            }
          />
        ))}
      </div>
      <div className="arena-solo">
        <aside className="aurelio-partida">
          <img src="/mascote/aurelio.png" alt="Aurélio apresentando a dica" />
          <p>
            Uma pista de cada vez.
            <br />
            <em>O seu “ahá!” está chegando.</em>
          </p>
          <span className="estrela-solo" aria-hidden="true">
            ✦
          </span>
        </aside>
        <div className="desafio-solo">
          <div className="identidade-rodada">
            <span>
              {rodada.tematicas.map((t) => TEMAS[t] ?? t).join(" + ")}
            </span>
            <span>{NIVEIS[rodada.dificuldade]}</span>
          </div>
          <article
            className="cartao-dica"
            key={`${rodada.rodada_id}-${rodada.dica_atual}`}
          >
            <div className="cabecalho-dica">
              <span>Dica {rodada.dica_atual} de 5</span>
              <b>Vale {rodada.pontos_disponiveis} pontos</b>
            </div>
            <p>{rodada.dicas_reveladas.at(-1)}</p>
            <div className="marcadores-dicas" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <i
                  key={n}
                  className={n <= rodada.dica_atual ? "revelada" : ""}
                />
              ))}
            </div>
          </article>
          <div className="acoes-dica">
            <Botao
              disabled={bloqueado || rodada.dica_atual === 5}
              onClick={() => jogo.agir("dicas")}
            >
              Pedir outra dica
            </Botao>
            <Botao
              onClick={() => definirAnteriores(true)}
              disabled={rodada.dica_atual === 1}
            >
              Ver dicas anteriores
            </Botao>
          </div>
          {jogo.erro && (
            <p className="aviso-erro" role="alert">
              {jogo.erro}
            </p>
          )}
          {jogo.pendente && (
            <Botao onClick={jogo.reenviar} disabled={jogo.ocupado}>
              Reenviar mesma ação
            </Botao>
          )}
          <Montagem
            key={`${rodada.rodada_id}-${jogo.limpeza}`}
            rodada={rodada}
            ocupado={bloqueado}
            aoEnviar={(p) => jogo.agir("palpites", p)}
          />
          <div className="desistencias-solo">
            <Botao
              disabled={bloqueado}
              onClick={() => definirConfirmacao("palavra")}
            >
              Desistir desta palavra
            </Botao>
            <Botao
              disabled={bloqueado}
              onClick={() => definirConfirmacao("partida")}
            >
              Encerrar partida
            </Botao>
          </div>
          {demo && (
            <a className="convite-google" href="/api/autenticacao/google">
              Seu perfil, seus desafios. Guardar com Google ↗
            </a>
          )}
        </div>
      </div>
      <Dialogo
        aberto={anteriores}
        titulo="As pistas que você já descobriu"
        aoFechar={() => definirAnteriores(false)}
      >
        <ol>
          {rodada.dicas_reveladas.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ol>
        <p>A palavra continua valendo {rodada.pontos_disponiveis} pontos.</p>
      </Dialogo>
      <Dialogo
        aberto={!!confirmacao}
        titulo={
          confirmacao === "palavra"
            ? "Revelar esta palavra?"
            : "Encerrar por aqui?"
        }
        aoFechar={() => definirConfirmacao(null)}
      >
        <p>
          {confirmacao === "palavra"
            ? "Mostramos a resposta e seguimos para a próxima. Esta palavra vale zero pontos."
            : "Você mantém os pontos conquistados. Esta partida será encerrada definitivamente e não poderá ser retomada."}
        </p>
        <Botao
          className="acao"
          disabled={bloqueado}
          onClick={() => {
            jogo.agir(
              confirmacao === "palavra"
                ? "desistencia-palavra"
                : "encerramento",
            );
            definirConfirmacao(null);
          }}
        >
          {confirmacao === "palavra"
            ? "Revelar e seguir"
            : "Encerrar definitivamente"}
        </Botao>
      </Dialogo>
    </section>
  );
}
