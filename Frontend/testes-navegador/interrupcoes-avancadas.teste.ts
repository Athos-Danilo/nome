import { chromium, expect, test } from "@playwright/test";
import type { BrowserContext } from "@playwright/test";
import { lerEstado } from "../src/provas/interrupcoes/estado";

const endereco = "http://127.0.0.1:5175/provas/interrupcoes.html";

test("encerrar processo de navegador e abrir outro não revela a causa ao servidor", async () => {
  const canal = process.env.DECIFRA_CANAL_NAVEGADOR ?? "msedge";
  const primeiro = await chromium.launch({ channel: canal });
  let armazenamento:
    Awaited<ReturnType<BrowserContext["storageState"]>> | undefined;
  let abaOriginal: string | null = null;
  try {
    const contexto = await primeiro.newContext();
    const pagina = await contexto.newPage();
    await pagina.goto(endereco);
    await pagina
      .getByRole("button", { name: "Nova individual", exact: true })
      .click();
    await expect(pagina.locator("#conexao")).toContainText(
      "Servidor confirmou",
    );
    abaOriginal = await pagina.evaluate(() =>
      sessionStorage.getItem("decifra_prova_aba"),
    );
    armazenamento = await contexto.storageState();
  } finally {
    await primeiro.close();
  }
  const segundo = await chromium.launch({ channel: canal });
  try {
    const contexto = await segundo.newContext({ storageState: armazenamento });
    const pagina = await contexto.newPage();
    await pagina.goto(endereco);
    await expect(pagina.locator("#classificacao")).toHaveText(
      "retorno_ambiguo",
    );
    expect(
      await pagina.evaluate(() => sessionStorage.getItem("decifra_prova_aba")),
    ).not.toBe(abaOriginal);
    await expect(pagina.locator("#saldo")).toHaveText("300");
  } finally {
    await segundo.close();
  }
});

test("suspender temporizadores por mais de dez segundos gera ausência sem inventar fechamento", async ({
  page,
  request,
}) => {
  await page.clock.install();
  await page.goto(endereco);
  await page.getByRole("button", { name: "Nova galera", exact: true }).click();
  await expect(page.locator("#conexao")).toContainText("Servidor confirmou");
  const identificador = await page.evaluate(() =>
    localStorage.getItem("decifra_prova_id"),
  );
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  try {
    await expect
      .poll(
        async () => {
          const resposta = await request.get(
            `/prova-api/experimentos/${identificador}`,
          );
          return lerEstado(await resposta.json()).classificacao;
        },
        { timeout: 15000, intervals: [1000] },
      )
      .toBe("em_apuracao");
  } finally {
    await page.clock.resume();
  }
  await expect(page.locator("#classificacao")).toHaveText("em_apuracao", {
    timeout: 7000,
  });
  await expect(page.locator("#saldo")).toHaveText("300");
});
