import { useState } from "react";
import { Botao } from "../../componentes/Comuns";
import { Aurelio } from "./Aurelio";
import { REACOES, type Reacao } from "./reacoes";

const nomes: Record<Reacao, string> = {
  espera: "Espera",
  saudacao: "Saudação",
  pensamento: "Pensamento",
  apresentacao: "Apresentar dica",
  erro: "Erro",
  comemoracao: "Comemoração",
  turno: "Mudança de turno",
  sorteio: "Sorteio",
  resultado: "Resultado",
};
const falas: Record<Reacao, string> = {
  espera: "Seu próximo “já sei!” está logo ali.",
  saudacao: "Que bom te ver. Bora decifrar?",
  pensamento: "Hmm… deixa eu pensar nessa com você.",
  apresentacao: "Uma pista de cada vez. Olha só essa!",
  erro: "Ainda não! Respira, a próxima descoberta está perto.",
  comemoracao: "Ahá! Eu sabia que você ia conseguir!",
  turno: "Agora o palco é seu. Capricha!",
  sorteio: "A ordem está lançada. Quem abre o jogo?",
  resultado: "Boas descobertas merecem um grande final.",
};
export function GaleriaAurelio() {
  const [reacao, definirReacao] = useState<Reacao>("saudacao");
  const [rodada, definirRodada] = useState(0);
  const [reduzir, definirReduzir] = useState(false);
  const [pausado, definirPausado] = useState(false);
  function escolher(tipo: Reacao) {
    definirReacao(tipo);
    definirRodada((n) => n + 1);
  }
  return (
    <section className="galeria-aurelio">
      <span className="etiqueta">O APRESENTADOR ESTÁ NO PALCO</span>
      <h1 tabIndex={-1}>O Aurélio ganhou vida.</h1>
      <p>
        Escolha uma reação e veja o nosso dicionário em ação. Este é o espaço de
        revisão visual da fase 36.
      </p>
      <div className="estudio-aurelio">
        <div className="palco-aurelio">
          <span className="etiqueta">{nomes[reacao]}</span>
          <Aurelio
            key={rodada}
            evento={{ id: `previa-${rodada}`, tipo: reacao }}
            repouso={reacao}
            tamanho="grande"
            reduzir={reduzir}
            pausado={pausado}
            descricao={`Aurélio: ${nomes[reacao]}`}
          />
          <p>{falas[reacao]}</p>
        </div>
        <div>
          <h2>Nove jeitos de apresentar o show.</h2>
          <p>
            Olhos, sobrancelhas, boca, braços, pernas e gravata têm movimentos
            próprios.
          </p>
          <div className="botoes-reacoes">
            {REACOES.map((tipo) => (
              <Botao
                key={tipo}
                aria-pressed={tipo === reacao}
                onClick={() => escolher(tipo)}
              >
                {nomes[tipo]}
              </Botao>
            ))}
          </div>
          <div className="controles-aurelio">
            <Botao onClick={() => escolher(reacao)}>Repetir reação</Botao>
            <Botao
              aria-pressed={pausado}
              onClick={() => definirPausado((v) => !v)}
            >
              {pausado ? "Retomar movimentos" : "Pausar movimentos"}
            </Botao>
          </div>
          <label>
            <input
              type="checkbox"
              checked={reduzir}
              onChange={(e) => definirReduzir(e.target.checked)}
            />{" "}
            Prévia com movimentos reduzidos
          </label>
          <p className="nota-aurelio">
            A preferência do jogo e a redução de movimentos do aparelho também
            são respeitadas. A prévia não altera suas configurações salvas.
          </p>
        </div>
      </div>
      <aside className="referencia-aurelio">
        <img src="/mascote/aurelio.png" alt="Referência aprovada do Aurélio" />
        <p>
          <strong>A mesma inspiração, preparada para movimento.</strong>
          <br />
          Capa oliva, páginas creme, ornamentos, luvas, sapatos e gravata
          verde-lima preservam o conceito aprovado. O desenho em camadas está em
          revisão visual.
        </p>
      </aside>
    </section>
  );
}
