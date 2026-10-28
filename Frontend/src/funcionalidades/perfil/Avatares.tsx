import type { Avatar } from "./api";

export function Avatares({
  colecao,
  selecionado,
  aoSelecionar,
  ocupado = false,
}: {
  colecao: Avatar[];
  selecionado: string | null;
  aoSelecionar: (id: string) => void;
  ocupado?: boolean;
}) {
  return (
    <fieldset className="selecao-avatares" disabled={ocupado}>
      <legend>Escolha quem vai te representar</legend>
      <p className="nota">20 personalidades. Qual combina com você?</p>
      <div className="grade-avatares">
        {colecao.map((avatar) => (
          <button
            className="avatar-opcao"
            key={avatar.id}
            type="button"
            aria-label={avatar.nome}
            aria-pressed={selecionado === avatar.id}
            onClick={() => aoSelecionar(avatar.id)}
          >
            <img
              src={avatar.recurso}
              alt=""
              width="80"
              height="80"
              loading="lazy"
            />
            <span>{avatar.nome}</span>
            <b aria-hidden="true">{selecionado === avatar.id ? "✓" : "+"}</b>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
