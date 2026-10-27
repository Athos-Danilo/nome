export async function consultarEstadoDaApi(): Promise<string> {
  const resposta = await fetch("/api/saude");
  if (!resposta.ok) throw new Error("A API não respondeu corretamente.");
  const dados: unknown = await resposta.json();
  if (
    typeof dados !== "object" ||
    dados === null ||
    !("situacao" in dados) ||
    dados.situacao !== "disponivel"
  ) {
    throw new Error("A API devolveu uma resposta inesperada.");
  }
  return "API disponível";
}
