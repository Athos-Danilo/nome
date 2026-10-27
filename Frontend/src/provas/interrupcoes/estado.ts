export interface EstadoProva {
  modo: "individual" | "galera";
  estado: string;
  classificacao: string;
  saldo_simulado: number;
  pausas_simuladas: number;
  eventos: { sequencia: number; tipo: string }[];
}

export function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

export function lerEstado(valor: unknown): EstadoProva {
  if (
    !ehObjeto(valor) ||
    (valor.modo !== "individual" && valor.modo !== "galera") ||
    typeof valor.estado !== "string" ||
    typeof valor.classificacao !== "string" ||
    typeof valor.saldo_simulado !== "number" ||
    typeof valor.pausas_simuladas !== "number" ||
    !Array.isArray(valor.eventos)
  )
    throw new Error("Estado de prova inválido.");
  const eventos = valor.eventos.map((evento: unknown) => {
    if (
      !ehObjeto(evento) ||
      typeof evento.sequencia !== "number" ||
      typeof evento.tipo !== "string"
    )
      throw new Error("Evento de prova inválido.");
    return { sequencia: evento.sequencia, tipo: evento.tipo };
  });
  return {
    modo: valor.modo,
    estado: valor.estado,
    classificacao: valor.classificacao,
    saldo_simulado: valor.saldo_simulado,
    pausas_simuladas: valor.pausas_simuladas,
    eventos,
  };
}
