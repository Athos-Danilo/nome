import { useState } from "react";
import { useNavigate } from "react-router";
import { Botao } from "../../componentes/Comuns";
import {
  iniciarPartida,
  prepararPartida,
  type Configuracao,
  type Dificuldade,
  type Plano,
} from "./api";
import { NIVEIS, TEMAS } from "./apresentacao";
export function ConfiguradorIndividual({ token }: { token: string }) {
  const navegar = useNavigate();
  const [quantidade, definirQuantidade] = useState<3 | 5 | 7>(3);
  const [tema, definirTema] = useState("");
  const [distribuicao, definirDistribuicao] =
    useState<Configuracao["distribuicao"]>("unica");
  const [niveis, definirNiveis] = useState<Dificuldade[]>(["facil"]);
  const [quantidades, definirQuantidades] = useState({
    facil: 3,
    medio: 0,
    dificil: 0,
  });
  const [ordem, definirOrdem] = useState<Configuracao["ordem"]>("sorteada");
  const [sequencia, definirSequencia] = useState<Dificuldade[]>(
    Array(7).fill("facil"),
  );
  const [plano, definirPlano] = useState<Plano | null>(null);
  const [configurada, definirConfigurada] = useState<Configuracao | null>(null);
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState("");
  async function conferir(dados?: Configuracao) {
    if (ocupado) return;
    definirOcupado(true);
    definirErro("");
    const opcoes = dados ?? {
      quantidade_palavras: quantidade,
      tematica: tema || null,
      dificuldades: niveis,
      distribuicao,
      ...(distribuicao === "personalizada"
        ? {
            quantidades: Object.fromEntries(
              niveis.map((n) => [n, quantidades[n]]),
            ),
          }
        : {}),
      ordem,
      ...(ordem === "manual"
        ? { sequencia: sequencia.slice(0, quantidade) }
        : {}),
    };
    try {
      definirPlano(await prepararPartida(opcoes, token));
      definirConfigurada(opcoes);
    } catch (e) {
      definirErro((e as Error).message);
    } finally {
      definirOcupado(false);
    }
  }
  async function iniciar() {
    if (ocupado || !plano?.plano_id) return;
    definirOcupado(true);
    definirErro("");
    try {
      const partida = await iniciarPartida(plano.plano_id, token);
      navegar(`/jogar/individual/${partida.partida_id}`);
    } catch (e) {
      definirErro((e as Error).message);
      definirPlano(null);
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <section className="configurar-solo">
      <header className="titulo-solo">
        <span className="etiqueta">SEU DESAFIO, DO SEU JEITO</span>
        <h1 tabIndex={-1}>
          Um mundo de <em>descobertas.</em>
        </h1>
        <p>Escolha sua trilha. O Aurélio cuida das pistas.</p>
      </header>
      <div className="configurar-grade">
        <aside className="convite-aurelio">
          <span className="estrela-solo" aria-hidden="true">
            ✦
          </span>
          <img
            src="/mascote/aurelio.png"
            alt="Aurélio pronto para apresentar suas pistas"
          />
          <blockquote>
            “O melhor palpite
            <br />
            começa com <em>curiosidade.</em>”
          </blockquote>
          <p>
            Até cinco pistas por palavra.
            <br />
            Sem relógio. No seu ritmo.
          </p>
        </aside>
        <div className="cartao-configuracao">
          {erro && (
            <p className="aviso-erro" role="alert">
              {erro}
            </p>
          )}
          {plano ? (
            <div className="confirmar-desafio">
              <span className="etiqueta">
                {plano.pode_iniciar
                  ? "TUDO PRONTO!"
                  : "VAMOS AJUSTAR A TRILHA?"}
              </span>
              <h2>
                {plano.pode_iniciar
                  ? `${plano.disponiveis} descobertas esperando por você`
                  : `Encontramos ${plano.disponiveis} palavras para essa combinação`}
              </h2>
              <p>
                {configurada?.tematica
                  ? TEMAS[configurada.tematica]
                  : "Temas surpresa"}{" "}
                · {configurada?.dificuldades.map((n) => NIVEIS[n]).join(" + ")}
              </p>
              {plano.pode_iniciar ? (
                <>
                  <p>
                    Os acertos valem de 100 a 20 pontos, conforme a dica usada.
                  </p>
                  <Botao
                    className="acao botao-grande"
                    disabled={ocupado}
                    onClick={() => void iniciar()}
                  >
                    {ocupado ? "Preparando…" : "Começar partida"}
                  </Botao>
                </>
              ) : (
                <>
                  <p>
                    Mantemos as dificuldades que você escolheu. Como prefere
                    seguir?
                  </p>
                  {plano.alternativas.includes("outras_tematicas") && (
                    <Botao
                      disabled={ocupado}
                      onClick={() =>
                        void conferir({
                          ...configurada!,
                          permitir_outras_tematicas: true,
                        })
                      }
                    >
                      Incluir outras temáticas
                    </Botao>
                  )}
                  {plano.alternativas.includes("reduzir") && (
                    <Botao
                      disabled={ocupado}
                      onClick={() =>
                        void conferir({
                          ...configurada!,
                          aceitar_reducao: true,
                        })
                      }
                    >
                      Jogar com {plano.disponiveis} palavras
                    </Botao>
                  )}
                </>
              )}
              <Botao disabled={ocupado} onClick={() => definirPlano(null)}>
                Alterar configuração
              </Botao>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void conferir();
              }}
            >
              <fieldset disabled={ocupado}>
                <legend>01 · Quanto vamos descobrir?</legend>
                <div className="opcoes-solo">
                  {([3, 5, 7] as const).map((n) => (
                    <button
                      type="button"
                      key={n}
                      aria-pressed={quantidade === n}
                      onClick={() => definirQuantidade(n)}
                    >
                      <b>{n}</b> palavras
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset disabled={ocupado}>
                <legend>02 · Qual é o universo?</legend>
                <label>
                  Temática
                  <select
                    value={tema}
                    onChange={(e) => definirTema(e.target.value)}
                  >
                    <option value="">Tudo aleatório</option>
                    {Object.entries(TEMAS).map(([id, nome]) => (
                      <option key={id} value={id}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
              <fieldset disabled={ocupado}>
                <legend>03 · Escolha o desafio</legend>
                <label>
                  Distribuição
                  <select
                    value={distribuicao}
                    onChange={(e) => {
                      definirDistribuicao(
                        e.target.value as Configuracao["distribuicao"],
                      );
                      definirNiveis(["facil"]);
                      definirOrdem("sorteada");
                    }}
                  >
                    <option value="unica">Um nível</option>
                    <option value="personalizada">Combinar quantidades</option>
                    <option value="aleatoria">Sortear entre níveis</option>
                  </select>
                </label>
                <div className="opcoes-solo">
                  {(Object.keys(NIVEIS) as Dificuldade[]).map((n) => (
                    <button
                      type="button"
                      key={n}
                      aria-pressed={niveis.includes(n)}
                      onClick={() =>
                        definirNiveis(
                          distribuicao === "unica"
                            ? [n]
                            : niveis.includes(n)
                              ? niveis.filter((x) => x !== n)
                              : [...niveis, n],
                        )
                      }
                    >
                      {NIVEIS[n]}
                    </button>
                  ))}
                </div>
                {distribuicao === "personalizada" && (
                  <>
                    <div className="quantidades-solo">
                      {niveis.map((n) => (
                        <label key={n}>
                          {NIVEIS[n]}
                          <input
                            type="number"
                            min={0}
                            max={quantidade}
                            value={quantidades[n]}
                            onChange={(e) =>
                              definirQuantidades({
                                ...quantidades,
                                [n]: Number(e.target.value),
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <p role="status">
                      {niveis.reduce((s, n) => s + quantidades[n], 0)} de{" "}
                      {quantidade} palavras distribuídas
                    </p>
                  </>
                )}
              </fieldset>
              <fieldset disabled={ocupado}>
                <legend>04 · Como seguimos?</legend>
                <label>
                  Ordem dos níveis
                  <select
                    value={ordem}
                    onChange={(e) =>
                      definirOrdem(e.target.value as Configuracao["ordem"])
                    }
                  >
                    <option value="sorteada">Surpresa</option>
                    <option value="crescente">Do fácil ao difícil</option>
                    {distribuicao !== "aleatoria" && (
                      <option value="manual">Eu escolho a sequência</option>
                    )}
                  </select>
                </label>
                {ordem === "manual" && (
                  <div className="sequencia-solo">
                    {Array.from({ length: quantidade }, (_, i) => (
                      <label key={i}>
                        Palavra {i + 1}
                        <select
                          value={sequencia[i]}
                          onChange={(e) =>
                            definirSequencia(
                              sequencia.map((v, j) =>
                                j === i ? (e.target.value as Dificuldade) : v,
                              ),
                            )
                          }
                        >
                          {niveis.map((n) => (
                            <option key={n} value={n}>
                              {NIVEIS[n]}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>
              <Botao
                type="submit"
                className="acao botao-grande"
                disabled={
                  ocupado ||
                  !niveis.length ||
                  (distribuicao === "personalizada" &&
                    niveis.reduce((s, n) => s + quantidades[n], 0) !==
                      quantidade)
                }
              >
                {ocupado ? "Conferindo…" : "Conferir desafio"}{" "}
                <span aria-hidden="true">→</span>
              </Botao>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
