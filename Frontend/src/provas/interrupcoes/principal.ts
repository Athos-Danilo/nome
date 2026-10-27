import { ehObjeto, lerEstado } from "./estado";
import type { EstadoProva } from "./estado";
import "./estilos.css";

function elemento(identificador: string): HTMLElement {
  const encontrado = document.getElementById(identificador);
  if (!encontrado) throw new Error(`Elemento ausente: ${identificador}`);
  return encontrado;
}

function botao(identificador: string): HTMLButtonElement {
  const encontrado = elemento(identificador);
  if (!(encontrado instanceof HTMLButtonElement))
    throw new Error("Botão inválido.");
  return encontrado;
}

const documentoId = crypto.randomUUID();
const abaId =
  sessionStorage.getItem("decifra_prova_aba") ?? crypto.randomUUID();
sessionStorage.setItem("decifra_prova_aba", abaId);
let provaId = localStorage.getItem("decifra_prova_id");
let conectado = false;
let requisicaoAtiva = false;
let estadoAtual: EstadoProva | null = null;
let ultimaAcao: { id_acao: string; tipo: string } | null = null;
const acaoSalva = sessionStorage.getItem("decifra_prova_acao");
if (acaoSalva) {
  try {
    const valor: unknown = JSON.parse(acaoSalva);
    if (
      ehObjeto(valor) &&
      typeof valor.id_acao === "string" &&
      typeof valor.tipo === "string"
    )
      ultimaAcao = { id_acao: valor.id_acao, tipo: valor.tipo };
  } catch {
    sessionStorage.removeItem("decifra_prova_acao");
  }
}

async function requisitar(caminho: string, dados: object): Promise<unknown> {
  const resposta = await fetch(caminho, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok)
    throw new Error(`O servidor recusou a operação (${resposta.status}).`);
  const valor: unknown = await resposta.json();
  return valor;
}

function apresentar(valor: unknown): void {
  const estado = lerEstado(valor);
  estadoAtual = estado;
  elemento("saldo").textContent = String(estado.saldo_simulado);
  elemento("pausas").textContent = String(estado.pausas_simuladas);
  elemento("classificacao").textContent = estado.classificacao;
  elemento("estado").textContent = JSON.stringify(valor, null, 2);
  elemento("eventos").replaceChildren(
    ...estado.eventos
      .slice(-12)
      .reverse()
      .map((evento) => {
        const linha = document.createElement("li");
        linha.textContent = `${evento.sequencia}. ${evento.tipo.replaceAll("_", " ")}`;
        return linha;
      }),
  );
  botao("pausar").disabled =
    estado.modo !== "individual" || estado.estado !== "ativa";
  botao("retomar").disabled = estado.estado === "encerrada";
  botao("encerrar").disabled = estado.estado === "encerrada";
  botao("reenviar").disabled = ultimaAcao === null;
  elemento("conexao").textContent =
    `Servidor confirmou: ${estado.modo} / ${estado.estado}.`;
}

async function proteger(operacao: () => Promise<void>): Promise<void> {
  if (requisicaoAtiva) return;
  requisicaoAtiva = true;
  try {
    await operacao();
  } catch (falha: unknown) {
    const mensagem = !navigator.onLine
      ? "Navegador sem rede. Aguardando confirmação do servidor."
      : falha instanceof Error && !(falha instanceof TypeError)
        ? falha.message
        : "Não foi possível confirmar a conexão com o servidor.";
    elemento("conexao").textContent =
      `${mensagem} Nenhuma penalidade automática.`;
  } finally {
    requisicaoAtiva = false;
  }
}

async function conectar(): Promise<void> {
  if (!provaId) return;
  const navegacao = performance.getEntriesByType("navigation")[0];
  const tipo =
    navegacao instanceof PerformanceNavigationTiming
      ? navegacao.type
      : "desconhecida";
  apresentar(
    await requisitar(`/prova-api/experimentos/${provaId}/conexao`, {
      aba_id: abaId,
      documento_id: documentoId,
      navegacao: tipo,
    }),
  );
  conectado = true;
}

async function nova(modo: "individual" | "galera"): Promise<void> {
  conectado = false;
  const valor = await requisitar("/prova-api/experimentos", { modo });
  if (!ehObjeto(valor) || typeof valor.id !== "string")
    throw new Error("Identificador de prova inválido.");
  provaId = valor.id;
  localStorage.setItem("decifra_prova_id", provaId);
  ultimaAcao = null;
  sessionStorage.removeItem("decifra_prova_acao");
  await conectar();
}

async function agir(tipo: string, repetir = false): Promise<void> {
  if (!provaId) return;
  const acao = repetir ? ultimaAcao : { id_acao: crypto.randomUUID(), tipo };
  if (!acao) return;
  ultimaAcao = acao;
  sessionStorage.setItem("decifra_prova_acao", JSON.stringify(acao));
  apresentar(
    await requisitar(`/prova-api/experimentos/${provaId}/acoes`, acao),
  );
}

function sinalizar(tipo: string, persistido = false, aoSair = false): void {
  if (!provaId || !conectado) return;
  const caminho = `/prova-api/experimentos/${provaId}/sinais`;
  const dados = { documento_id: documentoId, tipo, persistido };
  if (aoSair) {
    navigator.sendBeacon(
      caminho,
      new Blob([JSON.stringify(dados)], { type: "application/json" }),
    );
  } else {
    void proteger(async () => apresentar(await requisitar(caminho, dados)));
  }
}

botao("nova-individual").onclick = () => {
  void proteger(() => nova("individual"));
};
botao("nova-galera").onclick = () => {
  void proteger(() => nova("galera"));
};
botao("pausar").onclick = () => {
  if (
    window.confirm(
      "Confirmar a pausa fictícia e descontar 100 pontos desta simulação?",
    )
  )
    void proteger(() => agir("pausar"));
};
botao("retomar").onclick = () => {
  void proteger(() => agir("retomar"));
};
botao("encerrar").onclick = () => {
  void proteger(() => agir("encerrar"));
};
botao("reenviar").onclick = () => {
  void proteger(() => agir("", true));
};
elemento("sair").onclick = (evento) => {
  evento.preventDefault();
  if (estadoAtual?.estado === "ativa") {
    const efeito =
      estadoAtual.modo === "individual"
        ? "Sair desta página pausará a simulação e descontará 100 pontos fictícios. Continuar?"
        : "Sair desta página encerrará a simulação da galera. Continuar?";
    if (!window.confirm(efeito)) return;
  }
  void proteger(async () => {
    if (estadoAtual?.estado === "ativa") await agir("sair");
    window.location.assign("/");
  });
};
window.addEventListener("pagehide", (evento) =>
  sinalizar("pagehide", evento.persisted, true),
);
window.addEventListener("pageshow", (evento) =>
  sinalizar("pageshow", evento.persisted),
);
document.addEventListener("visibilitychange", () =>
  sinalizar(document.hidden ? "oculta" : "visivel", false, true),
);
window.addEventListener("offline", () => {
  elemento("conexao").textContent =
    "Navegador sem rede. Aguardando confirmação do servidor, sem desconto automático.";
  sinalizar("offline");
});
window.addEventListener("online", () => sinalizar("online"));
window.setInterval(() => sinalizar("atividade"), 2000);
void proteger(conectar);
