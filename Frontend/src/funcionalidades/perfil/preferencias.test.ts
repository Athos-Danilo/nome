import { describe, expect, it } from "vitest";
import {
  PADRAO,
  gravarPreferenciasLocais,
  lerPreferenciasLocais,
  nomeValido,
  preferenciasValidas,
} from "./preferencias";

describe("preferências e nomes do perfil", () => {
  it("preserva a escolha da trilha do menu e aceita dados antigos sem esse campo", () => {
    expect(
      lerPreferenciasLocais({
        getItem: () => JSON.stringify({ ...PADRAO, musica_menu_ativa: false }),
      }),
    ).toHaveProperty("musica_menu_ativa", false);
    const antigas = { ...PADRAO } as Record<string, unknown>;
    delete antigas.musica_menu_ativa;
    expect(
      lerPreferenciasLocais({ getItem: () => JSON.stringify(antigas) }),
    ).toHaveProperty("musica_menu_ativa", true);
    expect(preferenciasValidas({ ...PADRAO, musica_menu_ativa: "sim" })).toBe(
      false,
    );
  });
  it("recupera preferências locais válidas", () => {
    expect(
      lerPreferenciasLocais({
        getItem: () => JSON.stringify({ ...PADRAO, tema: "escuro" }),
      }).tema,
    ).toBe("escuro");
  });
  it.each([
    null,
    "{",
    JSON.stringify({}),
    JSON.stringify({ ...PADRAO, volume_musica: 101 }),
    JSON.stringify({ ...PADRAO, silenciado: "sim" }),
  ])("recupera o padrão para armazenamento inválido", (valor) => {
    expect(lerPreferenciasLocais({ getItem: () => valor })).toEqual(PADRAO);
  });
  it("não quebra quando o navegador recusa armazenamento", () => {
    expect(
      lerPreferenciasLocais({
        getItem: () => {
          throw new Error("bloqueado");
        },
      }),
    ).toEqual(PADRAO);
    expect(
      gravarPreferenciasLocais(
        {
          setItem: () => {
            throw new Error("bloqueado");
          },
        },
        PADRAO,
      ),
    ).toBe(false);
  });
  it.each([true, -1, 101, 0.5, "70"])("rejeita volume inválido", (valor) => {
    expect(preferenciasValidas({ ...PADRAO, volume_musica: valor })).toBe(
      false,
    );
  });
  it.each(["José_42", "Jose\u0301_42", "Ana"])(
    "aceita nome válido e Unicode normalizável",
    (valor) => expect(nomeValido(valor)).toBe(true),
  );
  it.each(["ab", "Ana Maria", "A!b", "a".repeat(21), " Ana"])(
    "rejeita nome fora da regra",
    (valor) => expect(nomeValido(valor)).toBe(false),
  );
});

it("migra preferências antigas sem perder o modo escuro", () => {
  const antigas = {
    tema: "escuro",
    musica_id: null,
    volume_musica: 20,
    volume_interface: 30,
    volume_eventos: 40,
    silenciado: false,
    movimentos_reduzidos: true,
  };
  expect(
    lerPreferenciasLocais({ getItem: () => JSON.stringify(antigas) }),
  ).toMatchObject({ paleta: "original", tema: "escuro", volume_musica: 20 });
});
it("recusa paleta inexistente", () => {
  expect(preferenciasValidas({ ...PADRAO, paleta: "coral" })).toBe(false);
});
