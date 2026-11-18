import "../../estilos/partidas.css";
import { Cronometro } from "./Cronometro";
import { useCronometro } from "./usar-cronometro";
import { PausaIndividual } from "./PausaIndividual";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { IndicadorProcessamento } from "../../componentes/IndicadorProcessamento";
import type { AcaoProcessamento } from "../../componentes/carregamento";
import { EditorResposta } from "../entrada/EditorResposta";
import { ResultadoIndividual } from "./ResultadoIndividual";
import { NIVEIS, TEMAS } from "./apresentacao";
import type { Rodada, TipoAcao } from "./api";
import { Aurelio } from "../mascote/Aurelio";
import { falaSolo } from "../mascote/falas-partida";
import type { DirecaoOlhar } from "../mascote/gestos-menu";
import { useToqueMascote } from "../mascote/usar-toque-mascote";
import { useTrilhaPartida } from "../audio/ProvedorAudio";
import { ValorAnimado } from "../../componentes/Tela";

const ACAO_SOLO_MAPA: Record<TipoAcao, AcaoProcessamento> = {
  palpites: "palpite",
  dicas: "dica",
  "desistencia-palavra": "desistencia_palavra",
  pausa: "pausa",
  retomada: "retomada",
  encerramento: "encerramento",
  saida: "saida",
};

function Montagem({
  rodada,
  ocupado,
  rotuloOcupado,
  aoEnviar,
  aoObservarMontagem,
  base,
  token,
  versao,
  aoPreparar,
  aoRecarregar,
}: {
  rodada: Rodada;
  ocupado: boolean;
  rotuloOcupado?: string;
  aoEnviar: (palpite: string) => void;
  aoObservarMontagem?: (direcao: DirecaoOlhar) => void;
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
        aoObservarMontagem={aoObservarMontagem}
        ocupado={ocupado}
        rotuloOcupado={rotuloOcupado}
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
  useTrilhaPartida(
    estado?.estado === "em_andamento" && conexao.pronta && !conexao.semRede,
  );
  const travaPreparacao = useRef(false);
  const [preparandoTipo, definirPreparandoTipo] = useState<TipoAcao | null>(
    null,
  );
  const acaoAtiva = preparandoTipo ?? jogo.acaoEmCurso;
  const processando = !!acaoAtiva;
  const cronometro = useCronometro(
    base,
    token,
    estado,
    estado?.estado === "em_andamento" &&
      conexao.pronta &&
      !conexao.semRede &&
      !processando &&
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
    if (travaPreparacao.current || jogo.ocupado) return false;
    travaPreparacao.current = true;
    definirPreparandoTipo(tipo);
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
      travaPreparacao.current = false;
      definirPreparandoTipo(null);
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
  const sincronizando =
    !acaoAtiva &&
    estado?.estado === "em_andamento" &&
    !conexao.pronta &&
    !conexao.semRede &&
    !conexao.erro &&
    !jogo.retorno;
  return (
    <>
      <ConteudoIndividual
        base={base}
        token={token}
        demo={demo}
        jogo={jogo}
        conexao={conexao}
        acaoAtiva={acaoAtiva}
        agir={agir}
        registrar={registrar}
        cronometro={cronometro}
      />
      <IndicadorProcessamento
        ativo={processando || sincronizando}
        acao={acaoAtiva ? ACAO_SOLO_MAPA[acaoAtiva] : "sincronizacao"}
        modo={demo ? "demonstracao" : "solo"}
        atrasoMs={processando ? 0 : 180}
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
            disabled={processando}
            data-carregando={processando || undefined}
            onClick={() =>
              void jogo.reenviar().then((ok) => {
                if (ok) liberar();
              })
            }
          >
            {processando ? "Reenviando…" : "Reenviar mesma ação"}
          </Botao>
        ) : (
          <Botao
            className="acao"
            disabled={processando || conexao.semRede}
            data-carregando={acaoAtiva === "saida" || undefined}
            onClick={() => void sair()}
          >
            {acaoAtiva === "saida" ? (
              <>
                <span className="pulso-botao" aria-hidden="true" />
                Pausando partida…
              </>
            ) : (
              "Pausar e sair"
            )}
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
  acaoAtiva,
  agir,
  registrar,
  cronometro,
}: {
  base: string;
  token: string;
  demo: boolean;
  jogo: ReturnType<typeof usePartida>;
  conexao: ReturnType<typeof useConexaoIndividual>;
  acaoAtiva: TipoAcao | null;
  agir: (tipo: TipoAcao, palpite?: string) => Promise<boolean>;
  registrar: (salvar: () => Promise<boolean>) => void;
  cronometro: ReturnType<typeof useCronometro>;
}) {
  const [anteriores, definirAnteriores] = useState(false);
  const [confirmacao, definirConfirmacao] = useState<
    "palavra" | "partida" | "pausa" | null
  >(null);
  const [olharVivo, definirOlharVivo] = useState<DirecaoOlhar>();
  const toque = useToqueMascote("solo");
  const limparOlharRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    toque.limpar();
    definirOlharVivo(undefined);
  }, [jogo.reacaoMascote?.id, toque.limpar]);

  useEffect(() => {
    return () => {
      if (limparOlharRef.current) window.clearTimeout(limparOlharRef.current);
    };
  }, []);

  const observarMontagem = useCallback((direcao: DirecaoOlhar) => {
    definirOlharVivo(direcao);
    if (limparOlharRef.current) window.clearTimeout(limparOlharRef.current);
    limparOlharRef.current = window.setTimeout(
      () => definirOlharVivo(undefined),
      2200,
    );
  }, []);
  const estado = jogo.consulta.data;
  if (jogo.consulta.isPending)
    return <Carregando contexto={demo ? "demonstracao" : "solo"} />;
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
        ocupado={!!acaoAtiva || conexao.semRede}
        acaoAtiva={acaoAtiva}
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
            id: `${estado.partida_id}:retorno-${estado.versao}`,
            tipo:
              jogo.retorno.resultado === "acerto"
                ? (jogo.retorno.pontos ?? 0) >= 100
                  ? "comemoracao_epica"
                  : "comemoracao"
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
    !!acaoAtiva || !!jogo.pendente || !conexao.pronta || conexao.semRede;
  return (
    <section className="partida-solo" aria-busy={!!acaoAtiva}>
      <header className="hud-solo">
        <div>
          <span className="etiqueta">
            {demo ? "SEU PRIMEIRO DECIFRA" : "MODO SOLO"}
          </span>
          <h1 tabIndex={-1}>Siga sua curiosidade.</h1>
        </div>
        <Cronometro
          tempo={cronometro.tempo}
          ativo={cronometro.ativo}
          aviso={cronometro.aviso}
        />
        <div className="placar-solo">
          <span>SEUS PONTOS</span>
          <strong>
            <ValorAnimado valor={estado.pontuacao} />
          </strong>
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
        <div className="pistas-solo">
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
              data-carregando={acaoAtiva === "dicas" || undefined}
              onClick={() => void agir("dicas")}
            >
              {acaoAtiva === "dicas" ? (
                <>
                  <span className="pulso-botao" aria-hidden="true" />
                  Buscando dica…
                </>
              ) : (
                "Pedir outra dica"
              )}
            </Botao>
            <Botao
              onClick={() => definirAnteriores(true)}
              disabled={rodada.dica_atual === 1}
            >
              Ver dicas anteriores
            </Botao>
          </div>
          <aside className="aurelio-partida">
            <Aurelio
              evento={jogo.reacaoMascote}
              gesto={toque.gesto}
              olharVivo={olharVivo}
              aoAtivar={toque.tocar}
              rotuloInteracao="Conversar com Aurélio durante a rodada"
            />
            {(() => {
              const fala = falaSolo({
                reacao: jogo.reacaoMascote?.tipo,
                dicaAtual: rodada.dica_atual,
                seed: estado.versao,
                toque: toque.gesto ? toque.contagem : 0,
              });
              return (
                <p>
                  {fala.titulo}
                  <br />
                  <em>{fala.subtitulo}</em>
                </p>
              );
            })()}
            <span className="estrela-solo" aria-hidden="true">
              ✦
            </span>
          </aside>
        </div>
        <div className="desafio-solo">
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
            rotuloOcupado={
              acaoAtiva === "palpites" ? "Conferindo palpite…" : "Aguarde…"
            }
            aoObservarMontagem={observarMontagem}
            aoEnviar={(p) => void agir("palpites", p)}
          />

          {demo && (
            <a className="convite-google" href="/api/autenticacao/google">
              Seu perfil, seus desafios. Guardar com Google ↗
            </a>
          )}
        </div>
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
