import { useEffect, useState } from "react";
import { useBlocker } from "react-router";
import {
  Botao,
  Carregando,
  Dialogo,
  EstadoVazio,
} from "../../componentes/Comuns";
import { EditorResposta } from "../entrada/EditorResposta";
import { criarEntrada } from "../entrada/modelo";
import { formatarTempo } from "../individual/usar-cronometro";
import { useSaidaPartida } from "../individual/saida-partida";
import { TEMAS } from "../individual/apresentacao";
import { usePainelGalera } from "./usar-painel";
import type { Painel } from "./painel-api";

function EntradaGalera({
  painel,
  palavra,
  modo,
  ocupado,
  aoLetra,
  aoPalpite,
}: {
  painel: Painel;
  palavra: number;
  modo: "letra" | "palpite";
  ocupado: boolean;
  aoLetra: (letra: string) => void;
  aoPalpite: (palpite: string) => void;
}) {
  const [entrada, definirEntrada] = useState(() =>
    criarEntrada({
      posicoes: painel.palavras[palavra],
      modo: "galera",
      acao: modo,
      bloqueadas: painel.bloqueadas,
    }),
  );
  return (
    <EditorResposta
      estado={entrada}
      aoAlterar={definirEntrada}
      aoEnviar={aoPalpite}
      aoEscolherLetra={aoLetra}
      ocupado={ocupado}
      exibirMontagem={modo === "palpite"}
    />
  );
}

export function PainelGalera({ id, token }: { id: string; token: string }) {
  const [liberada, definirLiberada] = useState("");
  const jogo = usePainelGalera(id, token, !liberada);
  const e = jogo.consulta.data;
  const p = e?.painel;
  const [palavra, definirPalavra] = useState(0);
  const [modo, definirModo] = useState<"letra" | "palpite">("letra");
  const [encerrar, definirEncerrar] = useState(false);
  const [externa, definirExterna] = useState<(() => void) | null>(null);
  const [temaExtra, definirTemaExtra] = useState("");
  const protecao = useSaidaPartida();
  const ativa = e?.estado === "em_andamento";
  const bloqueio = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!ativa && currentLocation.pathname !== nextLocation.pathname,
  );
  const chave = p ? `decifra_sorteio_${id}_${p.sessao_id}` : "";
  useEffect(() => {
    definirPalavra(0);
    if (!chave) return;
    try {
      definirLiberada(sessionStorage.getItem(chave) ? chave : "");
    } catch {
      definirLiberada("");
    }
  }, [chave]);
  useEffect(() => {
    protecao.registrar(ativa ? (acao) => definirExterna(() => acao) : null);
    return () => protecao.registrar(null);
  }, [ativa, protecao]);
  function liberar() {
    definirLiberada(chave);
    try {
      sessionStorage.setItem(chave, "1");
    } catch {
      /* Ordem permanece oficial mesmo sem armazenamento. */
    }
  }
  async function confirmarSaida() {
    if (await jogo.agir("encerrar")) {
      definirEncerrar(false);
      if (bloqueio.state === "blocked") bloqueio.proceed();
      else {
        externa?.();
        definirExterna(null);
      }
    }
  }
  function cancelar() {
    definirEncerrar(false);
    definirExterna(null);
    if (bloqueio.state === "blocked") bloqueio.reset();
  }
  if (jogo.consulta.isPending) return <Carregando />;
  if (!e || !p)
    return (
      <EstadoVazio titulo="Vamos recuperar o painel?">
        <p role="alert">
          {jogo.consulta.error?.message ??
            "Confira sua conexão e tente novamente."}
        </p>
        <Botao onClick={() => void jogo.consulta.refetch()}>
          Tentar novamente
        </Botao>
      </EstadoVazio>
    );
  const final = e.estado === "concluida" || e.estado === "abandonada";
  const sorteio = !final && p.estado === "em_andamento" && liberada !== chave;
  const pessoa = e.participantes.find(
    (a) => a.participante_id === p.participante_atual,
  );
  const bloqueado =
    jogo.ocupado || !!jogo.pendente || jogo.semRede || !jogo.pronto || sorteio;
  const selecionada = Math.min(palavra, p.palavras.length - 1);
  return (
    <section className="painel-galera">
      <header className="cabecalho-galera">
        <div>
          <span className="etiqueta">
            {final
              ? "O SHOW DE VOCÊS"
              : p.extra
                ? "VALE O DESEMPATE"
                : "TODO MUNDO NO MESMO DESAFIO"}
          </span>
          <h1>{final ? "Resultado da galera" : `Sessão ${p.sessao}`}</h1>
          <p>
            {TEMAS[p.tematica] ?? p.tematica} <span aria-hidden="true">✦</span>{" "}
            {p.palavras.length} palavras no painel
          </p>
        </div>
        <div
          className={`relogio-galera ${jogo.crono.ativo ? "ativo" : ""}`}
          aria-label="Tempo de jogo nesta sessão"
        >
          <span aria-hidden="true">◷</span>
          <div>
            <small>TEMPO DA SESSÃO</small>
            <strong data-testid="tempo-sessao">
              {formatarTempo(final ? p.tempo_ativo_ms : jogo.crono.tempo)}
            </strong>
            <small>
              {jogo.crono.ativo ? "NO RITMO DE VOCÊS" : "CONTAGEM SUSPENSA"}
            </small>
          </div>
        </div>
      </header>
      <ol className="placar-galera" aria-label="Placar da galera">
        {e.participantes.map((a) => (
          <li
            key={a.participante_id}
            data-testid={`placar-${a.participante_id}`}
            className={
              a.participante_id === p.participante_atual ? "na-vez" : ""
            }
          >
            <img src={`/avatares/${a.avatar_id}.webp`} alt="" />
            <div>
              <strong>{a.nome}</strong>
              <span>
                {a.pontuacao.toLocaleString("pt-BR")} <small>PTS</small>
              </span>
            </div>
            {a.participante_id === p.participante_atual && <b>SUA VEZ</b>}
            {final && p.lideres.includes(a.participante_id) && (
              <b>{p.lideres.length > 1 ? "EMPATE" : "VENCEU"}</b>
            )}
          </li>
        ))}
      </ol>
      {(jogo.erro || jogo.crono.aviso || jogo.semRede) && (
        <p className="aviso-erro" role="alert">
          {jogo.semRede
            ? "Sem conexão. O painel foi preservado; reconecte para continuar."
            : jogo.erro || jogo.crono.aviso}
        </p>
      )}
      {!jogo.pronto && jogo.erro && (
        <Botao onClick={jogo.reconectar}>Reconciliar painel</Botao>
      )}
      {jogo.pendente && (
        <Botao
          disabled={jogo.ocupado || jogo.semRede}
          onClick={() => void jogo.reenviar()}
        >
          Reenviar mesma ação
        </Botao>
      )}
      {final ? (
        <div className="final-galera">
          <img src="/mascote/aurelio.png" alt="Aurélio celebrando a partida" />
          <div>
            <span className="etiqueta">
              {e.estado === "abandonada"
                ? "PARTIDA ENCERRADA ANTES DO FIM"
                : "DESAFIO CONCLUÍDO"}
            </span>
            <h2>
              {p.lideres.length > 1
                ? "Essa ficou empatada!"
                : e.participantes.length === 1
                  ? "Seu show de descobertas!"
                  : `${e.participantes.find((a) => p.lideres.includes(a.participante_id))?.nome} venceu!`}
            </h2>
            <p>Pontos conquistados e boas descobertas para levar com vocês.</p>
            <p>
              Tempo total: <strong>{formatarTempo(e.tempo_total_ms)}</strong>
            </p>
            <ul>
              {e.resumo_sessoes.map((s) => (
                <li key={s.numero}>
                  Sessão {s.numero}
                  {s.desempate ? " · extra" : ""} ·{" "}
                  {TEMAS[s.tematica] ?? s.tematica}{" "}
                  <strong>{formatarTempo(s.tempo_ativo_ms)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      <div className="tabuleiro-galera">
        <div className="titulo-tabuleiro">
          <span className="etiqueta">
            {final ? "PALAVRAS DA ÚLTIMA SESSÃO" : "PAINEL COMPARTILHADO"}
          </span>
          {!final && (
            <h2 aria-live="polite">
              {p.estado === "aguardando_desempate"
                ? "Empate na liderança!"
                : `É a vez de ${pessoa?.nome ?? "sua galera"}`}
            </h2>
          )}
        </div>
        <div className="palavras-galera">
          {p.palavras.map((posicoes, i) => (
            <button
              key={i}
              className={`palavra-painel ${i === selecionada && !final ? "selecionada" : ""}`}
              aria-pressed={i === selecionada}
              aria-label={`Selecionar palavra ${i + 1}`}
              disabled={final || bloqueado || p.estado !== "em_andamento"}
              onClick={() => {
                definirPalavra(i);
                definirModo("palpite");
              }}
            >
              <span className="numero-palavra">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="casas-galera" aria-hidden="true">
                {posicoes.map((c, j) => (
                  <span
                    key={j}
                    className={
                      c === null
                        ? "casa oculta"
                        : c === " "
                          ? "casa espaco"
                          : "casa revelada"
                    }
                  >
                    {c ?? ""}
                  </span>
                ))}
              </span>
              <span className="sr-only">
                {posicoes.map((c) => c ?? "_").join("")}
              </span>
            </button>
          ))}
        </div>
        {final && (
          <div className="respostas-finais">
            {p.palavras.map((r, i) => (
              <p key={i}>{r.join("")}</p>
            ))}
          </div>
        )}
      </div>
      {!final && p.estado === "em_andamento" && (
        <div className="comandos-galera">
          <div className="alternar-jogada">
            <Botao
              aria-pressed={modo === "letra"}
              disabled={bloqueado}
              onClick={() => definirModo("letra")}
            >
              Escolher uma letra
            </Botao>
            <Botao
              aria-pressed={modo === "palpite"}
              disabled={bloqueado}
              onClick={() => definirModo("palpite")}
            >
              Tentar palavra completa
            </Botao>
          </div>
          <p>
            {modo === "letra"
              ? "Uma letra revela todas as ocorrências do painel. Cada posição nova vale 100 pontos."
              : `Monte a palavra ${selecionada + 1}. Um erro pontua posições certas e passa a vez.`}
          </p>
          <EntradaGalera
            key={`${e.versao}-${selecionada}-${modo}`}
            painel={p}
            palavra={selecionada}
            modo={modo}
            ocupado={bloqueado}
            aoLetra={(valor) =>
              void jogo.agir("letra", {
                participante_id: p.participante_atual!,
                valor,
              })
            }
            aoPalpite={(valor) =>
              void jogo.agir("palpite", {
                participante_id: p.participante_atual!,
                palavra: selecionada,
                valor,
              })
            }
          />
        </div>
      )}
      {!final && p.estado === "aguardando_desempate" && (
        <div className="desempate-galera">
          <h2>Mais uma para decidir?</h2>
          <p>
            Uma única sessão extra, apenas entre os líderes. Se alguém preferir
            parar, o empate será o resultado final.
          </p>
          {p.lideres.map((id) => {
            const a = e.participantes.find((a) => a.participante_id === id)!;
            return (
              <div className="voto-galera" key={id}>
                <strong>{a.nome}</strong>
                {p.concordantes.includes(id) ? (
                  <span>Topou a extra ✓</span>
                ) : (
                  <Botao
                    disabled={jogo.ocupado || !!jogo.pendente}
                    onClick={() =>
                      void jogo.agir("voto", {
                        participante_id: id,
                        aceita: true,
                      })
                    }
                  >
                    Aceitar extra como {a.nome}
                  </Botao>
                )}
              </div>
            );
          })}
          <label>
            Temática da sessão extra
            <select
              value={temaExtra}
              onChange={(e) => definirTemaExtra(e.target.value)}
            >
              <option value="">Surpresa · tema aleatório</option>
              {Object.entries(TEMAS).map(([v, n]) => (
                <option key={v} value={v}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <Botao
            disabled={
              jogo.ocupado ||
              !!jogo.pendente ||
              p.concordantes.length !== p.lideres.length
            }
            onClick={() =>
              void jogo.agir("extra", temaExtra ? { tematica: temaExtra } : {})
            }
          >
            Começar sessão extra
          </Botao>
          <Botao
            disabled={jogo.ocupado || !!jogo.pendente}
            onClick={() =>
              void jogo.agir("voto", {
                participante_id: p.lideres[0],
                aceita: false,
              })
            }
          >
            Encerrar empatado
          </Botao>
        </div>
      )}
      {!final && (
        <Botao
          className="botao-secundario"
          disabled={jogo.ocupado}
          onClick={() => definirEncerrar(true)}
        >
          Encerrar partida
        </Botao>
      )}
      <Dialogo
        aberto={sorteio}
        etiqueta="A ORDEM ESTÁ LANÇADA"
        titulo={p.extra ? "Sorteio do desempate" : "Quem abre o jogo?"}
        textoFechar="Liberar painel"
        aoFechar={liberar}
      >
        <p>A sequência oficial desta sessão é:</p>
        <ol className="ordem-galera sorteio-galera">
          {p.ordem.map((id, i) => {
            const a = e.participantes.find((a) => a.participante_id === id)!;
            return (
              <li key={id} style={{ animationDelay: `${i * 180}ms` }}>
                <span>{i + 1}º</span>
                <img src={`/avatares/${a.avatar_id}.webp`} alt="" />
                <strong>{a.nome}</strong>
              </li>
            );
          })}
        </ol>
      </Dialogo>
      <Dialogo
        aberto={encerrar || !!externa || bloqueio.state === "blocked"}
        etiqueta="ESSA DECISÃO ENCERRA O SHOW"
        titulo="Encerrar a partida da galera?"
        textoFechar="Continuar jogando"
        aoFechar={cancelar}
      >
        <p>
          Vence quem tiver mais pontos, ou fica empatado. Mostraremos as
          palavras desta sessão. As próximas continuam em segredo. Não será
          possível retomar.
        </p>
        {jogo.erro && <p role="alert">{jogo.erro}</p>}
        <Botao
          disabled={jogo.ocupado || !!jogo.pendente}
          onClick={() => void confirmarSaida()}
        >
          Confirmar encerramento
        </Botao>
      </Dialogo>
    </section>
  );
}
