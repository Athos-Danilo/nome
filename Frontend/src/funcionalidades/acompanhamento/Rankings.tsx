import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Carregando } from "../../componentes/Comuns";
import { consultarRanking, type Categoria } from "./api";
import { Cabecalho, FalhaConsulta, numero, Paginacao } from "./Comuns";
import "../../estilos/acompanhamento.css";
const categorias: [Categoria, string][] = [
  ["pontos", "Pontos"],
  ["palavras-acertadas", "Palavras acertadas"],
  ["partidas-concluidas", "Partidas concluídas"],
];
export function Rankings() {
  const [categoria, definirCategoria] = useState<Categoria>("pontos"),
    [pagina, definirPagina] = useState(1);
  const consulta = useQuery({
    queryKey: ["rankings", categoria, pagina],
    queryFn: () => consultarRanking(categoria, pagina),
  });
  return (
    <section className="conquistas">
      <Cabecalho
        etiqueta="TODO MUNDO TEM SEU MOMENTO DE BRILHAR"
        titulo="O palco das descobertas"
      >
        <p>
          Três jeitos de chegar longe. Classificações gerais de todos os tempos.
        </p>
      </Cabecalho>
      <div
        className="categorias-ranking"
        role="group"
        aria-label="Categoria do ranking"
      >
        {categorias.map(([id, nome]) => (
          <button
            key={id}
            className="botao-jogo"
            aria-pressed={categoria === id}
            onClick={() => {
              definirCategoria(id);
              definirPagina(1);
            }}
          >
            {nome}
          </button>
        ))}
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
          {!consulta.data.itens.length ? (
            <div className="vazio-conquistas">
              <span aria-hidden="true">♜</span>
              <p>O palco está esperando as primeiras descobertas.</p>
            </div>
          ) : (
            <div className="painel-classificacao">
              <div className="titulo-classificacao">
                <h2>{categorias.find(([id]) => id === categoria)?.[1]}</h2>
                <span>SOLO · GERAL</span>
              </div>
              <table className="tabela-classificacao">
                <caption className="somente-leitor">
                  Classificação por{" "}
                  {categorias.find(([id]) => id === categoria)?.[1]}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Posição</th>
                    <th scope="col">Jogador</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {consulta.data.itens.map((r, i) => (
                    <tr
                      key={`${pagina}-${i}`}
                      className={r.posicao === 1 ? "primeiro-ranking" : ""}
                    >
                      <td>
                        <span className="medalha-ranking">{r.posicao}º</span>
                      </td>
                      <th scope="row">{r.nome}</th>
                      <td>{numero(r.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Paginacao
            pagina={pagina}
            total={consulta.data.total}
            ocupado={consulta.isFetching}
            aoMudar={definirPagina}
          />
        </>
      )}
      <p className="nota-conquistas">
        Só contam partidas individuais encerradas, incluindo abandonos e
        demonstrações vinculadas. Partidas em aberto e da galera ficam de fora.
        Empates compartilham a posição: 1º, 1º, 3º.
      </p>
    </section>
  );
}
