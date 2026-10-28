import {
  preferenciasValidas,
  somentePreferencias,
  type Preferencias,
  type PreferenciasSalvas,
} from "./preferencias";

export type Perfil = {
  jogador_id: string;
  email: string;
  estado: "ativo" | "cadastro_pendente";
  nome_usuario: string | null;
  avatar_id: string | null;
};
export type Sessao = Perfil & { token_csrf: string; expira_em: string };
export type Avatar = { id: string; nome: string; recurso: string };

export class ErroDaApi extends Error {
  constructor(
    public codigo: string,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

function objeto(valor: unknown): valor is Record<string, unknown> {
  return !!valor && typeof valor === "object";
}
function perfilValido(valor: unknown): valor is Perfil {
  return (
    objeto(valor) &&
    typeof valor.jogador_id === "string" &&
    typeof valor.email === "string" &&
    (valor.estado === "ativo" || valor.estado === "cadastro_pendente") &&
    (valor.nome_usuario === null || typeof valor.nome_usuario === "string") &&
    (valor.avatar_id === null || typeof valor.avatar_id === "string")
  );
}
function sessaoValida(valor: unknown): valor is Sessao {
  return (
    perfilValido(valor) &&
    "token_csrf" in valor &&
    typeof valor.token_csrf === "string" &&
    "expira_em" in valor &&
    typeof valor.expira_em === "string"
  );
}
function avatarValido(valor: unknown): valor is Avatar {
  return (
    objeto(valor) &&
    typeof valor.id === "string" &&
    /^[a-z_]+$/.test(valor.id) &&
    typeof valor.nome === "string" &&
    valor.recurso === `/avatares/${valor.id}.webp`
  );
}

async function requisitar(
  caminho: string,
  metodo = "GET",
  dados?: unknown,
  token?: string,
): Promise<unknown> {
  let resposta: Response;
  try {
    resposta = await fetch(caminho, {
      method: metodo,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        ...(dados ? { "Content-Type": "application/json" } : {}),
        ...(token ? { "X-Decifra-CSRF": token } : {}),
      },
      body: dados ? JSON.stringify(dados) : undefined,
    });
  } catch {
    throw new ErroDaApi(
      "CONEXAO_INDISPONIVEL",
      "Não conseguimos conectar. Tente novamente.",
    );
  }
  if (!resposta.ok) {
    let corpo: unknown = null;
    try {
      corpo = await resposta.json();
    } catch {
      /* A falha pode vir do proxy antes da API. */
    }
    if (
      objeto(corpo) &&
      objeto(corpo.erro) &&
      typeof corpo.erro.codigo === "string" &&
      typeof corpo.erro.mensagem === "string"
    )
      throw new ErroDaApi(corpo.erro.codigo, corpo.erro.mensagem);
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível concluir. Tente novamente.",
    );
  }
  return resposta.status === 204 ? null : resposta.json();
}

export async function consultarSessao(): Promise<Sessao | null> {
  let dados: unknown;
  try {
    dados = await requisitar("/api/autenticacao/sessao");
  } catch (erro) {
    if (
      erro instanceof ErroDaApi &&
      ["SESSAO_NECESSARIA", "SESSAO_EXPIRADA"].includes(erro.codigo)
    )
      return null;
    throw erro;
  }
  if (!sessaoValida(dados))
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível recuperar sua conta.",
    );
  return dados;
}
export async function consultarPerfil(): Promise<Perfil> {
  const dados = await requisitar("/api/perfil");
  if (!perfilValido(dados))
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível recuperar seu perfil.",
    );
  return dados;
}
export async function consultarAvatares(): Promise<Avatar[]> {
  const dados = await requisitar("/api/avatares");
  if (!Array.isArray(dados) || !dados.every(avatarValido))
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível carregar os avatares.",
    );
  return dados;
}
export async function salvarPerfil(
  dados: { nome_usuario: string; avatar_id: string },
  token: string,
): Promise<Perfil> {
  const resultado = await requisitar("/api/perfil", "PATCH", dados, token);
  if (!perfilValido(resultado))
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Confira se o perfil foi salvo antes de tentar novamente.",
    );
  return resultado;
}
function lerPreferencias(dados: unknown): PreferenciasSalvas {
  if (
    !preferenciasValidas(dados) ||
    !("salvas" in dados) ||
    typeof dados.salvas !== "boolean"
  )
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível recuperar suas preferências.",
    );
  return { ...dados, salvas: dados.salvas };
}
export async function consultarPreferencias(): Promise<PreferenciasSalvas> {
  return lerPreferencias(await requisitar("/api/preferencias"));
}
export async function salvarPreferencias(
  dados: Preferencias,
  token: string,
  somenteSeAusentes = false,
): Promise<PreferenciasSalvas> {
  return lerPreferencias(
    await requisitar(
      "/api/preferencias",
      "PUT",
      { ...somentePreferencias(dados), somente_se_ausentes: somenteSeAusentes },
      token,
    ),
  );
}
export async function excluirConta(token: string): Promise<void> {
  await requisitar("/api/perfil", "DELETE", { confirmacao: "EXCLUIR" }, token);
}
export async function sairDaConta(token: string): Promise<void> {
  await requisitar("/api/autenticacao/sair", "POST", undefined, token);
}
