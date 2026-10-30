import { expect, test, type Page } from "@playwright/test";
async function visitante(page: Page) {
  await page.route("**/api/**", async (r) => {
    const caminho = new URL(r.request().url()).pathname;
    if (caminho === "/api/visitantes")
      return r.fulfill({
        json: {
          demonstracao_utilizada: false,
          pode_iniciar: true,
          vinculada: false,
          demonstracao: null,
          token_csrf: "visitante",
        },
      });
    return r.fulfill({
      status: 401,
      json: {
        erro: {
          codigo: "SESSAO_NECESSARIA",
          mensagem: "Entre para continuar.",
        },
      },
    });
  });
}
test("galeria apresenta todas as reações, comparação e repetição", async ({
  page,
}, info) => {
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  await expect(
    page.getByRole("heading", { name: "O Aurélio ganhou vida." }),
  ).toBeVisible();
  const personagem = page.locator(".aurelio-animado");
  for (const [nome, tipo] of [
    ["Saudação", "saudacao"],
    ["Pensamento", "pensamento"],
    ["Apresentar dica", "apresentacao"],
    ["Erro", "erro"],
    ["Comemoração", "comemoracao"],
    ["Mudança de turno", "turno"],
    ["Sorteio", "sorteio"],
    ["Resultado", "resultado"],
    ["Espera", "espera"],
  ]) {
    await page.getByRole("button", { name: nome, exact: true }).click();
    await expect(personagem).toHaveAttribute("data-reacao", tipo);
  }
  expect(await page.locator("[data-parte='corpo_capa']").count()).toBe(1);
  await expect(
    page.getByRole("img", { name: "Referência aprovada do Aurélio" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Comemoração", exact: true }).click();
  await page.getByRole("button", { name: "Repetir reação" }).click();
  await expect(personagem).toHaveAttribute("data-reacao", "comemoracao");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/aurelio-galeria-${info.project.name}.png`,
    fullPage: true,
  });
});
test("redução de movimentos e pausa mantêm expressão sem animação contínua", async ({
  page,
}) => {
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  await page.getByLabel("Prévia com movimentos reduzidos").check();
  await page.getByRole("button", { name: "Erro", exact: true }).click();
  const personagem = page.locator(".aurelio-animado");
  await expect(personagem).toHaveAttribute("data-estatico", "true");
  const antes = await personagem
    .locator("[data-parte='corpo_inteiro']")
    .getAttribute("style");
  await page.waitForTimeout(120);
  expect(
    await personagem
      .locator("[data-parte='corpo_inteiro']")
      .getAttribute("style"),
  ).toBe(antes);
  await page.getByLabel("Prévia com movimentos reduzidos").uncheck();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(personagem).toHaveAttribute("data-estatico", "true");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "Pausar movimentos" }).click();
  await expect(personagem).toHaveAttribute("data-estatico", "true");
});
test("menu mantém Aurélio em camadas e navegação liberada", async ({
  page,
}) => {
  await visitante(page);
  await page.goto("/");
  await expect(page.locator(".palco-menu .aurelio-animado")).toBeVisible();
  await page.getByRole("button", { name: "Como jogar" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Como jogar" })).toBeFocused();
});

test("reação nova movimenta as partes depois que o personagem já está visível", async ({
  page,
}) => {
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  await expect(page.locator(".aurelio-animado")).toHaveAttribute(
    "data-estatico",
    "false",
  );
  await page.getByRole("button", { name: "Erro", exact: true }).click();
  const corpo = page.locator("[data-parte='corpo_inteiro']");
  await page.locator(".aurelio-animado").scrollIntoViewIfNeeded();
  await expect(page.locator(".aurelio-animado")).toHaveAttribute(
    "data-estatico",
    "false",
  );
  const antes = await corpo.getAttribute("style");
  await page.waitForTimeout(180);
  expect(await corpo.getAttribute("style")).not.toBe(antes);
});
