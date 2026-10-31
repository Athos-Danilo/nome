import { Howl } from "howler";
import type { FabricaSom } from "./gerenciador";

export const fabricarSom: FabricaSom = (opcoes) => {
  const som = new Howl({
    src: [opcoes.arquivo],
    loop: opcoes.repetir,
    volume: opcoes.volume,
    preload: false,
    pool: 2,
    onloaderror: opcoes.aoFalhar,
    onplayerror: opcoes.aoFalhar,
  });
  let identificador: number | undefined;
  return {
    tocar: () => {
      if (som.state() === "unloaded") som.load();
      identificador =
        identificador === undefined ? som.play() : som.play(identificador);
    },
    pausar: () => {
      som.pause(identificador);
    },
    parar: () => {
      som.stop();
      identificador = undefined;
    },
    volume: (valor) => {
      som.volume(valor);
    },
    liberar: () => {
      som.unload();
      identificador = undefined;
    },
  };
};
