import { formatarTempo } from "./usar-cronometro";
import { Link } from "react-router";
import type { Partida } from "./api";
export function ResultadoIndividual({
  partida,
  demo,
}: {
  partida: Partida;
  demo: boolean;
}) {
  return (
    <section className="resultado-solo">
      <div className="chuva-descobertas" aria-hidden="true">
        ✦ <span>✧</span> ✦
      </div>
      <span className="etiqueta">
        {partida.estado === "concluida"
          ? "TRILHA COMPLETA"
          : "DESCOBERTAS GUARDADAS"}
      </span>
      <h1 tabIndex={-1}>
        {partida.estado === "concluida"
          ? "Você decifrou!"
          : "Até a próxima descoberta"}
      </h1>
      <p>Cada tentativa conta uma história. Essa foi a sua.</p>
      <div className="placar-final">
        <span>SEUS PONTOS</span>
        <strong data-testid="pontos-resultado">{partida.pontuacao}</strong>
        <span>
          {partida.acertos} acertos · {partida.rodadas_concluidas} de{" "}
          {partida.quantidade_palavras} palavras
        </span>
      </div>
      <div className="resumo-tempo">
        <span>
          {partida.estado === "abandonada"
            ? "Tempo jogado até o encerramento"
            : "Tempo total de jogo"}
        </span>
        <strong data-testid="tempo-total">
          {formatarTempo(partida.tempo_total_ms)}
        </strong>
        {partida.tempo_completo === false && partida.tempo_total_ms != null && (
          <small>Medição parcial: há palavras sem tempo registrado.</small>
        )}
      </div>
      <div className="respostas-resultado">
        {partida.resumo_rodadas.map((r) => (
          <article key={r.ordem}>
            <span className="numero-resultado">
              {String(r.ordem).padStart(2, "0")}
            </span>
            <div>
              <h2>{r.resposta}</h2>
              <p>
                {r.estado === "acertada"
                  ? "Decifrada"
                  : r.estado === "interrompida"
                    ? "Interrompida"
                    : "Palavra revelada"}{" "}
                · {r.dicas_utilizadas}{" "}
                {r.dicas_utilizadas === 1 ? "dica" : "dicas"}
              </p>
            </div>
            <div className="tempo-resultado">
              <strong>+{r.pontos}</strong>
              <span>{formatarTempo(r.tempo_ativo_ms)}</span>
            </div>
          </article>
        ))}
      </div>
      {partida.estado === "abandonada" && (
        <p>
          As palavras que você ainda não viu continuam em segredo. Esta partida
          foi encerrada definitivamente.
        </p>
      )}
      <div className="acoes-resultado">
        {demo ? (
          <>
            <p>
              Leve essa partida inteira para seu perfil. O vínculo fica
              disponível por sete dias após o início.
            </p>
            <a className="acao botao-grande" href="/api/autenticacao/google">
              Guardar com Google
            </a>
          </>
        ) : (
          <Link className="acao botao-grande" to="/jogar/individual/novo">
            Outra descoberta?
          </Link>
        )}
        <Link className="botao-jogo" to="/">
          Voltar ao menu
        </Link>
      </div>
    </section>
  );
}
