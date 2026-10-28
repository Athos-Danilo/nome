import { useEffect, useState, type SubmitEvent } from "react";
import { Avatares } from "./Avatares";
import { nomeValido } from "./preferencias";
import type { Avatar, Perfil } from "./api";

export function FormularioPerfil({
  perfil,
  avatares,
  ocupado,
  aoSalvar,
}: {
  perfil: Perfil;
  avatares: Avatar[];
  ocupado: boolean;
  aoSalvar: (dados: { nome_usuario: string; avatar_id: string }) => void;
}) {
  const [nome, definirNome] = useState(perfil.nome_usuario ?? "");
  const [avatar, definirAvatar] = useState<string | null>(perfil.avatar_id);
  useEffect(() => {
    definirNome(perfil.nome_usuario ?? "");
    definirAvatar(perfil.avatar_id);
  }, [perfil]);
  const primeiro = perfil.estado === "cadastro_pendente";
  function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (avatar && nomeValido(nome))
      aoSalvar({ nome_usuario: nome.normalize("NFC"), avatar_id: avatar });
  }
  return (
    <form onSubmit={enviar} className="formulario-perfil">
      <span className="etiqueta">
        {primeiro ? "SUA PRIMEIRA DESCOBERTA" : "DO SEU JEITO"}
      </span>
      <h1>{primeiro ? "Seu nome no jogo" : "Seu perfil"}</h1>
      <p>
        {primeiro
          ? "Escolha seu nome e seu parceiro de descobertas."
          : "Uma nova cara, o mesmo espírito curioso."}
      </p>
      <label htmlFor="nome-usuario">Nome de usuário</label>
      <input
        id="nome-usuario"
        value={nome}
        onChange={(evento) => definirNome(evento.target.value)}
        disabled={ocupado}
        autoComplete="username"
        maxLength={40}
        aria-describedby="regra-nome"
        aria-invalid={nome.length > 0 && !nomeValido(nome)}
      />
      <small id="regra-nome">
        De 3 a 20 letras, números ou sublinhado. Sem espaços.
      </small>
      {!primeiro && (
        <p className="email-conta">
          <b>Conta Google</b>
          <br />
          {perfil.email}
          <br />
          <small>Seu e-mail fica privado e é gerenciado pelo Google.</small>
        </p>
      )}
      <Avatares
        colecao={avatares}
        selecionado={avatar}
        aoSelecionar={definirAvatar}
        ocupado={ocupado}
      />
      <button
        className="acao botao-grande"
        type="submit"
        disabled={ocupado || !nomeValido(nome) || !avatar}
      >
        {ocupado ? "Salvando…" : primeiro ? "Vamos nessa" : "Salvar perfil"}
      </button>
    </form>
  );
}
