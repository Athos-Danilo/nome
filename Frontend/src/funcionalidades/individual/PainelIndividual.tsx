import { Cronometro } from "./Cronometro";
import { useCronometro } from "./usar-cronometro";
import { PausaIndividual } from "./PausaIndividual";
import { useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router";
import { useSaidaPartida } from "./saida-partida";
import { useConexaoIndividual } from "./usar-conexao";
import { useRascunho } from "./usar-rascunho";
import { usePartida } from "./usar-partida";
import {
  Botao,
  Carregando,
  Dialogo,
  EstadoVazio,
} from "../../componentes/Comuns";
import { EditorResposta } from "../entrada/EditorResposta";
import { ResultadoIndividual } from "./ResultadoIndividual";
import { NIVEIS, TEMAS } from "./apresentacao";
import type { Rodada, TipoAcao } from "./api";
import { Aurelio } from "../mascote/Aurelio";
function Montagem({
  rodada,
  ocupado,
  aoEnviar,
  base,
  token,
  versao,
  aoPreparar,
  aoRecarregar,
}: {
  rodada: Rodada;
  ocupado: boolean;
  aoEnviar: (palpite: string) => void;
  base: string;
  token: string;
  versao: number;
  aoPreparar: (salvar: () => Promise<boolean>) => void;
  aoRecarregar: () => void;
}) {
  const rascunho = useRascunho(base, token, rodada, versao);
  useEffect(() => {
    aoPreparar(rascunho.salvar);
    return () => aoPreparar(async () => true);
  }, [aoPreparar, rascunho.salvar]);
  return (
    <>
      <EditorResposta
        estado={rascunho.entrada}
        aoAlterar={rascunho.alterar}
        aoEnviar={aoEnviar}
        ocupado={ocupado}
      />
      <p className="situacao-rascunho" role="status">
        {rascunho.aviso}
      </p>
      {rascunho.erro && (
        <div className="aviso-erro" role="alert">
          <p>{rascunho.erro}</p>
          <Botao onClick={() => void rascunho.salvar()}>
            Tentar salvar montagem
          </Botao>
          <Botao onClick={aoRecarregar}>Recarregar montagem salva</Botao>
        </div>
      )}
    </>
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
  const conexao = useConexaoIndividual(base, token, jogo.consulta.data);
  const estado = jogo.consulta.data;
  const cronometro = useCronometro(
    base,
    token,
    estado,
    estado?.estado === "em_andamento" &&
      conexao.pronta &&
      !conexao.semRede &&
      !jogo.ocupado &&
      !jogo.pendente &&
      !jogo.retorno,
  );
  const preparar = useRef<() => Promise<boolean>>(async () => true);
  const [externa, definirExterna] = useState<(() => void) | null>(null);
  const travaSaida = useRef(false);
  const [erroPreparacao, definirErroPreparacao] = useState("");
  const protecao = useSaidaPartida();
  const ativa = estado?.estado === "em_andamento";
  const bloqueio = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !!ativa && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    protecao.registrar(ativa ? (acao) => definirExterna(() => acao) : null);
    return () => protecao.registrar(null);
  }, [ativa, protecao]);
  const registrar = (salvar: () => Promise<boolean>) => {
    preparar.current = salvar;
  };
  async function agir(tipo: TipoAcao, palpite?: string) {
    cronometro.suspender();
    try {
      if (!(await cronometro.confirmar()) || !(await preparar.current())) {
        definirErroPreparacao(
          "Não foi possível confirmar o progresso. Confira o aviso da montagem ou do cronômetro e tente novamente.",
        );
        return false;
      }
      definirErroPreparacao("");
      return await jogo.agir(tipo, palpite);
    } finally {
      cronometro.liberar();
    }
  }
  function liberar() {
    if (bloqueio.state === "blocked") bloqueio.proceed();
    else {
      externa?.();
      definirExterna(null);
    }
  }
  async function sair() {
    if (travaSaida.current) return;
    travaSaida.current = true;
    try {
      if (estado?.estado === "em_andamento" && !(await agir("saida"))) return;
      liberar();
    } finally {
      travaSaida.current = false;
    }
  }
  function cancelar() {
    if (bloqueio.state === "blocked") bloqueio.reset();
    definirExterna(null);
  }
  return (
    <>
      <ConteudoIndividual
        base={base}
        token={token}
        demo={demo}
        jogo={jogo}
        conexao={conexao}
        agir={agir}
        registrar={registrar}
        cronometro={cronometro}
      />
      <Dialogo
        aberto={bloqueio.state === "blocked" || !!externa}
        titulo="Sair e guardar suas pistas?"
        aoFechar={cancelar}
      >
        <p>
          Sua partida será pausada com desconto de 100 pontos. As letras, dicas
          e descobertas confirmadas ficam guardadas.
        </p>
        {(jogo.erro || erroPreparacao) && (
          <p role="alert">{jogo.erro || erroPreparacao}</p>
        )}
        {jogo.pendente ? (
          <Botao
            disabled={jogo.ocupado}
            onClick={() =>
              void jogo.reenviar().then((ok) => {
                if (ok) liberar();
              })
            }
          >
            Reenviar mesma ação
          </Botao>
        ) : (
          <Botao
            className="acao"
            disabled={jogo.ocupado || conexao.semRede}
            onClick={() => void sair()}
          >
            Pausar e sair
          </Botao>
        )}
      </Dialogo>
    </>
  );
}
function ConteudoIndividual({
  base,
  token,
  demo,
  jogo,
  conexao,
  agir,
  registrar,
  cronometro,
}: {
  base: string;
  token: string;
  demo: boolean;
  jogo: ReturnType<typeof usePartida>;
  conexao: ReturnType<typeof useConexaoIndividual>;
  agir: (tipo: TipoAcao, palpite?: string) => Promise<boolean>;
  registrar: (salvar: () => Promise<boolean>) => void;
  cronometro: ReturnType<typeof useCronometro>;
}) {
  const [anteriores, definirAnteriores] = useState(false);
  const [confirmacao, definirConfirmacao] = useState<
    "palavra" | "partida" | "pausa" | null
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
  if (estado.estado === "pausada")
    return (
      <PausaIndividual
        partida={estado}
        ocupado={jogo.ocupado || conexao.semRede}
        pendente={!!jogo.pendente}
        erro={jogo.erro}
        aoRetomar={() => void agir("retomada")}
        aoEncerrar={() => void agir("encerramento")}
        aoReenviar={() => void jogo.reenviar()}
      />
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
        <Aurelio
          evento={{
            id: `retorno-${estado.versao}`,
            tipo:
              jogo.retorno.resultado === "acerto"
                ? "comemoracao"
                : "pensamento",
          }}
          tamanho="pequeno"
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
  const bloqueado =
    jogo.ocupado || !!jogo.pendente || !conexao.pronta || conexao.semRede;
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
      <Cronometro
        tempo={cronometro.tempo}
        ativo={cronometro.ativo}
        aviso={cronometro.aviso}
      />
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
          <Aurelio evento={jogo.reacaoMascote} />
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
              onClick={() => void agir("dicas")}
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
          {conexao.semRede && (
            <p className="aviso-erro" role="status">
              Sem conexão. Seu último progresso confirmado está salvo. Vamos
              reconectar sem desconto.
            </p>
          )}
          {conexao.erro && (
            <div className="aviso-erro" role="alert">
              <p>{conexao.erro}</p>
              <Botao onClick={() => void jogo.consulta.refetch()}>
                Conferir partida
              </Botao>
            </div>
          )}
          <Montagem
            key={`${rodada.rodada_id}-${jogo.limpeza}`}
            base={base}
            token={token}
            versao={estado.versao}
            aoPreparar={registrar}
            aoRecarregar={() => {
              void jogo.consulta.refetch().then(() => window.location.reload());
            }}
            rodada={rodada}
            ocupado={bloqueado}
            aoEnviar={(p) => void agir("palpites", p)}
          />
          <div className="desistencias-solo">
            <Botao
              disabled={bloqueado}
              onClick={() => definirConfirmacao("pausa")}
            >
              Pausar partida
            </Botao>
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
            : confirmacao === "pausa"
              ? "Fazer uma pausa?"
              : "Encerrar por aqui?"
        }
        aoFechar={() => definirConfirmacao(null)}
      >
        <p>
          {confirmacao === "pausa"
            ? "Sua partida fica guardada. Confirmar a pausa desconta 100 pontos, mesmo que seu saldo fique negativo."
            : confirmacao === "palavra"
              ? "Mostramos a resposta e seguimos para a próxima. Esta palavra vale zero pontos."
              : "Você mantém os pontos conquistados. Esta partida será encerrada definitivamente e não poderá ser retomada."}
        </p>
        <Botao
          className="acao"
          disabled={bloqueado}
          onClick={() => {
            void agir(
              confirmacao === "pausa"
                ? "pausa"
                : confirmacao === "palavra"
                  ? "desistencia-palavra"
                  : "encerramento",
            );
            definirConfirmacao(null);
          }}
        >
          {confirmacao === "pausa"
            ? "Confirmar pausa de 100 pontos"
            : confirmacao === "palavra"
              ? "Revelar e seguir"
              : "Encerrar definitivamente"}
        </Botao>
      </Dialogo>
    </section>
  );
}
