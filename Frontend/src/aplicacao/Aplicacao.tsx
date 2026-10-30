import { RotaGalera } from "../funcionalidades/galera/RotaGalera";
import { Historico } from "../funcionalidades/acompanhamento/Historico";
import { Estatisticas } from "../funcionalidades/acompanhamento/Estatisticas";
import { Rankings } from "../funcionalidades/acompanhamento/Rankings";
import {
  ProtecaoNavegacao,
  useSaidaPartida,
} from "../funcionalidades/individual/saida-partida";
import { RotaIndividual } from "../funcionalidades/individual/RotaIndividual";
import { ConteudoConta } from "../funcionalidades/perfil/ConteudoConta";
import { PaginaEmPreparacao } from "../componentes/PaginaEmPreparacao";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  NavLink,
  Navigate,
  useLocation,
} from "react-router";
import { ExcluirConta } from "../funcionalidades/perfil/ExcluirConta";
import { useConta } from "../funcionalidades/perfil/usar-conta";
import { AvisoErro } from "../funcionalidades/perfil/AvisoErro";
import { MenuInicial } from "../funcionalidades/menu/MenuInicial";
import {
  Botao,
  Carregando,
  Dialogo,
  EstadoVazio,
  VoltarAoMenu,
} from "../componentes/Comuns";
import "../estilos/menu.css";

const consultas = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
const roteador = createBrowserRouter([{ path: "*", element: <Jogo /> }]);
export function Aplicacao() {
  return (
    <QueryClientProvider client={consultas}>
      <ProtecaoNavegacao>
        <RouterProvider router={roteador} />
      </ProtecaoNavegacao>
    </QueryClientProvider>
  );
}
function Jogo() {
  const dados = useConta();
  const saidaPartida = useSaidaPartida();
  const { pathname: caminho } = useLocation();
  const [ajuda, definirAjuda] = useState(false);
  const { conta, perfil, carregando, ocupado, efetivas } = dados;
  const pendente = conta && perfil.data?.estado === "cadastro_pendente";
  useEffect(() => {
    dados.navegar(caminho === "/configuracoes" ? "preferencias" : "perfil");
    window.scrollTo(0, 0);
  }, [caminho]);
  useEffect(() => {
    if (!carregando) {
      document
        .querySelector<HTMLElement>("main h1")
        ?.focus({ preventScroll: true });
      document.title = `${document.querySelector("main h1")?.textContent ?? "Jogo de palavras"} — Decifra`;
    }
  }, [caminho, carregando, pendente]);
  const privada =
    caminho.startsWith("/perfil") ||
    caminho.startsWith("/jogar/individual") ||
    caminho.startsWith("/jogar/galera");
  let conteudo;
  if (carregando) conteudo = <Carregando />;
  else if (dados.falhaCarregamento)
    conteudo = (
      <EstadoVazio titulo="Vamos tentar de novo?">
        <p role="alert">{dados.falhaCarregamento.message}</p>
        <Botao onClick={() => void dados.cache.invalidateQueries()}>
          Tentar novamente
        </Botao>
      </EstadoVazio>
    );
  else if (pendente && caminho !== "/primeiro-acesso")
    conteudo = <Navigate to="/primeiro-acesso" replace />;
  else if (caminho === "/primeiro-acesso" && !pendente)
    conteudo = <Navigate to="/" replace />;
  else if (privada && !conta)
    conteudo = (
      <EstadoVazio titulo="Suas descobertas merecem uma conta">
        <p>
          Entre para escolher desafios, reunir a galera e guardar seu histórico.
        </p>
        <a className="acao" href="/api/autenticacao/google">
          Entrar com Google ↗
        </a>
      </EstadoVazio>
    );
  else if (caminho === "/rankings") conteudo = <Rankings />;
  else if (caminho === "/perfil/historico" && conta)
    conteudo = <Historico jogadorId={conta.jogador_id} />;
  else if (caminho === "/perfil/estatisticas" && conta)
    conteudo = <Estatisticas jogadorId={conta.jogador_id} />;
  else if (caminho === "/")
    conteudo = <MenuInicial conta={conta} aoExpirar={dados.falhar} />;
  else if (["/perfil", "/primeiro-acesso", "/configuracoes"].includes(caminho))
    conteudo = (
      <div className="central-perfil">
        <aside className="companheiro">
          <span className="etiqueta">SEU CANTINHO NO DECIFRA</span>
          <h2>
            Uma boa descoberta
            <br />
            <em>começa com você.</em>
          </h2>
          <div className="palco-mascote">
            <img
              src="/mascote/aurelio.png"
              width="290"
              height="350"
              alt="Aurélio, nosso dicionário apresentador"
            />
          </div>
        </aside>
        <section className="painel-conta" aria-busy={ocupado}>
          <ConteudoConta
            dados={dados}
            configuracoes={caminho === "/configuracoes"}
          />
        </section>
      </div>
    );
  else if (
    caminho.startsWith("/jogar/individual") ||
    caminho === "/jogar/demonstracao"
  )
    conteudo = <RotaIndividual conta={conta} />;
  else if (caminho.startsWith("/jogar/galera/") && conta)
    conteudo = (
      <RotaGalera conta={conta} avatares={dados.avatares.data ?? []} />
    );
  else conteudo = <PaginaEmPreparacao caminho={caminho} />;
  function alternarTema() {
    const novas = {
      ...(dados.preferencias.data ?? dados.locais),
      tema:
        efetivas.tema === "claro" ? ("escuro" as const) : ("claro" as const),
    };
    const manterPrevia = () =>
      dados.definirPrevia({ ...efetivas, tema: novas.tema });
    if (conta) dados.salvarAjustes.mutate(novas, { onSuccess: manterPrevia });
    else {
      dados.salvarLocal(novas);
      manterPrevia();
    }
  }
  return (
    <div className="universo-perfil moldura-jogo">
      <a href="#conteudo-jogo" className="pular-conteudo">
        Pular para o conteúdo
      </a>
      <header className="cabecalho-jogo">
        <Link to="/" className="marca-jogo" aria-label="Decifra início">
          <span>D</span>
          <b>ECIFRA</b>
          <i aria-hidden="true">✦</i>
        </Link>
        <span className="selo">DICAS. DESCOBERTAS. VOCÊ.</span>
        <div className="controles-menu">
          <Botao aria-label="Como jogar" onClick={() => definirAjuda(true)}>
            ?
          </Botao>
          <Botao
            aria-label={
              efetivas.tema === "claro"
                ? "Ativar tema escuro"
                : "Ativar tema claro"
            }
            onClick={alternarTema}
            disabled={ocupado || carregando}
          >
            {efetivas.tema === "claro" ? "☾" : "☀"}
          </Botao>
          {conta && dados.atual && (
            <Link
              className="perfil-topo"
              to="/perfil"
              aria-label="Abrir meu perfil"
            >
              <img src={dados.atual.recurso} width="40" height="40" alt="" />
              <span>{perfil.data?.nome_usuario ?? "Seu perfil"}</span>
            </Link>
          )}
          {conta && (
            <Botao
              onClick={() => saidaPartida.solicitar(() => dados.sair.mutate())}
              disabled={ocupado}
            >
              Sair
            </Botao>
          )}
        </div>
      </header>
      {!pendente && (
        <nav className="dock-jogo" aria-label="Navegação principal">
          {[
            ["/", "⌂", "Início"],
            ...(conta
              ? [
                  ["/perfil", "☺", "Perfil"],
                  ["/perfil/historico", "▤", "Histórico"],
                ]
              : []),
            ["/rankings", "♜", "Rankings"],
            ["/configuracoes", "⚙", "Configurações"],
          ].map(([destino, icone, nome]) => (
            <NavLink key={destino} to={destino} end aria-label={nome}>
              <span aria-hidden="true">{icone}</span>
              <small>{nome}</small>
            </NavLink>
          ))}
        </nav>
      )}
      <main
        id="conteudo-jogo"
        tabIndex={-1}
        className={`conteudo-jogo ${pendente ? "primeiro-acesso" : ""}`}
      >
        {caminho !== "/" && !carregando && !pendente && <VoltarAoMenu />}
        {dados.mensagem && (
          <p className="aviso-sucesso" role="status">
            ✓ {dados.mensagem}
          </p>
        )}
        {dados.erro && <AvisoErro mensagem={dados.erro} />}
        {conteudo}
      </main>
      <footer className="rodape-jogo">
        DÊ ASAS À SUA CURIOSIDADE <span aria-hidden="true">✦</span>
      </footer>
      <Dialogo
        aberto={ajuda}
        titulo="Pequenas pistas, grandes descobertas."
        aoFechar={() => definirAjuda(false)}
      >
        <p>
          No Solo, descubra uma palavra com até cinco dicas. Quanto menos dicas
          usar, mais pontos você ganha.
        </p>
        <p>
          Na Galera, até três pessoas dividem o mesmo dispositivo e tentam
          revelar as palavras. Acertou? Continua na vez!
        </p>
        <p>Você escolhe seu ritmo. Sem cronômetro, com muita curiosidade.</p>
      </Dialogo>
      <ExcluirConta
        aberto={dados.aberto}
        ocupado={dados.excluir.isPending}
        erro={dados.erroExclusao}
        aoCancelar={() => {
          dados.definirAberto(false);
          dados.definirErroExclusao("");
        }}
        aoConfirmar={() => {
          dados.definirErroExclusao("");
          dados.excluir.mutate();
        }}
      />
    </div>
  );
}
