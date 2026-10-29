import { formatarTempo } from "./usar-cronometro";
export function Cronometro({
  tempo,
  ativo,
  aviso,
}: {
  tempo: number;
  ativo: boolean;
  aviso: string;
}) {
  return (
    <aside
      className={`cronometro ${ativo ? "contando" : "suspenso"}`}
      aria-label="Tempo de jogo nesta palavra"
    >
      <div className="orbita-tempo" aria-hidden="true">
        <span>◷</span>
      </div>
      <div className="leitura-tempo">
        <span className="rotulo-tempo">SEU RITMO · SUA DESCOBERTA</span>
        <strong data-testid="tempo-palavra" aria-hidden="true">
          {formatarTempo(tempo)}
        </strong>
        <span className="estado-tempo">
          {ativo ? "EM JOGO" : "CONTAGEM SUSPENSA"}
          <i aria-hidden="true" />
        </span>
      </div>
      <span className="tempo-acessivel">
        {ativo
          ? "Cronômetro ativo, sem limite de tempo."
          : "Cronômetro suspenso."}
      </span>
      {aviso && (
        <p className="aviso-tempo" role="status">
          {aviso}
        </p>
      )}
    </aside>
  );
}
