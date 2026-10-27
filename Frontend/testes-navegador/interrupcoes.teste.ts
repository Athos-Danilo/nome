import { expect, test } from "@playwright/test";

const caminho = "/provas/interrupcoes.html";

test.beforeEach(async ({ page }) => {
  await page.goto(caminho);
  await page
    .getByRole("button", { name: "Nova individual", exact: true })
    .click();
  await expect(page.locator("#conexao")).toContainText("Servidor confirmou");
});

test("recarga normal preserva aba e não desconta", async ({ page }) => {
  const aba = await page.evaluate(() =>
    sessionStorage.getItem("decifra_prova_aba"),
  );
  await page.reload();
  await expect(page.locator("#classificacao")).toHaveText("recarga_declarada");
  expect(
    await page.evaluate(() => sessionStorage.getItem("decifra_prova_aba")),
  ).toBe(aba);
  await expect(page.locator("#saldo")).toHaveText("300");
});

test("recarga forçada sem cache preserva pontuação", async ({
  page,
  context,
}) => {
  const sessao = await context.newCDPSession(page);
  await sessao.send("Page.reload", { ignoreCache: true });
  await expect(page.locator("#classificacao")).toHaveText("recarga_declarada");
  await expect(page.locator("#saldo")).toHaveText("300");
});

test("pausa confirmada e reenvio após recarga descontam só uma vez", async ({
  page,
}) => {
  page.once("dialog", (dialogo) => dialogo.accept());
  await page.getByRole("button", { name: "Simular pausa" }).click();
  await expect(page.locator("#saldo")).toHaveText("200");
  await page.reload();
  await expect(page.locator("#classificacao")).toHaveText(
    "retorno_com_pausa_confirmada",
  );
  await page.getByRole("button", { name: "Reenviar última ação" }).click();
  await expect(page.locator("#saldo")).toHaveText("200");
  await expect(page.locator("#pausas")).toHaveText("1");
});

test("cancelar pausa não modifica saldo", async ({ page }) => {
  page.once("dialog", (dialogo) => dialogo.dismiss());
  await page.getByRole("button", { name: "Simular pausa" }).click();
  await expect(page.locator("#saldo")).toHaveText("300");
  await expect(page.locator("#pausas")).toHaveText("0");
});

test("fechar aba e abrir outra registra ambiguidade", async ({
  page,
  context,
}) => {
  const aba = await page.evaluate(() =>
    sessionStorage.getItem("decifra_prova_aba"),
  );
  await page.close();
  const outra = await context.newPage();
  await outra.goto(caminho);
  await expect(outra.locator("#classificacao")).toHaveText("retorno_ambiguo");
  expect(
    await outra.evaluate(() => sessionStorage.getItem("decifra_prova_aba")),
  ).not.toBe(aba);
  await expect(outra.locator("#saldo")).toHaveText("300");
});

test("offline e reconexão não provocam desconto automático", async ({
  page,
  context,
}) => {
  await context.setOffline(true);
  await expect(page.locator("#conexao")).toContainText("sem rede");
  await context.setOffline(false);
  await expect(page.locator("#conexao")).toContainText("Servidor confirmou");
  await expect(page.locator("#saldo")).toHaveText("300");
});

test("sair e voltar pelo histórico mantém uma única pausa", async ({
  page,
}) => {
  page.once("dialog", (dialogo) => dialogo.accept());
  await page.getByRole("link", { name: "Ir para outra página" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5175/");
  await page.goBack();
  await expect(page.locator("#conexao")).toContainText("Servidor confirmou");
  await expect(page.locator("#saldo")).toHaveText("200");
  await expect(page.locator("#pausas")).toHaveText("1");
  await expect(page.locator("#classificacao")).toHaveText(
    /retorno_com_pausa_confirmada|pausa_confirmada|saida_pelo_historico/,
  );
});

test("saída para outra página encerra galera mesmo voltando", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Nova galera", exact: true }).click();
  await expect(page.locator("#conexao")).toContainText("galera");
  page.once("dialog", (dialogo) => dialogo.accept());
  await page.getByRole("link", { name: "Ir para outra página" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:5175/");
  await page.goBack();
  await expect(page.locator("#conexao")).toContainText("encerrada");
  await expect(page.locator("#saldo")).toHaveText("300");
  await expect(
    page.getByRole("button", { name: "Retomar simulação" }),
  ).toBeDisabled();
});

test("galera recupera recarga e não permite pausa", async ({ page }) => {
  await page.getByRole("button", { name: "Nova galera", exact: true }).click();
  await expect(page.locator("#conexao")).toContainText("galera");
  await page.reload();
  await expect(page.locator("#classificacao")).toHaveText("recarga_declarada");
  await expect(
    page.getByRole("button", { name: "Simular pausa" }),
  ).toBeDisabled();
  await expect(page.locator("#saldo")).toHaveText("300");
});

test("layout cabe na tela e registra evidência visual", async ({
  page,
}, informacoes) => {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: informacoes.outputPath("prova.png"),
    fullPage: true,
  });
});
