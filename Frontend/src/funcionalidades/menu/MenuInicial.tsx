import { useEffect } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { CartaoModo } from "../../componentes/CartaoModo";
import { SituacaoDemonstracao } from "../demonstracao/SituacaoDemonstracao";
import { consultarPartidaEmAberto } from "./api";
import { ErroDaApi, type Sessao } from "../perfil/api";
import { Aurelio } from "../mascote/Aurelio";
export function MenuInicial({
  conta,
  aoExpirar,
}: {
  conta: Sessao | null | undefined;
  aoExpirar: (erro: Error) => void;
}) {
  return (
    <div className="sala-jogo">
      <section className="boas-vindas-menu">
        <span className="etiqueta">
          {conta
            ? `OLÁ, ${conta.nome_usuario?.toUpperCase()}. QUE BOM TE VER!`
            : "SEU PRIMEIRO DESAFIO COMEÇA AQUI"}
        </span>
        <h1 tabIndex={-1}>
          Bora <span>decifrar?</span>
        </h1>
        <p>
          Boas pistas. Grandes descobertas.
          <br />
          <em>O próximo “ah, já sei!” é seu.</em>
        </p>
        <div className="palco-menu">
          <span className="bloco-orbita orbita-a" aria-hidden="true">
            A
          </span>
          <span className="bloco-orbita orbita-b" aria-hidden="true">
            Ç
          </span>
          <span className="brilho-menu" aria-hidden="true">
            ✦
          </span>
          <Aurelio
            evento={{ id: "entrada-menu", tipo: "saudacao" }}
            tamanho="grande"
          />
          <span className="balao-menu">
            Uma dica?
            <br />
            <b>Deixa comigo!</b>
          </span>
        </div>
      </section>
      <section className="escolhas-menu" aria-label="Escolha seu caminho">
        {conta ? (
          <>
            <SituacaoDemonstracao tokenConta={conta.token_csrf} />
            <Continuidade jogadorId={conta.jogador_id} aoExpirar={aoExpirar} />
            <div className="cartoes-modos">
              <CartaoModo
                modo="solo"
                destino="/jogar/individual/novo"
                titulo="Solo"
                descricao="Uma palavra. Cinco pistas. Você."
              />
              <CartaoModo
                modo="galera"
                destino="/jogar/galera/novo"
                titulo="Galera"
                descricao="Uma boa disputa começa aqui."
                imagens={[
                  "coruja_sabia",
                  "capivara_zen",
                  "aurelio_comemorando",
                ]}
              />
            </div>
            <Link className="minhas-descobertas" to="/perfil/historico">
              Minhas descobertas →
            </Link>
          </>
        ) : (
          <div className="convite-menu">
            <span className="etiqueta">UM GOSTINHO DO DECIFRA</span>
            <h2>Curiosidade dá jogo.</h2>
            <p>Descubra palavras, siga as pistas e celebre cada acerto.</p>
            <SituacaoDemonstracao />
            <a
              className="acao botao-grande google-menu"
              href="/api/autenticacao/google"
            >
              <span aria-hidden="true">G</span> Entrar com Google{" "}
              <span aria-hidden="true">↗</span>
            </a>
            <small>
              Seu avatar, seus desafios e suas descobertas.
              <br />
              Entre para jogar do seu jeito.
            </small>
          </div>
        )}
        <p className="selo-menu">✦ SEM PRESSA. COM CURIOSIDADE.</p>
      </section>
    </div>
  );
}
function Continuidade({
  jogadorId,
  aoExpirar,
}: {
  jogadorId: string;
  aoExpirar: (erro: Error) => void;
}) {
  const consulta = useQuery({
    queryKey: ["partida-em-aberto", jogadorId],
    queryFn: consultarPartidaEmAberto,
  });
  useEffect(() => {
    if (
      consulta.error instanceof ErroDaApi &&
      ["SESSAO_EXPIRADA", "SESSAO_NECESSARIA"].includes(consulta.error.codigo)
    )
      aoExpirar(consulta.error);
  }, [consulta.error, aoExpirar]);
  if (consulta.isPending)
    return <p role="status">Conferindo suas descobertas…</p>;
  if (consulta.error)
    return (
      <div className="aviso-erro" role="alert">
        <p>{consulta.error.message}</p>
        <button onClick={() => void consulta.refetch()}>
          Conferir partida novamente
        </button>
      </div>
    );
  if (!consulta.data) return null;
  const partida = consulta.data;
  return (
    <div className="continuar-menu">
      <div>
        <span className="etiqueta">FICOU UMA DESCOBERTA PELA METADE</span>
        <h2>Vamos continuar?</h2>
        <p>
          {partida.rodadas_concluidas} de {partida.quantidade_palavras} palavras
          concluídas · {partida.pontuacao} pontos
        </p>
      </div>
      <Link
        to="/jogar/individual"
        className="acao"
        aria-label="Continuar partida"
      >
        Continuar <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
