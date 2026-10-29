import { FormularioPerfil } from "./FormularioPerfil";
import { FormularioPreferencias } from "./FormularioPreferencias";
import { useConta } from "./usar-conta";
type DadosConta = ReturnType<typeof useConta>;
export function ConteudoConta({
  dados,
  configuracoes,
}: {
  dados: DadosConta;
  configuracoes: boolean;
}) {
  const { conta, perfil, avatares, preferencias, ocupado } = dados;
  if (configuracoes)
    return (
      <FormularioPreferencias
        key={conta?.jogador_id ?? "visitante"}
        inicial={preferencias.data ?? dados.locais}
        ocupado={ocupado}
        visitante={!conta}
        aoPrever={dados.definirPrevia}
        aoSalvar={(ajustes) => {
          dados.definirMensagem("");
          dados.definirErro("");
          if (conta) dados.salvarAjustes.mutate(ajustes);
          else dados.salvarLocal(ajustes);
        }}
      />
    );
  if (!perfil.data || !avatares.data) return null;
  return (
    <>
      <FormularioPerfil
        perfil={perfil.data}
        avatares={avatares.data}
        ocupado={ocupado}
        aoSalvar={(alteracoes) => {
          dados.definirMensagem("");
          dados.definirErro("");
          dados.salvarDados.mutate(alteracoes);
        }}
      />
      <div className="despedida">
        <p>Quer se despedir do Decifra?</p>
        <button
          className="texto-perigo"
          onClick={() => {
            dados.definirErroExclusao("");
            dados.definirAberto(true);
          }}
          disabled={ocupado}
        >
          Excluir minha conta
        </button>
      </div>
    </>
  );
}
