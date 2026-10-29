import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../estilos/base.css";
import { EditorResposta } from "../../funcionalidades/entrada/EditorResposta";
import {
  criarEntrada,
  type EspecificacaoEntrada,
} from "../../funcionalidades/entrada/modelo";
import "./estilos.css";
function exemplo(nome: string): EspecificacaoEntrada {
  if (nome === "GALERA" || nome === "LETRA")
    return {
      modo: "galera",
      acao: nome === "LETRA" ? "letra" : "palpite",
      posicoes: ["C", null, null, "A"],
      bloqueadas: ["C", "Ç"],
    };
  const limites: Record<string, number> =
    nome === "ARARA"
      ? { A: 3, R: 2 }
      : nome === "MAÇÃ"
        ? { M: 1, A: 2, Ç: 1 }
        : {};
  const resposta =
    nome === "LONGA" ? "O FABULOSO DESTINO DE AMÉLIE POULAIN" : nome;
  return {
    posicoes: Array.from(resposta, (c) => (/^[\p{L}0-9]$/u.test(c) ? null : c)),
    limites,
  };
}
function ProvaEntrada() {
  const [nome, definirNome] = useState("ARARA");
  const [estado, definirEstado] = useState(() =>
    criarEntrada(exemplo("ARARA")),
  );
  const [enviado, definirEnviado] = useState("Nenhum");
  const [letra, definirLetra] = useState("Nenhuma");
  const [ocupado, definirOcupado] = useState(false);
  return (
    <main className="prova-entrada">
      <header>
        <a className="marca-jogo" href="/" aria-label="Voltar ao Decifra">
          <span>D</span>
          <b>ECIFRA</b>
        </a>
        <button
          onClick={() => {
            document.documentElement.dataset.tema =
              document.documentElement.dataset.tema === "escuro"
                ? "claro"
                : "escuro";
          }}
        >
          Alternar tema
        </button>
      </header>
      <span className="etiqueta">FASE 24 · PRÉVIA TÉCNICA DOS CONTROLES</span>
      <h1>Uma letra de cada vez.</h1>
      <p>
        Exemplos públicos para experimentar a montagem. Esta tela não cria
        partidas, não confere acertos e não altera pontos ou dados da conta.
      </p>
      <label>
        Exemplo público
        <select
          value={nome}
          onChange={(evento) => {
            const valor = evento.target.value;
            definirNome(valor);
            definirEstado(criarEntrada(exemplo(valor)));
            definirEnviado("Nenhum");
            definirLetra("Nenhuma");
          }}
        >
          {[
            ["ARARA", "ARARA · repetição"],
            ["MAÇÃ", "MAÇÃ · acentos e cedilha"],
            ["WALL-E 3", "WALL-E 3 · sinal e número"],
            ["LONGA", "Expressão longa"],
            ["GALERA", "Galera · posições fixas"],
            ["LETRA", "Galera · escolher letra"],
          ].map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </label>
      <label className="alternativa">
        <input
          type="checkbox"
          checked={ocupado}
          onChange={(evento) => definirOcupado(evento.target.checked)}
        />
        Simular ação em andamento
      </label>
      <section className="palco-entrada">
        <div className="apresentacao-entrada">
          <img
            src="/mascote/aurelio.png"
            width="72"
            height="92"
            alt="Aurélio"
          />
          <div>
            <span className="etiqueta">SEU PRÓXIMO AHÁ COMEÇA AQUI</span>
            <h2>
              {nome === "LETRA"
                ? "Qual letra você escolhe?"
                : "Monte seu palpite"}
            </h2>
          </div>
        </div>
        <EditorResposta
          estado={estado}
          aoAlterar={definirEstado}
          aoEnviar={definirEnviado}
          aoEscolherLetra={definirLetra}
          ocupado={ocupado}
        />
      </section>
      <aside className="resultado-prova">
        <p>
          Palpite enviado:{" "}
          <output aria-label="Palpite enviado">{enviado}</output>
        </p>
        <p>
          Letra escolhida: <output aria-label="Letra escolhida">{letra}</output>
        </p>
        <small>
          As palavras e os limites destes exemplos são públicos. A montagem
          recebe posições e limites, sem precisar da solução de uma partida.
        </small>
      </aside>
    </main>
  );
}
const raiz = document.getElementById("raiz");
if (!raiz) throw new Error("Área da prévia não encontrada.");
createRoot(raiz).render(
  <StrictMode>
    <ProvaEntrada />
  </StrictMode>,
);
