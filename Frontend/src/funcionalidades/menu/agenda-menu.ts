import {
  decidirPrioridade,
  escolherSemRepetir,
  type AcontecimentoMenu,
} from "./politica-agenda";

export type OpcoesAgenda = {
  falas?: readonly string[];
  surpresas?: readonly string[];
  duracoesSurpresas?: Readonly<Record<string, number>>;
};
export type CondicoesAgenda = {
  oculta: boolean;
  reduzida: boolean;
  bloqueada: boolean;
};
export type EstadoAgenda = {
  ativa: AcontecimentoMenu | null;
  pausada: boolean;
  reduzida: boolean;
};
export type RecursosAgenda = {
  agora: () => number;
  agendar: (acao: () => void, atraso: number) => () => void;
  sortear: () => number;
};

/** Agenda de acontecimentos do menu; não avança quadros nem acessa dados do jogo. */
export class AgendaMenu {
  private atual: EstadoAgenda = {
    ativa: null,
    pausada: false,
    reduzida: false,
  };
  private condicao: CondicoesAgenda = {
    oculta: false,
    reduzida: false,
    bloqueada: false,
  };
  private ouvintes = new Set<() => void>();
  private iniciada = false;
  private marca = 0;
  private tempo = 0;
  private fim = 0;
  private cancelar: (() => void) | null = null;
  private pendente: AcontecimentoMenu | null = null;
  private vistos: string[] = [];
  private sequencia = 0;
  private falaEm = 0;
  private surpresaEm = 0;
  private ultimaFala: string | null = null;
  private ultimaSurpresa: string | null = null;

  constructor(
    private recursos: RecursosAgenda,
    private opcoes: OpcoesAgenda = {},
  ) {
    this.reprogramarOportunidades();
  }
  estado = () => this.atual;
  observar = (ouvinte: () => void) => {
    this.ouvintes.add(ouvinte);
    return () => {
      this.ouvintes.delete(ouvinte);
    };
  };
  iniciar() {
    if (this.iniciada) return;
    this.iniciada = true;
    this.marca = this.recursos.agora();
    this.programar();
  }
  parar() {
    this.sincronizar();
    this.iniciada = false;
    this.cancelar?.();
    this.cancelar = null;
  }
  configurar(opcoes: OpcoesAgenda) {
    this.sincronizar();
    const iguais = (a: readonly string[] = [], b: readonly string[] = []) =>
      a.length === b.length && a.every((id, i) => id === b[i]);
    const falasMudaram =
      opcoes.falas !== undefined && !iguais(this.opcoes.falas, opcoes.falas);
    const surpresasMudaram =
      opcoes.surpresas !== undefined &&
      !iguais(this.opcoes.surpresas, opcoes.surpresas);
    this.opcoes = { ...this.opcoes, ...opcoes };
    if (falasMudaram) this.falaEm = this.tempo + this.intervalo(10000, 5000);
    if (surpresasMudaram)
      this.surpresaEm = this.tempo + this.intervalo(20000, 15000);
    if (
      (falasMudaram && this.atual.ativa?.tipo === "fala") ||
      (surpresasMudaram && this.atual.ativa?.tipo === "surpresa")
    ) {
      this.pendente = null;
      this.publicar({ ativa: null });
    }
    this.programar();
  }
  condicoes(novas: Partial<CondicoesAgenda>) {
    this.sincronizar();
    this.condicao = { ...this.condicao, ...novas };
    const pausada = Object.values(this.condicao).some(Boolean);
    const reduzida = this.condicao.reduzida;
    if (reduzida) {
      this.pendente = null;
      if (
        this.atual.ativa?.tipo === "fala" ||
        this.atual.ativa?.tipo === "surpresa" ||
        this.atual.ativa?.tipo === "interacao"
      )
        this.publicar({ ativa: null });
      this.reprogramarOportunidades();
    }
    this.publicar({ pausada, reduzida });
    this.programar();
  }
  solicitar(evento: AcontecimentoMenu): boolean {
    this.sincronizar();
    if (
      !this.iniciada ||
      this.atual.pausada ||
      this.vistos.includes(evento.id) ||
      !Number.isFinite(evento.duracao) ||
      evento.duracao <= 0
    )
      return false;
    const decisao = decidirPrioridade(
      this.atual.ativa?.tipo ?? null,
      evento.tipo,
    );
    if (decisao === "ignorar" || (decisao === "aguardar" && this.pendente))
      return false;
    this.vistos = [...this.vistos.slice(-63), evento.id];
    if (decisao === "aguardar") this.pendente = evento;
    else this.ativar(evento);
    this.programar();
    return true;
  }
  private publicar(mudanca: Partial<EstadoAgenda>) {
    const proximo = { ...this.atual, ...mudanca };
    if (
      proximo.ativa === this.atual.ativa &&
      proximo.pausada === this.atual.pausada &&
      proximo.reduzida === this.atual.reduzida
    )
      return;
    this.atual = proximo;
    this.ouvintes.forEach((avisar) => avisar());
  }
  private sincronizar() {
    const agora = this.recursos.agora();
    if (this.iniciada && !this.atual.pausada)
      this.tempo += Math.max(0, agora - this.marca);
    this.marca = agora;
  }
  private intervalo(minimo: number, variacao: number) {
    const valor = this.recursos.sortear();
    return (
      minimo +
      (Number.isFinite(valor) ? Math.max(0, Math.min(1, valor)) : 0) * variacao
    );
  }
  private reprogramarOportunidades() {
    this.falaEm = this.tempo + this.intervalo(10000, 5000);
    this.surpresaEm = this.tempo + this.intervalo(20000, 15000);
  }
  private ativar(evento: AcontecimentoMenu) {
    this.fim = this.tempo + evento.duracao;
    this.publicar({ ativa: evento });
  }
  private avancar = () => {
    this.cancelar = null;
    this.sincronizar();
    const estavaOcupada = !!this.atual.ativa;
    if (this.atual.ativa && this.tempo >= this.fim) {
      const gestoTerminou =
        this.atual.ativa.tipo === "surpresa" ||
        this.atual.ativa.tipo === "interacao";
      this.publicar({ ativa: null });
      if (this.pendente) {
        const proxima = this.pendente;
        this.pendente = null;
        this.ativar(proxima);
      }
      if (gestoTerminou) this.reprogramarOportunidades();
    }
    const falaVenceu = this.tempo >= this.falaEm;
    const surpresaVenceu = this.tempo >= this.surpresaEm;
    if (falaVenceu) this.falaEm = this.tempo + this.intervalo(10000, 5000);
    if (surpresaVenceu)
      this.surpresaEm = this.tempo + this.intervalo(20000, 15000);
    if (!estavaOcupada && !this.atual.ativa) {
      const tipo =
        falaVenceu && this.opcoes.falas?.length
          ? "fala"
          : surpresaVenceu && this.opcoes.surpresas?.length
            ? "surpresa"
            : null;
      if (tipo) {
        const conteudo = escolherSemRepetir(
          tipo === "fala"
            ? (this.opcoes.falas ?? [])
            : (this.opcoes.surpresas ?? []),
          tipo === "fala" ? this.ultimaFala : this.ultimaSurpresa,
          this.recursos.sortear,
        );
        if (conteudo) {
          if (tipo === "fala") this.ultimaFala = conteudo;
          else this.ultimaSurpresa = conteudo;
          this.ativar({
            id: `menu-${tipo}-${++this.sequencia}`,
            tipo,
            duracao: tipo === "fala" ? 600 : this.duracaoSurpresa(conteudo),
            conteudo,
          });
        }
      }
    }
    this.programar();
  };
  private duracaoSurpresa(conteudo: string) {
    const duracao = this.opcoes.duracoesSurpresas?.[conteudo];
    return duracao !== undefined && Number.isFinite(duracao) && duracao > 0
      ? duracao
      : 3000;
  }
  private programar() {
    this.cancelar?.();
    this.cancelar = null;
    if (!this.iniciada || this.atual.pausada) return;
    const proximos = this.atual.ativa
      ? [this.fim]
      : [
          ...(this.opcoes.falas?.length ? [this.falaEm] : []),
          ...(this.opcoes.surpresas?.length ? [this.surpresaEm] : []),
        ];
    if (proximos.length)
      this.cancelar = this.recursos.agendar(
        this.avancar,
        Math.max(0, Math.min(...proximos) - this.tempo),
      );
  }
}
