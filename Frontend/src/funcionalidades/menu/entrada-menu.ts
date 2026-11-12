type ArmazenamentoEntrada = Pick<Storage, "getItem" | "setItem">;
export type TipoEntradaMenu = "primeira" | "retorno" | "estatica";
const CHAVE_ENTRADA = "decifra_menu_apresentado";

/** A marca é somente visual. Consultar durante render não escreve nem consome a entrada. */
export function criarRegistroEntrada(
  armazenamento: () => ArmazenamentoEntrada,
) {
  let confirmada = false;
  return {
    consultar(): "primeira" | "retorno" {
      if (confirmada) return "retorno";
      try {
        if (armazenamento().getItem(CHAVE_ENTRADA) === "1") return "retorno";
      } catch {
        /* Memória local preserva a navegação se o navegador bloquear Storage. */
      }
      return "primeira";
    },
    confirmar() {
      if (confirmada) return;
      confirmada = true;
      try {
        armazenamento().setItem(CHAVE_ENTRADA, "1");
      } catch {
        /* A indisponibilidade não impede usar o menu. */
      }
    },
  };
}
