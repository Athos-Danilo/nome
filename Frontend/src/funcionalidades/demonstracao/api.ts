import { ErroDaApi, requisitar } from "../perfil/api";

export type Demonstracao = {
  partida_id: string;
  estado: "preparada" | "em_andamento" | "pausada" | "concluida" | "abandonada";
  pontuacao: number;
  versao: number;
  quantidade_palavras: 3;
  dificuldade: "facil";
  vinculo_expira_em: string;
};
export type Visitante = {
  demonstracao_utilizada: boolean;
  pode_iniciar: boolean;
  vinculada: boolean;
  demonstracao: Demonstracao | null;
  token_csrf: string;
};

function objeto(valor: unknown): valor is Record<string, unknown> {
  return !!valor && typeof valor === "object";
}

function demonstracaoValida(valor: unknown): valor is Demonstracao {
  return (
    objeto(valor) &&
    typeof valor.partida_id === "string" &&
    [
      "preparada",
      "em_andamento",
      "pausada",
      "concluida",
      "abandonada",
    ].includes(String(valor.estado)) &&
    Number.isInteger(valor.pontuacao) &&
    Number.isInteger(valor.versao) &&
    valor.quantidade_palavras === 3 &&
    valor.dificuldade === "facil" &&
    typeof valor.vinculo_expira_em === "string" &&
    Number.isFinite(Date.parse(valor.vinculo_expira_em))
  );
}

export async function identificarVisitante(): Promise<Visitante> {
  const valor = await requisitar("/api/visitantes", "POST", {});
  if (
    !objeto(valor) ||
    typeof valor.demonstracao_utilizada !== "boolean" ||
    typeof valor.pode_iniciar !== "boolean" ||
    typeof valor.vinculada !== "boolean" ||
    typeof valor.token_csrf !== "string" ||
    !(valor.demonstracao === null || demonstracaoValida(valor.demonstracao))
  )
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível recuperar seu teste.",
    );
  return {
    demonstracao_utilizada: valor.demonstracao_utilizada,
    pode_iniciar: valor.pode_iniciar,
    vinculada: valor.vinculada,
    demonstracao: valor.demonstracao,
    token_csrf: valor.token_csrf,
  };
}

export async function vincularDemonstracao(
  token: string,
): Promise<{ partida_id: string; vinculada: true }> {
  const valor = await requisitar(
    "/api/demonstracoes/vinculo",
    "POST",
    {},
    token,
  );
  if (
    !objeto(valor) ||
    typeof valor.partida_id !== "string" ||
    valor.vinculada !== true
  )
    throw new ErroDaApi(
      "RESPOSTA_INVALIDA",
      "Não foi possível confirmar o vínculo.",
    );
  return { partida_id: valor.partida_id, vinculada: true };
}
