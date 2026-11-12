import { expect, test } from "vitest";
import {
  GESTOS_MENU,
  DURACOES_GESTOS,
  poseGestoMenu,
  surpresasDisponiveis,
} from "./gestos-menu";

test("gestos do menu têm início/fim neutros, tempo finito e identidades distintas", () => {
  const assinaturas = [];
  for (const gesto of GESTOS_MENU) {
    const neutra = poseGestoMenu(gesto, 0);
    expect(poseGestoMenu(gesto, DURACOES_GESTOS[gesto])).toEqual(neutra);
    expect(poseGestoMenu(gesto, Number.NaN)).toEqual(neutra);
    expect(poseGestoMenu(gesto, -100)).toEqual(neutra);
    assinaturas.push(
      JSON.stringify(
        [0.25, 0.45, 0.65].map((t) =>
          poseGestoMenu(gesto, DURACOES_GESTOS[gesto] * t),
        ),
      ),
    );
    for (let t = 0; t <= DURACOES_GESTOS[gesto]; t += 31)
      expect(
        Object.values(poseGestoMenu(gesto, t)).every(Number.isFinite),
      ).toBe(true);
  }
  expect(new Set(assinaturas).size).toBe(GESTOS_MENU.length);
});

test("visitante não recebe gestos que apontam para modos indisponíveis", () => {
  expect(surpresasDisponiveis(false)).toEqual([
    "ajeitar_gravata",
    "seguir_letra",
  ]);
  expect(surpresasDisponiveis(true)).toEqual([
    "olhar_solo",
    "olhar_galera",
    "ajeitar_gravata",
    "seguir_letra",
  ]);
  expect(surpresasDisponiveis(true)).not.toContain("reagir_toque");
});

test("olhar usa direção medida para cartões abaixo ou ao lado sem sair dos limites", () => {
  const t = DURACOES_GESTOS.olhar_solo * 0.4;
  const desktop = poseGestoMenu("olhar_solo", t, { x: 14, y: -8 });
  const celular = poseGestoMenu("olhar_solo", t, { x: -6, y: 12 });
  expect(desktop.pupilaX).toBeGreaterThan(0);
  expect(desktop.pupilaY).toBeLessThan(0);
  expect(celular.pupilaY).toBeGreaterThan(0);
  const limite = poseGestoMenu("olhar_solo", t, { x: 999, y: -999 });
  expect(Math.abs(limite.pupilaX)).toBeLessThanOrEqual(16);
  expect(Math.abs(limite.pupilaY)).toBeLessThanOrEqual(12);
});

test("seguir a letra coordena o olhar com uma trajetória própria", () => {
  const esquerda = poseGestoMenu(
    "seguir_letra",
    DURACOES_GESTOS.seguir_letra * 0.25,
  );
  const direita = poseGestoMenu(
    "seguir_letra",
    DURACOES_GESTOS.seguir_letra * 0.55,
  );
  expect(esquerda.letra).toBeGreaterThan(0.8);
  expect(esquerda.letraX).toBeLessThan(direita.letraX);
  expect(esquerda.pupilaX).toBeLessThan(0);
  expect(direita.pupilaX).toBeGreaterThan(0);
});

test("toque usa piscadela e pequeno salto; gravata usa mão articulada", () => {
  const toque = poseGestoMenu(
    "reagir_toque",
    DURACOES_GESTOS.reagir_toque * 0.62,
  );
  expect(toque.olhoEsquerdo).toBeLessThan(0.18);
  expect(
    poseGestoMenu("reagir_toque", DURACOES_GESTOS.reagir_toque * 0.4).saltoY,
  ).toBeLessThan(-10);
  const gravata = poseGestoMenu(
    "ajeitar_gravata",
    DURACOES_GESTOS.ajeitar_gravata * 0.4,
  );
  expect(gravata.ombro).toBeGreaterThan(90);
  expect(gravata.cotovelo).toBeGreaterThan(30);
});
