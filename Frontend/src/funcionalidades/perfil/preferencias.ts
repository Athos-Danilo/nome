export const PALETAS = ["original", "azul", "roxa", "grafite"] as const;
export type Paleta = (typeof PALETAS)[number];
export type Preferencias = {
  tema: "claro" | "escuro";
  paleta: Paleta;
  musica_id: string | null;
  volume_musica: number;
  volume_interface: number;
  volume_eventos: number;
  silenciado: boolean;
  movimentos_reduzidos: boolean;
};
export type PreferenciasSalvas = Preferencias & { salvas: boolean };
export const CHAVE_PREFERENCIAS = "decifra_preferencias";
export const PADRAO: Preferencias = {
  tema: "claro",
  paleta: "original",
  musica_id: null,
  volume_musica: 70,
  volume_interface: 70,
  volume_eventos: 70,
  silenciado: false,
  movimentos_reduzidos: false,
};
export function somentePreferencias(dados: Preferencias): Preferencias {
  return {
    tema: dados.tema,
    paleta: dados.paleta ?? "original",
    musica_id: dados.musica_id,
    volume_musica: dados.volume_musica,
    volume_interface: dados.volume_interface,
    volume_eventos: dados.volume_eventos,
    silenciado: dados.silenciado,
    movimentos_reduzidos: dados.movimentos_reduzidos,
  };
}
export function preferenciasValidas(valor: unknown): valor is Preferencias {
  if (!valor || typeof valor !== "object") return false;
  const dados = valor as Record<string, unknown>;
  const volumes = [
    dados.volume_musica,
    dados.volume_interface,
    dados.volume_eventos,
  ];
  return (
    (dados.paleta === undefined || PALETAS.some((p) => p === dados.paleta)) &&
    (dados.tema === "claro" || dados.tema === "escuro") &&
    (dados.musica_id === null ||
      ["lofi_01", "lofi_02", "lofi_03", "arcade_01", "arcade_02"].includes(
        String(dados.musica_id),
      )) &&
    volumes.every(
      (volume) =>
        typeof volume === "number" &&
        Number.isInteger(volume) &&
        volume >= 0 &&
        volume <= 100,
    ) &&
    typeof dados.silenciado === "boolean" &&
    typeof dados.movimentos_reduzidos === "boolean"
  );
}
export function lerPreferenciasLocais(
  armazenamento: Pick<Storage, "getItem">,
): Preferencias {
  try {
    const texto = armazenamento.getItem(CHAVE_PREFERENCIAS);
    const dados: unknown = texto ? JSON.parse(texto) : null;
    return preferenciasValidas(dados)
      ? somentePreferencias(dados)
      : { ...PADRAO };
  } catch {
    return { ...PADRAO };
  }
}
export function gravarPreferenciasLocais(
  armazenamento: Pick<Storage, "setItem">,
  dados: Preferencias,
): boolean {
  try {
    armazenamento.setItem(
      CHAVE_PREFERENCIAS,
      JSON.stringify(somentePreferencias(dados)),
    );
    return true;
  } catch {
    return false;
  }
}
export function nomeValido(nome: string): boolean {
  return /^[\p{L}\p{Nd}_]{3,20}$/u.test(nome.normalize("NFC"));
}
