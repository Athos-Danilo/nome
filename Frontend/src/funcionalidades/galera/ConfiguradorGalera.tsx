import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Botao } from "../../componentes/Comuns";
import type { Avatar, Sessao } from "../perfil/api";
import { nomeValido } from "../perfil/preferencias";
import { NIVEIS, TEMAS } from "../individual/apresentacao";
import type { Dificuldade } from "../individual/api";
import {
  conferirGalera,
  criarGalera,
  type Convidado,
  type PlanoGalera,
} from "./api";
export function ConfiguradorGalera({
  conta,
  avatares,
}: {
  conta: Sessao;
  avatares: Avatar[];
}) {
  const navegar = useNavigate();
  const [convidados, definirConvidados] = useState<Convidado[]>([]);
  const [quantidade, definirQuantidade] = useState(3);
  const [dificuldade, definirDificuldade] = useState<Dificuldade>("facil");
  const [modo, definirModo] = useState<"manual" | "aleatorio">("aleatorio");
  const [temas, definirTemas] = useState([
    "animais",
    "filmes-e-series",
    "marcas",
    "paises",
    "objetos",
  ]);
  const [plano, definirPlano] = useState<PlanoGalera | null>(null);
  const [ocupado, definirOcupado] = useState(false);
  const trava = useRef(false);
  const [erro, definirErro] = useState("");
  function mudar(acao: () => void) {
    acao();
    definirPlano(null);
    definirErro("");
  }
  function alterarConvidado(i: number, campo: keyof Convidado, valor: string) {
    mudar(() =>
      definirConvidados((anteriores) =>
        anteriores.map((p, n) => (n === i ? { ...p, [campo]: valor } : p)),
      ),
    );
  }
  async function conferir() {
    if (trava.current) return;
    const nomes = [conta.nome_usuario ?? "", ...convidados.map((c) => c.nome)];
    const chave = (n: string) =>
      n.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR");
    if (convidados.some((c) => !nomeValido(c.nome))) {
      definirErro("Use de 3 a 20 letras, números ou sublinhado, sem espaços.");
      return;
    }
    if (new Set(nomes.map(chave)).size !== nomes.length) {
      definirErro("Cada participante precisa de um nome diferente.");
      return;
    }
    trava.current = true;
    definirOcupado(true);
    definirErro("");
    try {
      definirPlano(
        await conferirGalera(
          {
            convidados,
            dificuldade,
            quantidade_sessoes: quantidade,
            modo_tematicas: modo,
            ...(modo === "manual"
              ? { tematicas: temas.slice(0, quantidade) }
              : {}),
          },
          conta.token_csrf,
        ),
      );
    } catch (e) {
      definirErro((e as Error).message);
    } finally {
      trava.current = false;
      definirOcupado(false);
    }
  }
  async function criar() {
    if (trava.current || !plano?.plano_id) return;
    trava.current = true;
    definirOcupado(true);
    definirErro("");
    try {
      const partida = await criarGalera(plano.plano_id, conta.token_csrf);
      navegar(`/jogar/galera/${partida.partida_id}`);
    } catch (e) {
      definirErro((e as Error).message);
    } finally {
      trava.current = false;
      definirOcupado(false);
    }
  }
  return (
    <section className="configuracao-galera">
      <header className="chamada-galera">
        <div>
          <span className="etiqueta">MESMO SOFÁ. MUITAS DESCOBERTAS.</span>
          <h1 tabIndex={-1}>Reúna sua galera</h1>
          <p>Até três pessoas, um painel compartilhado e uma boa disputa.</p>
        </div>
        <img src="/mascote/aurelio.png" alt="Aurélio preparando a disputa" />
      </header>
      <fieldset disabled={ocupado} className="grupo-galera">
        <legend>Quem vai decifrar?</legend>
        <article className="pessoa-galera anfitriao">
          <img src={`/avatares/${conta.avatar_id}.webp`} alt="" />
          <div>
            <span className="etiqueta">ANFITRIÃO · VOCÊ</span>
            <strong>{conta.nome_usuario}</strong>
            <small>Seu perfil participa desta partida.</small>
          </div>
        </article>
        {convidados.map((p, i) => (
          <article className="pessoa-galera" key={i}>
            <img src={`/avatares/${p.avatar_id}.webp`} alt="" />
            <div className="dados-convidado">
              <label>
                Nome do convidado {i + 1}
                <input
                  maxLength={20}
                  value={p.nome}
                  onChange={(e) => alterarConvidado(i, "nome", e.target.value)}
                />
              </label>
              <label>
                Avatar do convidado {i + 1}
                <select
                  value={p.avatar_id}
                  onChange={(e) =>
                    alterarConvidado(i, "avatar_id", e.target.value)
                  }
                >
                  {avatares.map((a) => (
                    <option value={a.id} key={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Botao
              aria-label={`Remover convidado ${i + 1}`}
              onClick={() =>
                mudar(() =>
                  definirConvidados((anteriores) =>
                    anteriores.filter((_, n) => n !== i),
                  ),
                )
              }
            >
              Remover
            </Botao>
          </article>
        ))}
        {convidados.length < 2 && (
          <Botao
            className="adicionar-galera"
            onClick={() =>
              mudar(() =>
                definirConvidados([
                  ...convidados,
                  {
                    nome: "",
                    avatar_id:
                      avatares[(convidados.length + 1) % avatares.length]?.id ??
                      conta.avatar_id ??
                      "",
                  },
                ]),
              )
            }
          >
            Adicionar participante
          </Botao>
        )}
        <p className="nota">
          {convidados.length + 1}{" "}
          {convidados.length ? "participantes" : "participante"} ·{" "}
          {convidados.length + 1} {convidados.length ? "palavras" : "palavra"}{" "}
          por sessão. Todos podem tentar qualquer palavra.
        </p>
      </fieldset>
      <fieldset disabled={ocupado} className="regras-galera">
        <legend>Monte a disputa</legend>
        <div className="opcoes-disputa">
          <label>
            Dificuldade
            <select
              value={dificuldade}
              onChange={(e) =>
                mudar(() => definirDificuldade(e.target.value as Dificuldade))
              }
            >
              {Object.entries(NIVEIS).map(([id, nome]) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantidade de sessões
            <select
              value={quantidade}
              onChange={(e) =>
                mudar(() => definirQuantidade(Number(e.target.value)))
              }
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Temáticas
            <select
              value={modo}
              onChange={(e) =>
                mudar(() =>
                  definirModo(
                    e.target.value === "manual" ? "manual" : "aleatorio",
                  ),
                )
              }
            >
              <option value="aleatorio">Surpresa a cada sessão</option>
              <option value="manual">Eu escolho a sequência</option>
            </select>
          </label>
        </div>
        {modo === "manual" ? (
          <div className="temas-sessoes">
            {temas.slice(0, quantidade).map((t, i) => (
              <label key={i}>
                Temática da sessão {i + 1}
                <select
                  value={t}
                  onChange={(e) =>
                    mudar(() =>
                      definirTemas((anteriores) =>
                        anteriores.map((valor, n) =>
                          n === i ? e.target.value : valor,
                        ),
                      ),
                    )
                  }
                >
                  {Object.entries(TEMAS).map(([id, nome]) => (
                    <option key={id} value={id}>
                      {nome}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        ) : (
          <p className="nota">
            O sistema sorteia as temáticas em segredo. Elas podem se repetir; as
            palavras não.
          </p>
        )}
        <p className="nota">
          A ordem dos participantes é sorteada para cada sessão. A dificuldade
          vale para toda a partida. O cronômetro será por sessão, sem
          influenciar pontos.
        </p>
      </fieldset>
      {erro && (
        <p className="aviso-erro" role="alert">
          {erro}
        </p>
      )}
      <Botao
        className="acao botao-grande"
        disabled={ocupado}
        onClick={() => void conferir()}
      >
        {ocupado ? "Preparando…" : "Conferir minha galera"}
      </Botao>
      {plano && (
        <section className="resumo-disputa" aria-live="polite">
          <h2>
            {plano.pode_criar
              ? "Tudo pronto para reunir a galera"
              : "Vamos ajustar a disputa?"}
          </h2>
          {plano.pode_criar ? (
            <>
              <p>
                {plano.quantidade_palavras} palavras reservadas para{" "}
                {plano.quantidade_sessoes} sessões.
              </p>
              <p>
                Você ainda pode voltar às escolhas antes de confirmar. Nenhuma
                palavra foi revelada.
              </p>
              <Botao
                className="acao"
                disabled={ocupado}
                onClick={() => void criar()}
              >
                Preparar partida
              </Botao>
            </>
          ) : (
            <>
              <p>{plano.mensagem}</p>
              {plano.disponibilidade?.map((d) => (
                <p key={d.sessao}>
                  Sessão {d.sessao} · {TEMAS[d.tematica]}: {d.disponiveis}{" "}
                  palavras disponíveis; {d.necessarias} necessárias. A mesma
                  palavra não pode repetir em outras sessões.
                </p>
              ))}
            </>
          )}
        </section>
      )}
    </section>
  );
}
