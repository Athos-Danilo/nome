import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExcluirConta } from "../funcionalidades/perfil/ExcluirConta";
import { FormularioPerfil } from "../funcionalidades/perfil/FormularioPerfil";
import { FormularioPreferencias } from "../funcionalidades/perfil/FormularioPreferencias";
import { useConta } from "../funcionalidades/perfil/usar-conta";
import { AvisoErro } from "../funcionalidades/perfil/AvisoErro";
import { SituacaoDemonstracao } from "../funcionalidades/demonstracao/SituacaoDemonstracao";

const consultas = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
export function Aplicacao() {
  return (
    <QueryClientProvider client={consultas}>
      <Conta />
    </QueryClientProvider>
  );
}

function Conta() {
  const {
    cache,
    painel,
    mensagem,
    erro,
    aberto,
    erroExclusao,
    locais,
    conta,
    perfil,
    avatares,
    preferencias,
    ocupado,
    carregando,
    atual,
    falhaCarregamento,
    salvarDados,
    salvarAjustes,
    excluir,
    sair,
    definirMensagem,
    definirErro,
    definirAberto,
    definirErroExclusao,
    definirPrevia,
    navegar,
    salvarLocal,
  } = useConta();
  return (
    <div className="universo-perfil">
      <header className="cabecalho-jogo">
        <a href="/" className="marca-jogo" aria-label="Decifra início">
          <span>D</span>
          <b>ecifra</b>
          <i aria-hidden="true">✦</i>
        </a>
        <span className="selo">DICAS. DESCOBERTAS. VOCÊ.</span>
        {conta && (
          <button onClick={() => sair.mutate()} disabled={ocupado}>
            Sair
          </button>
        )}
      </header>
      <main className="central-perfil">
        <aside className="companheiro">
          <span className="etiqueta">BEM-VINDO AO SEU PRÓXIMO AHÁ!</span>
          <h2>
            Uma boa descoberta
            <br />
            <em>começa com você.</em>
          </h2>
          <div className="palco-mascote">
            <span className="letra-flutuante" aria-hidden="true">
              Ç
            </span>
            <span className="estrela" aria-hidden="true">
              ✦
            </span>
            <img
              src="/mascote/aurelio.png"
              alt="Aurélio, nosso dicionário apresentador"
              width="290"
              height="350"
            />
          </div>
          {conta && atual && (
            <div className="identidade-atual">
              <img
                src={atual.recurso}
                alt={atual.nome}
                width="64"
                height="64"
              />
              <div>
                <b>{perfil.data?.nome_usuario}</b>
                <small>Curiosidade é seu superpoder.</small>
              </div>
            </div>
          )}
          <p className="bilhete">
            “Seu próximo <strong>já sei!</strong> está logo ali.”
            <br />
            <small>— Aurélio</small>
          </p>
        </aside>
        <section className="painel-conta" aria-busy={carregando || ocupado}>
          {mensagem && (
            <p className="aviso-sucesso" role="status">
              ✓ {mensagem}
            </p>
          )}
          {erro && <AvisoErro mensagem={erro} />}
          {carregando ? (
            <p role="status">Preparando seu cantinho…</p>
          ) : falhaCarregamento ? (
            <div role="alert">
              <h1>Vamos tentar de novo?</h1>
              <p>{falhaCarregamento.message}</p>
              <button
                onClick={() => {
                  void cache.invalidateQueries();
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : conta && perfil.data && preferencias.data && avatares.data ? (
            <>
              <SituacaoDemonstracao tokenConta={conta.token_csrf} />
              {perfil.data.estado === "ativo" && (
                <nav className="abas-conta" aria-label="Sua conta">
                  <button
                    aria-pressed={painel === "perfil"}
                    onClick={() => navegar("perfil")}
                    disabled={ocupado}
                  >
                    Perfil
                  </button>
                  <button
                    aria-pressed={painel === "preferencias"}
                    onClick={() => navegar("preferencias")}
                    disabled={ocupado}
                  >
                    Preferências
                  </button>
                </nav>
              )}
              {painel === "perfil" ? (
                <>
                  <FormularioPerfil
                    perfil={perfil.data}
                    avatares={avatares.data}
                    ocupado={ocupado}
                    aoSalvar={(dados) => {
                      definirMensagem("");
                      definirErro("");
                      salvarDados.mutate(dados);
                    }}
                  />
                  <div className="despedida">
                    <p>Quer se despedir do Decifra?</p>
                    <button
                      className="texto-perigo"
                      onClick={() => {
                        definirErroExclusao("");
                        definirAberto(true);
                      }}
                      disabled={ocupado}
                    >
                      Excluir minha conta
                    </button>
                  </div>
                </>
              ) : (
                <FormularioPreferencias
                  key={`${conta.jogador_id}-${preferencias.dataUpdatedAt}`}
                  inicial={preferencias.data}
                  ocupado={ocupado}
                  aoPrever={definirPrevia}
                  aoSalvar={(dados) => {
                    definirMensagem("");
                    definirErro("");
                    salvarAjustes.mutate(dados);
                  }}
                />
              )}
            </>
          ) : (
            <>
              <span className="etiqueta">CHEGOU MAIS UMA PESSOA CURIOSA</span>
              <h1>Vamos nos conhecer?</h1>
              <p>Entre para escolher seu avatar e guardar suas descobertas.</p>
              <a className="acao botao-grande" href="/api/autenticacao/google">
                Entrar com Google <span aria-hidden="true">↗</span>
              </a>
              <SituacaoDemonstracao />
              <div className="divisor" />
              <FormularioPreferencias
                key="visitante"
                inicial={locais}
                ocupado={false}
                aoSalvar={salvarLocal}
                aoPrever={definirPrevia}
                visitante
              />
            </>
          )}
        </section>
      </main>
      <footer className="rodape-jogo">
        SEM PRESSA. COM CURIOSIDADE. <span aria-hidden="true">✦</span>
      </footer>
      <ExcluirConta
        aberto={aberto}
        ocupado={excluir.isPending}
        erro={erroExclusao}
        aoCancelar={() => {
          definirAberto(false);
          definirErroExclusao("");
        }}
        aoConfirmar={() => {
          definirErroExclusao("");
          excluir.mutate();
        }}
      />
    </div>
  );
}
