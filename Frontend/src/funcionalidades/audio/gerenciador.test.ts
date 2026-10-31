import { expect, test, vi } from "vitest";
import { GerenciadorAudio, type OpcoesSom, type Som } from "./gerenciador";
import { PADRAO } from "../perfil/preferencias";

function preparar() {
  const sons: (Som & { opcoes: OpcoesSom })[] = [];
  const fabrica = vi.fn((opcoes: OpcoesSom): Som => {
    const som = {
      opcoes,
      tocar: vi.fn(),
      pausar: vi.fn(),
      parar: vi.fn(),
      volume: vi.fn(),
      liberar: vi.fn(),
    };
    sons.push(som);
    return som;
  });
  let tempo = 0;
  const audio = new GerenciadorAudio(fabrica, () => tempo);
  return {
    audio,
    fabrica,
    sons,
    avancar: (valor: number) => {
      tempo += valor;
    },
  };
}

test("menu tem sua própria faixa e alternância independente da música da partida", () => {
  const { audio, sons } = preparar();
  audio.preferencias({ ...PADRAO, musica_id: "lofi_01" });
  audio.areaMenu(true);
  audio.desbloquear();
  expect(sons[0].opcoes.arquivo).toBe("/audio/musicas/menu.mp3");
  audio.preferencias({
    ...PADRAO,
    musica_id: "lofi_01",
    musica_menu_ativa: false,
  });
  expect(audio.estado().faixa).toBeNull();
  audio.areaMenu(false);
  audio.partida(true);
  expect(audio.estado().faixa).toBe("lofi_01");
});

test("não carrega nem reproduz antes de interação; mantém só uma faixa e carrega sob demanda", () => {
  const { audio, fabrica, sons } = preparar();
  audio.preferencias({ ...PADRAO, musica_id: "lofi_01" });
  audio.partida(true);
  expect(fabrica).not.toHaveBeenCalled();
  audio.desbloquear();
  expect(sons).toHaveLength(1);
  audio.preferencias({ ...PADRAO, musica_id: "lofi_01", volume_musica: 30 });
  expect(sons).toHaveLength(1);
  expect(sons[0].volume).toHaveBeenLastCalledWith(0.3);
  audio.preferencias({ ...PADRAO, musica_id: "arcade_01" });
  expect(sons[0].liberar).toHaveBeenCalledOnce();
  expect(sons).toHaveLength(2);
  audio.destruir();
  expect(sons[1].liberar).toHaveBeenCalledOnce();
});

test("silêncio e volumes independentes impedem sons e atualizam os já carregados", () => {
  const { audio, sons } = preparar();
  audio.desbloquear();
  audio.preferencias({ ...PADRAO, volume_interface: 20, volume_eventos: 50 });
  audio.efeito("botao");
  audio.efeito("acerto", "rodada:1");
  expect(sons[0].opcoes.volume).toBe(0.2);
  expect(sons[1].opcoes.volume).toBe(0.5);
  audio.preferencias({ ...PADRAO, silenciado: true });
  audio.efeito("erro", "rodada:2");
  expect(sons).toHaveLength(2);
  expect(sons[0].parar).toHaveBeenCalled();
});

test("eventos confirmados não repetem; teclado rápido tem limite sem bloquear o jogo", () => {
  const { audio, sons, avancar } = preparar();
  audio.desbloquear();
  audio.efeito("acerto", "p:2");
  audio.efeito("acerto", "p:2");
  expect(sons[0].tocar).toHaveBeenCalledTimes(1);
  audio.efeito("tecla");
  audio.efeito("tecla");
  expect(sons[1].tocar).toHaveBeenCalledTimes(1);
  avancar(80);
  audio.efeito("tecla");
  expect(sons[1].tocar).toHaveBeenCalledTimes(2);
});

test("ocultar pausa e retornar retoma; encerrar partida e prévia não deixam música tocando", () => {
  const { audio, sons } = preparar();
  audio.desbloquear();
  audio.preferencias({ ...PADRAO, musica_id: "lofi_02" });
  audio.partida(true);
  audio.visivel(false);
  expect(sons[0].pausar).toHaveBeenCalled();
  audio.visivel(true);
  expect(sons[0].tocar).toHaveBeenCalledTimes(2);
  audio.partida(false);
  expect(sons[0].liberar).toHaveBeenCalledOnce();
  expect(audio.estado().faixa).toBeNull();
  audio.prever("arcade_02");
  expect(sons).toHaveLength(2);
  audio.prever(null);
  expect(sons[1].liberar).toHaveBeenCalledOnce();
});

test("falha de arquivo informa sem repetir tentativas até pedido explícito", () => {
  const { audio, sons } = preparar();
  audio.desbloquear();
  audio.preferencias({ ...PADRAO, musica_id: "lofi_01" });
  audio.partida(true);
  sons[0].opcoes.aoFalhar();
  expect(audio.estado().aviso).toBeTruthy();
  audio.partida(true);
  expect(sons).toHaveLength(1);
  audio.tentarNovamente();
  expect(sons).toHaveLength(2);
});

test("recuperação de efeito descarta o recurso que falhou e cria uma nova tentativa", () => {
  const { audio, sons, avancar } = preparar();
  audio.desbloquear();
  audio.efeito("tecla");
  sons[0].opcoes.aoFalhar();
  expect(sons[0].liberar).toHaveBeenCalledOnce();
  audio.tentarNovamente();
  avancar(100);
  audio.efeito("tecla");
  expect(sons).toHaveLength(2);
  expect(sons[1].tocar).toHaveBeenCalledOnce();
});
