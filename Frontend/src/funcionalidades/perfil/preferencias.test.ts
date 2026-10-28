import { describe, expect, it } from "vitest";
import {
  PADRAO,
  gravarPreferenciasLocais,
  lerPreferenciasLocais,
  nomeValido,
  preferenciasValidas,
} from "./preferencias";

describe("preferências e nomes do perfil", () => {
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
