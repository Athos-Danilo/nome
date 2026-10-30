import type { ReactNode } from "react";
import { Botao } from "../../componentes/Comuns";

export const numero = (valor: number) =>
  new Intl.NumberFormat("pt-BR").format(valor).replace("-", "−");
export const data = (valor: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(valor));
export const nomes: Record<string, string> = {
  individual: "Solo",
  galera: "Galera",
  preparada: "Preparada",
  em_andamento: "Em andamento",
  pausada: "Pausada",
  concluida: "Concluída",
  abandonada: "Abandonada",
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
  paises: "Países",
  animais: "Animais",
  objetos: "Objetos",
  marcas: "Marcas",
  "filmes-e-series": "Filmes e séries",
};
export function Cabecalho({
  etiqueta,
  titulo,
  children,
}: {
  etiqueta: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <header className="abertura-conquistas">
      <div>
        <span className="etiqueta">{etiqueta}</span>
        <h1 tabIndex={-1}>{titulo}</h1>
        {children}
      </div>
      <div className="selo-conquistas" aria-hidden="true">
        ✦<span>MAIS UM AHÁ!</span>
      </div>
    </header>
  );
}
export function Paginacao({
  pagina,
  total,
  ocupado,
  aoMudar,
}: {
  pagina: number;
  total: number;
  ocupado: boolean;
  aoMudar: (n: number) => void;
}) {
  const paginas = Math.max(1, Math.ceil(total / 10));
  return (
    <nav className="paginacao-conquistas" aria-label="Páginas dos resultados">
      <Botao
        disabled={ocupado || pagina <= 1}
        onClick={() => aoMudar(pagina - 1)}
        aria-label="Página anterior"
      >
        ←
      </Botao>
      <span role="status">
        Página {pagina} de {paginas} · {numero(total)} registros
      </span>
      <Botao
        disabled={ocupado || pagina >= paginas}
        onClick={() => aoMudar(pagina + 1)}
        aria-label="Próxima página"
      >
        →
      </Botao>
    </nav>
  );
}
export function FalhaConsulta({
  erro,
  repetir,
}: {
  erro: Error;
  repetir: () => void;
}) {
  return (
    <section className="falha-conquistas">
      <p role="alert">{erro.message}</p>
      <Botao onClick={repetir}>Tentar novamente</Botao>
      <a href="/api/autenticacao/google">Entrar com Google</a>
    </section>
  );
}
