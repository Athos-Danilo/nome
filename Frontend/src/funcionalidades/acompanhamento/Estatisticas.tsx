import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Carregando } from "../../componentes/Comuns";
import { consultarEstatisticas, type Desempenho } from "./api";
import { Cabecalho, FalhaConsulta, nomes, numero } from "./Comuns";
import "../../estilos/acompanhamento.css";

const media = (n: number | null) =>
  n === null
    ? "—"
    : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(n);
function Grupos({
  titulo,
  dados,
}: {
  titulo: string;
  dados: Record<string, Desempenho>;
}) {
  return (
    <section className="grupos-desempenho">
      <h2>{titulo}</h2>
      {Object.keys(dados).length ? (
        <div className="grade-desempenho">
          {Object.entries(dados).map(([chave, d]) => (
            <article key={chave}>
              <h3>{nomes[chave] ?? chave}</h3>
              <strong>
                {numero(d.palavras_acertadas)} <small>acertos</small>
              </strong>
              <dl>
                <div>
                  <dt>Apresentadas</dt>
                  <dd>{numero(d.palavras_apresentadas)}</dd>
                </div>
                <div>
                  <dt>Desistências de palavras</dt>
                  <dd>{numero(d.palavras_desistidas)}</dd>
                </div>
                <div>
                  <dt>Palpites errados</dt>
                  <dd>{numero(d.erros)}</dd>
                </div>
                <div>
                  <dt>Pontos das palavras</dt>
                  <dd>{numero(d.pontos)}</dd>
                </div>
                <div>
                  <dt>Média de dicas</dt>
                  <dd>{media(d.media_dicas)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <p>Ainda não há palavras apresentadas em partidas encerradas.</p>
      )}
    </section>
  );
}
export function Estatisticas({ jogadorId }: { jogadorId: string }) {
  return (
    <section className="conquistas">
      <Cabecalho
        etiqueta="CURIOSIDADE QUE VIRA CONQUISTA"
        titulo="Cada descoberta conta"
      >
        <p>
          Seu desempenho no Solo, só seu. Demonstrações vinculadas também entram
          aqui.
        </p>
        <Link to="/perfil/historico">Voltar ao meu histórico →</Link>
      </Cabecalho>
      <Indicadores jogadorId={jogadorId} />
    </section>
  );
}
function Indicadores({ jogadorId }: { jogadorId: string }) {
  const consulta = useQuery({
    queryKey: ["estatisticas", jogadorId],
    queryFn: consultarEstatisticas,
  });
  if (consulta.isPending) return <Carregando />;
  if (consulta.error)
    return (
      <FalhaConsulta
        erro={consulta.error}
        repetir={() => void consulta.refetch()}
      />
    );
  const { resumo: r, em_aberto: aberta } = consulta.data;
  const indicadores = [
    ["Partidas encerradas", numero(r.partidas_encerradas)],
    ["Partidas concluídas", numero(r.partidas_concluidas)],
    ["Partidas abandonadas", numero(r.partidas_abandonadas)],
    ["Palavras acertadas", numero(r.palavras_acertadas)],
    ["Desistências de palavras", numero(r.palavras_desistidas)],
    ["Palpites errados", numero(r.erros)],
    [
      "Melhor pontuação",
      r.melhor_pontuacao === null ? "—" : numero(r.melhor_pontuacao),
    ],
    ["Média de dicas nos acertos", media(r.media_dicas)],
  ];
  return (
    <>
      <div className="placar-pessoal">
        <span className="etiqueta">SEU SALDO NO SOLO</span>
        <strong>
          {numero(r.pontos)} <small>pontos</small>
        </strong>
        <p>
          Apenas partidas concluídas ou abandonadas. A galera tem seu próprio
          placar em cada partida.
        </p>
      </div>
      {!r.partidas_encerradas && (
        <p className="nota-conquistas">
          Seus indicadores começam com a primeira partida encerrada. “—”
          significa que ainda não há uma medida.
        </p>
      )}
      <dl className="indicadores-conquistas">
        {indicadores.map(([nome, valor]) => (
          <div key={nome}>
            <dt>{nome}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
      {aberta && (
        <aside className="progresso-separado">
          <span className="etiqueta">AINDA TEM DESCOBERTA PELA FRENTE</span>
          <h2>Sua partida em aberto</h2>
          <p>
            {nomes[aberta.estado]} · {numero(aberta.pontuacao)} pontos
            provisórios · {aberta.acertos} acertos em {aberta.palavras} palavras
          </p>
          <p>Este progresso ainda não entra nos totais nem nos rankings.</p>
          <Link className="acao" to={`/jogar/individual/${aberta.partida_id}`}>
            Continuar partida →
          </Link>
        </aside>
      )}
      <Grupos titulo="Por temática" dados={consulta.data.por_tematica} />
      <p className="nota-conquistas">
        Uma palavra pode pertencer a mais de uma temática: não some os grupos.
        Os pontos das palavras não incluem penalidades de pausa.
      </p>
      <Grupos titulo="Por dificuldade" dados={consulta.data.por_dificuldade} />
      <p className="nota-conquistas">
        A média usa somente a dica em que cada palavra foi acertada. Pedir dicas
        não conta como erro; um palpite enviado e incorreto conta.
      </p>
    </>
  );
}
