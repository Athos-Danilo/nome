import { test, expect } from "@playwright/test";
import { PADRAO } from "../src/funcionalidades/perfil/preferencias";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    (preferencias) =>
      localStorage.setItem(
        "decifra_preferencias",
        JSON.stringify(preferencias),
      ),
    { ...PADRAO, silenciado: true },
  );
  await page.route("**/api/**", (rota) =>
    rota.fulfill({
      status: 401,
      json: {
        erro: {
          codigo: "SESSAO_NECESSARIA",
          mensagem: "Entre para continuar.",
        },
      },
    }),
  );
});

test("menu não baixa módulos das partidas ou laboratório e navegação preserva foco", async ({
  page,
}) => {
  const modulos: string[] = [];
  page.on("request", (requisicao) =>
    modulos.push(new URL(requisicao.url()).pathname),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
  expect(
    modulos.filter((caminho) =>
      /\/(galera|individual)\/(PainelGalera|PainelIndividual|RotaGalera|RotaIndividual)\.tsx$|\/GaleriaAurelio\.tsx$/.test(
        caminho,
      ),
    ),
  ).toEqual([]);
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Como jogar" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Como jogar" })).toBeFocused();
  await page.getByRole("link", { name: "Voltar ao menu" }).click();
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeFocused();
});

test("menu e configurações funcionam sem fontes, sem som e com movimento reduzido", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/fontes/**", (rota) => rota.abort());
  const audios: string[] = [];
  page.on("request", (r) => {
    if (/\/audio\/.*\.(mp3|wav)$/.test(r.url())) audios.push(r.url());
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeFocused();
  expect(
    await page
      .locator("main")
      .evaluate(
        (e) =>
          e
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running").length,
      ),
  ).toBe(0);
  await page.getByLabel("Reduzir movimentos").check();
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await page.getByRole("link", { name: "Voltar ao menu" }).click();
  expect(audios).toEqual([]);
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
});

test("falha de módulo mantém navegação e permite recarregar a tela", async ({
  page,
}) => {
  await page.route("**/ConteudoConta.tsx*", (r) => r.abort());
  await page.goto("/configuracoes");
  await expect(
    page.getByRole("heading", { name: "Não foi possível preparar esta tela" }),
  ).toBeFocused();
  await page.unroute("**/ConteudoConta.tsx*");
  await page.getByRole("button", { name: "Recarregar tela" }).click();
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeFocused();
});

test("oito combinações de cores mantêm texto e ações contrastantes em tela estreita", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/configuracoes");
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeVisible();
  for (const paleta of ["original", "azul", "roxa", "grafite"])
    for (const tema of ["claro", "escuro"]) {
      await page.evaluate(
        ({ paleta, tema }) => {
          document.documentElement.dataset.paleta = paleta;
          document.documentElement.dataset.tema = tema;
        },
        { paleta, tema },
      );
      const contraste = await page.evaluate(() => {
        const cores = getComputedStyle(document.documentElement);
        function luminancia(cor: string) {
          const numeros = cor
            .trim()
            .replace("#", "")
            .match(/.{2}/g)!
            .map((n) => parseInt(n, 16) / 255)
            .map((n) =>
              n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4,
            );
          return (
            numeros[0] * 0.2126 + numeros[1] * 0.7152 + numeros[2] * 0.0722
          );
        }
        const texto = luminancia(cores.getPropertyValue("--texto")),
          fundo = luminancia(cores.getPropertyValue("--painel"));
        return (
          (Math.max(texto, fundo) + 0.05) / (Math.min(texto, fundo) + 0.05)
        );
      });
      expect(contraste).toBeGreaterThanOrEqual(4.5);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  await page.getByRole("button", { name: "Como jogar" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((e) => e.scrollWidth <= e.clientWidth),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await page.screenshot({
    path: `test-results/acabamento-320-${info.project.name}.png`,
    fullPage: true,
  });
});

test("texto ampliado e janela baixa mantêm controles e diálogo alcançáveis", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 720, height: 430 });
  await page.goto("/configuracoes");
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeVisible();
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await page
    .getByRole("button", { name: "Salvar preferências" })
    .scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Como jogar" }).click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible();
  await dialogo
    .getByRole("button", { name: "Entendi" })
    .scrollIntoViewIfNeeded();
  await dialogo.getByRole("button", { name: "Entendi" }).click();
  await expect(page.getByRole("button", { name: "Como jogar" })).toBeFocused();
  await page.screenshot({
    path: `test-results/acabamento-texto-ampliado-${info.project.name}.png`,
    fullPage: true,
  });
});
