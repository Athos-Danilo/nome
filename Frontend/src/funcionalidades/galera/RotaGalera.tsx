import { useState } from "react";
import { PainelGalera } from "./PainelGalera";
import { enviarJogada } from "./painel-api";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import { Botao, Carregando, EstadoVazio } from "../../componentes/Comuns";
import type { Avatar, Sessao } from "../perfil/api";
import { ConfiguradorGalera } from "./ConfiguradorGalera";
import { consultarGalera } from "./api";
import { NIVEIS, TEMAS } from "../individual/apresentacao";
import "./galera.css";
export function RotaGalera({
  conta,
  avatares,
}: {
  conta: Sessao;
  avatares: Avatar[];
}) {
  const [erroInicio, definirErroInicio] = useState("");
  const [iniciando, definirIniciando] = useState(false);
  const { pathname } = useLocation();
  const novo = pathname === "/jogar/galera/novo";
  const id = pathname.slice("/jogar/galera/".length);
  const consulta = useQuery({
    queryKey: ["galera", conta.jogador_id, id],
    queryFn: () => consultarGalera(id),
    enabled: !novo,
  });
  if (novo) return <ConfiguradorGalera conta={conta} avatares={avatares} />;
  if (consulta.isPending) return <Carregando />;
  if (!consulta.data)
    return (
      <EstadoVazio titulo="Vamos buscar sua galera?">
        <p role="alert">{consulta.error?.message}</p>
        <Botao onClick={() => void consulta.refetch()}>Tentar novamente</Botao>
      </EstadoVazio>
    );
  const partida = consulta.data;
  if (partida.estado !== "preparada")
    return <PainelGalera id={id} token={conta.token_csrf} />;
  async function iniciar() {
    if (iniciando) return;
    definirIniciando(true);
    definirErroInicio("");
    try {
      await enviarJogada(
        id,
        {
          tipo: "iniciar",
          id_acao: crypto.randomUUID(),
          versao_esperada: consulta.data!.versao,
        },
        conta.token_csrf,
      );
      await consulta.refetch();
    } catch (e) {
      definirErroInicio((e as Error).message);
      await consulta.refetch();
    } finally {
      definirIniciando(false);
    }
  }
  return (
    <section className="galera-preparada">
      <span className="etiqueta">PARTIDA PREPARADA</span>
      <h1 tabIndex={-1}>Sua galera está reunida!</h1>
      <p>
        {partida.configuracao.quantidade_sessoes} sessões ·{" "}
        {NIVEIS[partida.configuracao.dificuldade]} ·{" "}
        {partida.participantes.length} palavras por sessão
      </p>
      <h2>Ordem sorteada para a primeira sessão</h2>
      <ol className="ordem-galera">
        {partida.ordem_primeira_sessao.map((id) => {
          const p = partida.participantes.find(
            (p) => p.participante_id === id,
          )!;
          return (
            <li key={id}>
              <img src={`/avatares/${p.avatar_id}.webp`} alt="" />
              <strong>{p.nome}</strong>
              {p.anfitriao && <span>Você</span>}
            </li>
          );
        })}
      </ol>
      <p>
        {partida.configuracao.modo_tematicas === "aleatorio"
          ? "A sequência de temáticas continua em segredo."
          : `Temáticas: ${partida.configuracao.tematicas?.map((t) => TEMAS[t]).join(" → ")}`}
      </p>
      {erroInicio && <p role="alert">{erroInicio}</p>}
      <Botao disabled={iniciando} onClick={() => void iniciar()}>
        Iniciar desafio
      </Botao>
      <div className="resumo-disputa">
        <h2>Seu próximo show de descobertas</h2>
        <p>
          A configuração e a ordem estão salvas. Preparem as ideias: cada nova
          posição revelada vale 100 pontos!
        </p>
      </div>
    </section>
  );
}
