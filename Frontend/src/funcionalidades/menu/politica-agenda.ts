export type TipoAcontecimento = "entrada" | "interacao" | "fala" | "surpresa";
export type AcontecimentoMenu = {
  id: string;
  tipo: TipoAcontecimento;
  duracao: number;
  conteudo?: string;
};
const PRIORIDADES = { surpresa: 1, fala: 2, entrada: 3, interacao: 4 };

export function decidirPrioridade(
  ativa: TipoAcontecimento | null,
  proxima: TipoAcontecimento,
): "iniciar" | "aguardar" | "ignorar" {
  if (!ativa) return "iniciar";
  if (ativa === "entrada")
    return proxima === "interacao" ? "aguardar" : "ignorar";
  if (ativa === "interacao") return "ignorar";
  return PRIORIDADES[proxima] > PRIORIDADES[ativa] ? "iniciar" : "ignorar";
}

export function escolherSemRepetir(
  candidatos: readonly string[],
  anterior: string | null,
  sortear: () => number,
): string | null {
  const unicos = [...new Set(candidatos)];
  const disponiveis =
    unicos.length > 1 ? unicos.filter((id) => id !== anterior) : unicos;
  if (!disponiveis.length) return null;
  const valor = sortear();
  const indice = Math.floor(
    (Number.isFinite(valor) ? Math.max(0, Math.min(0.999999, valor)) : 0) *
      disponiveis.length,
  );
  return disponiveis[indice];
}
