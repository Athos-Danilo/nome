export type ModoEntrada = "individual" | "galera";
export type AcaoEntrada = "palpite" | "letra";
export type Acento =
  "agudo" | "grave" | "circunflexo" | "til" | "trema" | "nenhum";
export type EspecificacaoEntrada = {
  posicoes: (string | null)[];
  modo?: ModoEntrada;
  acao?: AcaoEntrada;
  limites?: Record<string, number>;
  bloqueadas?: string[];
};
export type EstadoEntrada = {
  posicoes: (string | null)[];
  letras: string[];
  selecionada: number;
  modo: ModoEntrada;
  acao: AcaoEntrada;
  limites: Record<string, number>;
  bloqueadas: string[];
  aviso: string;
};
export const ALFABETO = "QWERTYUIOPASDFGHJKLÇZXCVBNM".split("");
export const NUMEROS = "1234567890".split("");
export function familia(letra: string): string {
  const normal = letra.normalize("NFC").toUpperCase();
  const base = normal.normalize("NFD")[0];
  return base && "AEIOU".includes(base) ? base : normal;
}
export function criarEntrada(dados: EspecificacaoEntrada): EstadoEntrada {
  const posicoes = dados.posicoes.map(
    (c) => c?.normalize("NFC").toUpperCase() ?? null,
  );
  return {
    posicoes,
    letras: posicoes.map((c) => c ?? ""),
    selecionada: posicoes.findIndex((c) => c === null),
    modo: dados.modo ?? "individual",
    acao: dados.acao ?? "palpite",
    limites: { ...dados.limites },
    bloqueadas: (dados.bloqueadas ?? []).map(familia),
    aviso: "",
  };
}
function editavel(estado: EstadoEntrada, posicao: number): boolean {
  return (
    Number.isInteger(posicao) &&
    posicao >= 0 &&
    posicao < estado.posicoes.length &&
    estado.posicoes[posicao] === null
  );
}
function quantidade(
  estado: EstadoEntrada,
  letra: string,
  excluir = -1,
): number {
  return estado.letras.filter(
    (c, i) => i !== excluir && c && familia(c) === familia(letra),
  ).length;
}
function compartilhada(estado: EstadoEntrada, letra: string): boolean {
  return estado.modo === "galera" && estado.bloqueadas.includes(familia(letra));
}
export function bloqueada(estado: EstadoEntrada, letra: string): boolean {
  if (compartilhada(estado, letra)) return true;
  const limite = estado.limites[familia(letra)];
  return (
    estado.modo === "individual" &&
    limite > 0 &&
    quantidade(estado, letra) >= limite
  );
}
export function selecionar(
  estado: EstadoEntrada,
  posicao: number,
): EstadoEntrada {
  return editavel(estado, posicao)
    ? { ...estado, selecionada: posicao, aviso: "" }
    : estado;
}
export function mover(estado: EstadoEntrada, direcao: -1 | 1): EstadoEntrada {
  for (
    let i = estado.selecionada + direcao;
    i >= 0 && i < estado.posicoes.length;
    i += direcao
  )
    if (editavel(estado, i)) return selecionar(estado, i);
  return estado;
}
export function inserir(
  estado: EstadoEntrada,
  valor: string,
  posicao = estado.selecionada,
): EstadoEntrada {
  if (estado.acao === "letra") return estado;
  const letra = valor.normalize("NFC").toUpperCase();
  if (!/^[\p{L}0-9]$/u.test(letra))
    return { ...estado, aviso: "Escolha uma letra ou um número por posição." };
  if (!editavel(estado, posicao))
    return {
      ...estado,
      aviso: "Esta posição está fixa. Escolha um quadradinho livre.",
    };
  if (compartilhada(estado, letra))
    return {
      ...estado,
      aviso: "Esta letra está bloqueada nesta sessão. Sua vez foi preservada.",
    };
  const limite = estado.limites[familia(letra)];
  if (
    estado.modo === "individual" &&
    limite > 0 &&
    quantidade(estado, letra, posicao) >= limite
  )
    return {
      ...estado,
      aviso:
        "Essa letra já atingiu o limite de usos. Remova uma ocorrência para usar novamente.",
    };
  const letras = [...estado.letras];
  letras[posicao] = letra;
  const novo = { ...estado, letras, selecionada: posicao, aviso: "" };
  return mover(novo, 1);
}
export function apagar(
  estado: EstadoEntrada,
  retroceder = false,
): EstadoEntrada {
  if (estado.acao === "letra") return estado;
  let alvo = estado;
  if (retroceder && !estado.letras[estado.selecionada])
    alvo = mover(estado, -1);
  if (!editavel(alvo, alvo.selecionada)) return estado;
  const letras = [...alvo.letras];
  letras[alvo.selecionada] = "";
  return { ...alvo, letras, aviso: "" };
}
const MARCAS: Record<Exclude<Acento, "nenhum">, string> = {
  agudo: "\u0301",
  grave: "\u0300",
  circunflexo: "\u0302",
  til: "\u0303",
  trema: "\u0308",
};
export function acentuar(estado: EstadoEntrada, acento: Acento): EstadoEntrada {
  const indice = estado.selecionada;
  const base = familia(estado.letras[indice] ?? "");
  if (
    estado.acao === "letra" ||
    !editavel(estado, indice) ||
    !/^[AEIOU]$/.test(base) ||
    (acento === "til" && !"AO".includes(base))
  )
    return {
      ...estado,
      aviso: "Selecione uma vogal compatível para aplicar esse acento.",
    };
  const letras = [...estado.letras];
  letras[indice] = (
    base + (acento === "nenhum" ? "" : MARCAS[acento])
  ).normalize("NFC");
  return { ...estado, letras, aviso: "" };
}
export function montarPalpite(estado: EstadoEntrada): string | null {
  if (
    estado.acao === "letra" ||
    !estado.letras.length ||
    estado.letras.some((c) => !c)
  )
    return null;
  return estado.letras.join("").normalize("NFC");
}
