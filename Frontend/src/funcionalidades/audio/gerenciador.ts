import { PADRAO, type Preferencias } from "../perfil/preferencias";
import {
  EFEITOS,
  TODAS_MUSICAS,
  type MusicaId,
  type TipoEfeito,
} from "./catalogo";

export type Som = {
  tocar: () => void;
  pausar: () => void;
  parar: () => void;
  volume: (valor: number) => void;
  liberar: () => void;
};
export type OpcoesSom = {
  arquivo: string;
  repetir: boolean;
  volume: number;
  aoFalhar: () => void;
};
export type FabricaSom = (opcoes: OpcoesSom) => Som;
export type EstadoAudio = {
  faixa: string | null;
  previa: boolean;
  aviso: string;
};

/** Política independente do navegador e do Howler; nenhuma regra do jogo depende dela. */
export class GerenciadorAudio {
  private ajustes: Preferencias = { ...PADRAO };
  private liberado = false;
  private naPartida = false;
  private visibilidade = true;
  private naAreaMenu = false;
  private previa: MusicaId | "menu" | null = null;
  private faixa: { id: string; som: Som; tocando: boolean } | null = null;
  private efeitos = new Map<TipoEfeito, Som>();
  private falhas = new Set<string>();
  private vistos = new Set<string>();
  private ultimoToque = new Map<string, number>();
  private ouvintes = new Set<() => void>();
  private retrato: EstadoAudio = { faixa: null, previa: false, aviso: "" };
  constructor(
    private fabricar: FabricaSom,
    private agora = () => performance.now(),
  ) {}
  estado = () => this.retrato;
  observar = (ouvinte: () => void) => {
    this.ouvintes.add(ouvinte);
    return () => {
      this.ouvintes.delete(ouvinte);
    };
  };
  private avisar(mudancas: Partial<EstadoAudio>) {
    this.retrato = { ...this.retrato, ...mudancas };
    for (const ouvinte of this.ouvintes) ouvinte();
  }
  preferencias(ajustes: Preferencias) {
    this.ajustes = { ...ajustes };
    for (const [tipo, som] of this.efeitos) {
      const volume = this.volumeEfeito(tipo);
      som.volume(volume);
      if (!volume) som.parar();
    }
    this.conciliar();
  }
  desbloquear() {
    this.liberado = true;
    this.conciliar();
  }
  partida(ativa: boolean) {
    this.naPartida = ativa;
    this.conciliar();
  }
  areaMenu(ativa: boolean) {
    this.naAreaMenu = ativa;
    this.conciliar();
  }
  visivel(valor: boolean) {
    this.visibilidade = valor;
    if (!valor) for (const som of this.efeitos.values()) som.parar();
    this.conciliar();
  }
  prever(id: MusicaId | "menu" | null) {
    this.previa = id;
    this.conciliar();
  }
  tentarNovamente() {
    this.falhas.clear();
    this.avisar({ aviso: "" });
    this.conciliar();
  }
  private falhar(arquivo: string) {
    this.falhas.add(arquivo);
    for (const [tipo, som] of this.efeitos) {
      if (`/audio/efeitos/${tipo}.wav` === arquivo) {
        som.liberar();
        this.efeitos.delete(tipo);
      }
    }
    if (
      this.faixa &&
      TODAS_MUSICAS.find((m) => m.id === this.faixa?.id)?.arquivo === arquivo
    ) {
      this.faixa.som.liberar();
      this.faixa = null;
    }
    this.avisar({
      aviso:
        "Não foi possível reproduzir um áudio. Você pode continuar jogando normalmente.",
      faixa: this.faixa?.id ?? null,
    });
  }
  private conciliar() {
    const escolhida =
      this.previa ??
      (this.naPartida
        ? this.ajustes.musica_id
        : this.naAreaMenu && this.ajustes.musica_menu_ativa
          ? "menu"
          : null);
    const musica = TODAS_MUSICAS.find((m) => m.id === escolhida);
    const permitida =
      this.liberado &&
      this.visibilidade &&
      !this.ajustes.silenciado &&
      this.ajustes.volume_musica > 0 &&
      (this.previa !== null ||
        this.naPartida ||
        (this.ajustes.musica_menu_ativa && this.naAreaMenu));
    if (this.faixa && this.faixa.id !== musica?.id) {
      this.faixa.som.liberar();
      this.faixa = null;
    }
    if (!permitida || !musica || this.falhas.has(musica.arquivo)) {
      if (this.faixa?.tocando) {
        this.faixa.som.volume(0);
        this.faixa.som.pausar();
        this.faixa.tocando = false;
      }
      this.avisar({ faixa: null, previa: false });
      return;
    }
    if (!this.faixa) {
      this.faixa = {
        id: musica.id,
        som: this.fabricar({
          arquivo: musica.arquivo,
          repetir: true,
          volume: this.ajustes.volume_musica / 100,
          aoFalhar: () => this.falhar(musica.arquivo),
        }),
        tocando: false,
      };
    }
    this.faixa.som.volume(this.ajustes.volume_musica / 100);
    if (!this.faixa.tocando) {
      this.faixa.tocando = true;
      this.faixa.som.tocar();
    }
    this.avisar({ faixa: musica.id, previa: this.previa !== null });
  }
  private volumeEfeito(tipo: TipoEfeito) {
    return this.ajustes.silenciado
      ? 0
      : this.ajustes[
          EFEITOS[tipo] === "interface" ? "volume_interface" : "volume_eventos"
        ] / 100;
  }
  efeito(tipo: TipoEfeito, id?: string) {
    if (id) {
      if (this.vistos.has(id)) return;
      this.vistos.add(id);
      if (this.vistos.size > 128)
        this.vistos.delete(this.vistos.values().next().value!);
    }
    if (!this.liberado || !this.visibilidade || !this.volumeEfeito(tipo))
      return;
    const arquivo = `/audio/efeitos/${tipo}.wav`;
    if (this.falhas.has(arquivo)) return;
    const instante = this.agora();
    if (instante - (this.ultimoToque.get(tipo) ?? -Infinity) < 55) return;
    this.ultimoToque.set(tipo, instante);
    let som = this.efeitos.get(tipo);
    if (!som) {
      som = this.fabricar({
        arquivo,
        repetir: false,
        volume: this.volumeEfeito(tipo),
        aoFalhar: () => this.falhar(arquivo),
      });
      this.efeitos.set(tipo, som);
    }
    som.parar();
    som.tocar();
  }
  destruir() {
    this.faixa?.som.liberar();
    this.faixa = null;
    for (const som of this.efeitos.values()) som.liberar();
    this.efeitos.clear();
    this.previa = null;
    this.naPartida = false;
    this.liberado = false;
    this.avisar({ faixa: null, previa: false });
  }
}
