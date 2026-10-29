import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router";
import { identificarVisitante } from "../demonstracao/api";
import { consultarPartidaEmAberto } from "../menu/api";
import { ativarDemonstracao, type Partida } from "./api";
import { ConfiguradorIndividual } from "./ConfiguradorIndividual";
import { PainelIndividual } from "./PainelIndividual";
import { Botao, Carregando, EstadoVazio } from "../../componentes/Comuns";
import type { Sessao } from "../perfil/api";
import "./individual.css";
export function RotaIndividual({
  conta,
}: {
  conta: Sessao | null | undefined;
}) {
  const { pathname } = useLocation();
  if (pathname === "/jogar/demonstracao")
    return <DemonstracaoJogavel key={conta?.jogador_id ?? "visitante"} />;
  if (!conta) return null;
  if (pathname === "/jogar/individual/novo")
    return <ConfiguradorIndividual token={conta.token_csrf} />;
  if (pathname === "/jogar/individual")
    return <ContinuarIndividual conta={conta} />;
  const id = pathname.slice("/jogar/individual/".length);
  return (
    <PainelIndividual
      key={`${conta.jogador_id}-${id}`}
      base={`/api/partidas/${encodeURIComponent(id)}`}
      token={conta.token_csrf}
    />
  );
}
function ContinuarIndividual({ conta }: { conta: Sessao }) {
  const consulta = useQuery({
    queryKey: ["partida-em-aberto", conta.jogador_id],
    queryFn: consultarPartidaEmAberto,
  });
  if (consulta.isPending) return <Carregando />;
  if (consulta.error)
    return (
      <EstadoVazio titulo="Vamos buscar suas pistas?">
        <p role="alert">{consulta.error.message}</p>
        <Botao onClick={() => void consulta.refetch()}>Tentar novamente</Botao>
      </EstadoVazio>
    );
  return (
    <Navigate
      to={
        consulta.data
          ? `/jogar/individual/${consulta.data.partida_id}`
          : "/jogar/individual/novo"
      }
      replace
    />
  );
}
function DemonstracaoJogavel() {
  const cache = useQueryClient();
  const consulta = useQuery({
    queryKey: ["visitante-jogo"],
    queryFn: identificarVisitante,
    staleTime: 0,
  });
  const [partida, definirPartida] = useState<Partida | null>(null);
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState("");
  async function iniciar() {
    if (ocupado || !consulta.data) return;
    definirOcupado(true);
    definirErro("");
    try {
      const p = await ativarDemonstracao(consulta.data.token_csrf);
      cache.setQueryData(["individual", "/api/demonstracoes/jogo"], p);
      definirPartida(p);
      void cache.invalidateQueries({ queryKey: ["visitante"] });
    } catch (e) {
      definirErro((e as Error).message);
    } finally {
      definirOcupado(false);
    }
  }
  if (consulta.isPending) return <Carregando />;
  if (consulta.error)
    return (
      <EstadoVazio titulo="Uma conexão para começar">
        <p role="alert">{consulta.error.message}</p>
        <Botao onClick={() => void consulta.refetch()}>Tentar novamente</Botao>
      </EstadoVazio>
    );
  if (partida)
    return (
      <PainelIndividual
        base="/api/demonstracoes/jogo"
        token={consulta.data!.token_csrf}
        demo
      />
    );
  if (consulta.data?.vinculada)
    return <Navigate to="/jogar/individual" replace />;
  return (
    <section className="entrada-demo">
      <div>
        <span className="etiqueta">UM GOSTINHO DO DECIFRA</span>
        <h1 tabIndex={-1}>
          Seu primeiro <em>ahá!</em>
        </h1>
        <p>
          Três palavras fáceis. Temas surpresa.
          <br />
          Até cinco pistas para cada descoberta.
        </p>
        <p>Quanto menos dicas, mais pontos: 100, 80, 60, 40 ou 20.</p>
        {erro && <p role="alert">{erro}</p>}
        <Botao
          className="acao botao-grande"
          onClick={() => void iniciar()}
          disabled={ocupado}
        >
          {ocupado
            ? "Preparando…"
            : consulta.data?.demonstracao
              ? "Continuar demonstração"
              : "Começar demonstração"}
        </Botao>
        <p>
          Uma demonstração por navegador. Entre com Google para guardar a
          partida inteira e jogar do seu jeito.
        </p>
        <a href="/api/autenticacao/google">Entrar com Google ↗</a>
      </div>
      <img
        src="/mascote/aurelio.png"
        alt="Aurélio convida para sua primeira descoberta"
      />
    </section>
  );
}
