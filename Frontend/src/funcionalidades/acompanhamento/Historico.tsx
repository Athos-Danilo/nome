import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Carregando } from "../../componentes/Comuns";
import { consultarHistorico, type Modo, type Situacao } from "./api";
import {
  Cabecalho,
  data,
  FalhaConsulta,
  nomes,
  numero,
  Paginacao,
} from "./Comuns";
import "../../estilos/acompanhamento.css";

export function Historico({ jogadorId }: { jogadorId: string }) {
  const [pagina, definirPagina] = useState(1),
    [modo, definirModo] = useState<Modo>(""),
    [estado, definirEstado] = useState<Situacao>("");
  const consulta = useQuery({
    queryKey: ["historico", jogadorId, pagina, modo, estado],
    queryFn: () => consultarHistorico(pagina, modo, estado),
  });
  return (
    <section className="conquistas">
      <Cabecalho
        etiqueta="SEU CAMINHO, SUAS DESCOBERTAS"
        titulo="Seu álbum de descobertas"
      >
        <p>Uma partida de cada vez. Aqui ficam os desafios que você viveu.</p>
        <Link className="acao" to="/perfil/estatisticas">
          Ver minhas estatísticas ↗
        </Link>
      </Cabecalho>
      <div className="filtros-conquistas">
        <label>
          Modo de jogo
          <select
            value={modo}
            onChange={(e) => {
              definirModo(e.target.value as Modo);
              definirPagina(1);
            }}
          >
            <option value="">Todos os modos</option>
            <option value="individual">Solo</option>
            <option value="galera">Galera</option>
          </select>
        </label>
        <label>
          Situação
          <select
            value={estado}
            onChange={(e) => {
              definirEstado(e.target.value as Situacao);
              definirPagina(1);
            }}
          >
            <option value="">Todas as situações</option>
            {[
              "preparada",
              "em_andamento",
              "pausada",
              "concluida",
              "abandonada",
            ].map((v) => (
              <option key={v} value={v}>
                {nomes[v]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {consulta.isPending ? (
        <Carregando />
      ) : consulta.error ? (
        <FalhaConsulta
          erro={consulta.error}
          repetir={() => void consulta.refetch()}
        />
      ) : (
        <>
          <div className="album-partidas">
            {!consulta.data.itens.length && (
              <div className="vazio-conquistas">
                <span aria-hidden="true">▤</span>
                <p>
                  {modo || estado
                    ? "Nenhuma partida para estes filtros."
                    : "Seu álbum começa na próxima partida."}
                </p>
                <Link to="/jogar/individual/novo">
                  Escolher meu próximo desafio →
                </Link>
              </div>
            )}
            {consulta.data.itens.map((p) => (
              <article className="lembranca-partida" key={p.partida_id}>
                <div className="topo-lembranca">
                  <span className="modo-lembranca">
                    {p.modo === "galera" ? "✦ GALERA" : "▦ SOLO"}
                    {p.origem === "demonstracao" ? " · DEMONSTRAÇÃO" : ""}
                  </span>
                  <span className="situacao-lembranca">{nomes[p.estado]}</span>
                </div>
                <p className="data-lembranca">
                  <time dateTime={p.criado_em}>{data(p.criado_em)}</time>
                </p>
                {p.modo === "individual" ? (
                  <>
                    <strong className="pontos-lembranca">
                      {numero(p.pontuacao)} <small>pontos</small>
                    </strong>
                    <p>
                      {p.acertos} acertos · {p.palavras} palavras na partida
                    </p>
                    {!["concluida", "abandonada"].includes(p.estado) && (
                      <Link
                        className="acao"
                        to={`/jogar/individual/${p.partida_id}`}
                      >
                        Continuar partida →
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <ul className="placar-lembranca">
                      {p.participantes.map((g, i) => (
                        <li key={i}>
                          {g.nome} · {numero(g.pontos)} pontos
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>
                        {p.estado === "concluida" || p.estado === "abandonada"
                          ? p.resultado_galera === "empate"
                            ? `Empate: ${p.vencedores.join(", ")}`
                            : `Venceu: ${p.vencedores.join(", ")}`
                          : "Partida em andamento"}
                      </strong>
                    </p>
                    {p.motivo_encerramento && (
                      <p>
                        {["sessoes_concluidas", "conclusao"].includes(
                          p.motivo_encerramento,
                        )
                          ? "Sessões concluídas"
                          : p.estado === "abandonada"
                            ? "Encerrada por saída ou desistência"
                            : "Partida encerrada"}
                      </p>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
          <Paginacao
            pagina={pagina}
            total={consulta.data.total}
            ocupado={consulta.isFetching}
            aoMudar={definirPagina}
          />
        </>
      )}
    </section>
  );
}
