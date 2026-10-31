import { expect, test, vi } from "vitest";
const { som } = vi.hoisted(() => ({
  som: {
    state: vi.fn(() => "unloaded"),
    load: vi.fn(),
    play: vi.fn(() => 42),
    pause: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    unload: vi.fn(),
  },
}));
vi.mock("howler", () => ({
  Howl: vi.fn(function () {
    return som;
  }),
}));
import { fabricarSom } from "./howler";

test("adaptador com preload desativado carrega explicitamente só ao tocar", () => {
  const recurso = fabricarSom({
    arquivo: "/audio/musicas/menu.mp3",
    repetir: true,
    volume: 0.3,
    aoFalhar: vi.fn(),
  });
  expect(som.load).not.toHaveBeenCalled();
  recurso.tocar();
  expect(som.load).toHaveBeenCalledOnce();
  expect(som.play).toHaveBeenCalledOnce();
  som.state.mockReturnValue("loaded");
  recurso.pausar();
  recurso.tocar();
  expect(som.load).toHaveBeenCalledOnce();
  expect(som.play).toHaveBeenLastCalledWith(42);
  recurso.liberar();
  expect(som.unload).toHaveBeenCalledOnce();
});
