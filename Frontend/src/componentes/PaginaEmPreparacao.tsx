import { Link } from "react-router";
import { EstadoVazio } from "./Comuns";
const paginas: Record<
  string,
  { titulo: string; texto: string; simbolo: string }
> = {
  "/jogar/individual/novo": {
    titulo: "Seu próximo desafio",
    texto:
      "Aqui você vai escolher a temática, a quantidade de palavras e as dificuldades. A configuração da partida está em preparação.",
    simbolo: "D I ?",
  },
  "/jogar/galera/novo": {
    titulo: "Chame sua galera",
    texto:
      "Até três pessoas, um dispositivo e uma boa disputa. A configuração dos participantes e das sessões está em preparação.",
    simbolo: "☺ ✦ ☺",
  },
  "/jogar/individual": {
    titulo: "Sua descoberta continua aqui",
    texto:
      "Seu progresso confirmado continua salvo. O painel para jogar e retomar a partida está em preparação.",
    simbolo: "↗",
  },
  "/jogar/galera": {
    titulo: "O palco é de vocês",
    texto: "O painel compartilhado da galera está em preparação.",
    simbolo: "✦",
  },
  "/jogar/demonstracao": {
    titulo: "Um gostinho do Decifra",
    texto:
      "Três palavras fáceis, temas surpresa. A demonstração jogável está em preparação; abrir esta tela não consome seu teste.",
    simbolo: "?",
  },
  "/perfil/historico": {
    titulo: "Suas descobertas",
    texto:
      "Seu histórico e suas estatísticas são privados. Esta área está em preparação; suas partidas confirmadas continuam guardadas.",
    simbolo: "▤",
  },
  "/rankings": {
    titulo: "Cada descoberta conta",
    texto:
      "Palavras acertadas, partidas concluídas e pontos: os rankings gerais do modo individual estão em preparação.",
    simbolo: "♜",
  },
};
export function PaginaEmPreparacao({ caminho }: { caminho: string }) {
  const pagina = paginas[caminho];
  return (
    <EstadoVazio
      titulo={pagina?.titulo ?? "Essa pista não leva a uma página"}
      simbolo={pagina?.simbolo ?? "?"}
    >
      <p>
        {pagina?.texto ?? "Volte ao menu para escolher seu próximo caminho."}
      </p>
      {pagina && <span className="selo-preparacao">Em preparação</span>}
      <Link to="/" className="acao">
        Escolher outro caminho →
      </Link>
    </EstadoVazio>
  );
}
