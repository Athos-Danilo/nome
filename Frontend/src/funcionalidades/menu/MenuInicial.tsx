import { BalaoMenu } from "./BalaoMenu";
import { contextoDasFalas } from "./falas-menu";
import type { UseQueryResult } from "@tanstack/react-query";
import type { PartidaEmAberto } from "./api";
import { useEffect, useRef } from "react";
import { CenarioMenu } from "./CenarioMenu";
import { useEntradaMenu } from "./usar-entrada-menu";
import "./entrada-menu.css";
import { useAgendaMenu } from "./usar-agenda-menu";
import { DURACOES } from "../mascote/reacoes";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CartaoModo } from "../../componentes/CartaoModo";
import { SituacaoDemonstracao } from "../demonstracao/SituacaoDemonstracao";
import { consultarPartidaEmAberto } from "./api";
import { ErroDaApi, type Sessao } from "../perfil/api";
import { Aurelio } from "../mascote/Aurelio";
import { identificarVisitante } from "../demonstracao/api";
export function MenuInicial({
  conta,
  aoExpirar,
}: {
  conta: Sessao | null | undefined;
  aoExpirar: (erro: Error) => void;
}) {
  const elemento = useRef<HTMLDivElement>(null);
  const contexto = conta?.jogador_id ?? "visitante";
  const visitante = useQuery({
    queryKey: ["visitante", false],
    queryFn: identificarVisitante,
    enabled: !conta,
  });
  const agenda = useAgendaMenu(elemento, contexto, !conta && visitante.isError);
  const entrada = useEntradaMenu(agenda.reduzida, contexto);
  const utilizada = !conta && visitante.data?.demonstracao_utilizada;
  const continuidade = useQuery({
    queryKey: ["partida-em-aberto", conta?.jogador_id],
    queryFn: consultarPartidaEmAberto,
    enabled: !!conta,
  });
  const contextoFalas = contextoDasFalas(
    !!conta,
    visitante.isSuccess ? visitante.data.demonstracao_utilizada : undefined,
    continuidade.isSuccess && !!continuidade.data,
  );

  const registradas = useRef({ contexto, ids: new Set<string>() });
  const solicitar = agenda.solicitar;
  useEffect(() => {
    if (
      entrada === "estatica" ||
      agenda.pausada ||
      (!conta && !visitante.isSuccess)
    )
      return;
    const id =
      entrada === "retorno"
        ? "retorno-menu"
        : utilizada
          ? "convite-continuar"
          : "entrada-menu";
    if (registradas.current.contexto !== contexto)
      registradas.current = { contexto, ids: new Set<string>() };
    if (registradas.current.ids.has(id)) return;
    const reacao = utilizada ? "apresentacao" : "saudacao";
    if (
      solicitar({
        id,
        tipo: "entrada",
        duracao: entrada === "retorno" ? 260 : DURACOES[reacao],
        conteudo: reacao,
      })
    )
      registradas.current.ids.add(id);
  }, [
    agenda.pausada,
    !!conta,
    visitante.isSuccess,
    utilizada,
    solicitar,
    entrada,
    contexto,
  ]);
  return (
    <div
      ref={elemento}
      className={conta ? "sala-jogo" : "sala-jogo sala-visitante"}
      data-entrada={entrada}
      data-agenda={agenda.pausada ? "pausada" : "ativa"}
      data-acontecimento={agenda.ativa?.tipo ?? "repouso"}
      data-ausente={agenda.ausente}
      data-reduzida={agenda.reduzida}
    >
      <section className="boas-vindas-menu">
        <span className="etiqueta">
          {conta
            ? `OLÁ, ${conta.nome_usuario?.toUpperCase()}. QUE BOM TE VER!`
            : utilizada
              ? "SUA CURIOSIDADE CONTINUA AQUI"
              : "SEU PRIMEIRO DESAFIO COMEÇA AQUI"}
        </span>
        <h1 tabIndex={-1}>
          Bora <span>decifrar?</span>
        </h1>
        <p>
          Boas pistas. Grandes descobertas.
          <br />
          <em>O próximo “ah, já sei!” é seu.</em>
        </p>
        <div className="palco-menu">
          <CenarioMenu pausada={agenda.pausada} reduzida={agenda.reduzida} />
          <Aurelio
            key={`${contexto}:${entrada}`}
            evento={
              entrada === "primeira"
                ? {
                    id: utilizada ? "convite-continuar" : "entrada-menu",
                    tipo: utilizada ? "apresentacao" : "saudacao",
                  }
                : undefined
            }
            pausado={agenda.pausada}
            tamanho="grande"
          />
          <BalaoMenu
            key={`${contexto}:${contextoFalas}`}
            contexto={contextoFalas}
            ativa={agenda.ativa}
            configurar={agenda.configurar}
          />
        </div>
      </section>
      <section className="escolhas-menu" aria-label="Escolha seu caminho">
        {conta ? (
          <>
            <SituacaoDemonstracao tokenConta={conta.token_csrf} />
            <Continuidade consulta={continuidade} aoExpirar={aoExpirar} />
            <div className="cartoes-modos">
              <CartaoModo
                modo="solo"
                destino="/jogar/individual/novo"
                titulo="Solo"
                descricao="Uma palavra. Cinco pistas. Você."
              />
              <CartaoModo
                modo="galera"
                destino="/jogar/galera/novo"
                titulo="Galera"
                descricao="Uma boa disputa começa aqui."
                imagens={[
                  "coruja_sabia",
                  "capivara_zen",
                  "aurelio_comemorando",
                ]}
              />
            </div>
          </>
        ) : (
          <div className="convite-menu">
            <SituacaoDemonstracao />
            <a
              className="acao botao-grande google-menu"
              href="/api/autenticacao/google"
            >
              <svg
                className="simbolo-google"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.96Z"
                />
              </svg>{" "}
              Entrar com Google <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
function Continuidade({
  consulta,
  aoExpirar,
}: {
  consulta: UseQueryResult<PartidaEmAberto | null, Error>;
  aoExpirar: (erro: Error) => void;
}) {
  useEffect(() => {
    if (
      consulta.error instanceof ErroDaApi &&
      ["SESSAO_EXPIRADA", "SESSAO_NECESSARIA"].includes(consulta.error.codigo)
    )
      aoExpirar(consulta.error);
  }, [consulta.error, aoExpirar]);
  if (consulta.isPending)
    return <p role="status">Conferindo suas descobertas…</p>;
  if (consulta.error)
    return (
      <div className="aviso-erro" role="alert">
        <p>{consulta.error.message}</p>
        <button onClick={() => void consulta.refetch()}>
          Conferir partida novamente
        </button>
      </div>
    );
  if (!consulta.data) return null;
  const partida = consulta.data;
  return (
    <div className="continuar-menu">
      <div>
        <span className="etiqueta">FICOU UMA DESCOBERTA PELA METADE</span>
        <h2>Vamos continuar?</h2>
        <p>
          {partida.rodadas_concluidas} de {partida.quantidade_palavras} palavras
          concluídas · {partida.pontuacao} pontos
        </p>
      </div>
      <Link
        to="/jogar/individual"
        className="acao"
        aria-label="Continuar partida"
      >
        Continuar <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
