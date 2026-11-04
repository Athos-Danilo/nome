import { expect, test } from "@playwright/test";
import { PADRAO } from "../src/funcionalidades/perfil/preferencias";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((padrao) => {
    if (!localStorage.getItem("decifra_preferencias"))
      localStorage.setItem(
        "decifra_preferencias",
        JSON.stringify({ ...padrao, silenciado: true }),
      );
  }, PADRAO);
  await page.route("**/api/**", (rota) => {
    if (new URL(rota.request().url()).pathname === "/api/visitantes")
      return rota.fulfill({
        json: {
          pode_iniciar: true,
          demonstracao_utilizada: false,
          vinculada: false,
          demonstracao: null,
          token_csrf: "visitante-de-teste",
        },
      });
    return rota.fulfill({
      status: 401,
      json: {
        erro: {
          codigo: "SESSAO_NECESSARIA",
          mensagem: "Entre para continuar.",
        },
      },
    });
  });
});

test("preferências persistem com ícones legíveis, teclado, silêncio e texto ampliado", async ({
  page,
}, info) => {
  const audios: string[] = [];
  page.on("request", (r) => {
    if (/\/audio\/.+\.(mp3|wav)$/.test(r.url())) audios.push(r.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Início", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  const tema = page.getByRole("button", { name: "Ativar tema escuro" });
  await expect(tema.locator("svg")).toHaveAttribute("aria-hidden", "true");
  await tema.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeFocused();
  await page.getByRole("radio", { name: "Roxa", exact: true }).check();
  await page.getByLabel("Reduzir movimentos").check();
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-paleta", "roxa");
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Roxa", exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Reduzir movimentos")).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await page.getByRole("button", { name: "Como jogar" }).focus();
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialogo.evaluate((e) => e.contains(document.activeElement)),
    ).toBe(true);
  }
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialogo.evaluate((e) => e.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Como jogar" })).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Salvar preferências" })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Salvar preferências" }),
  ).toBeInViewport();
  expect(audios).toEqual([]);
  await page.screenshot({
    path: info.outputPath("configuracoes-ampliadas.png"),
    fullPage: true,
    animations: "disabled",
  });
});

test("mede carregamento e animação do menu compilado sem módulos de partida", async ({
  page,
}, info) => {
  const sessao = await page.context().newCDPSession(page);
  await sessao.send("Network.enable");
  await sessao.send("Network.setCacheDisabled", { cacheDisabled: true });
  const limitado = info.project.name === "celular";
  if (limitado) {
    await sessao.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await sessao.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 1600000 / 8,
      uploadThroughput: 750000 / 8,
    });
  }
  const navegacao = Date.now();
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible({ timeout: 30000 });
  const prontoMs = Date.now() - navegacao;
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () => {
      const imagens = new Set(
        Array.from(
          document.querySelectorAll("svg image"),
          (e) => new URL(e.getAttribute("href") ?? "", location.href).pathname,
        ),
      );
      const concluidos = new Set(
        performance
          .getEntriesByType("resource")
          .map((e) => new URL(e.name).pathname),
      );
      return (
        imagens.size > 0 &&
        [...imagens].every((imagem) => concluidos.has(imagem))
      );
    },
    undefined,
    { timeout: 30000 },
  );
  const arteProntaMs = Date.now() - navegacao;
  // Janela de observação, não uma espera para tornar o teste funcionalmente pronto.
  const quadros = await page.evaluate(
    () =>
      new Promise<number[]>((resolver) => {
        const diferencas: number[] = [];
        let anterior = performance.now();
        const inicio = anterior;
        function medir(agora: number) {
          diferencas.push(agora - anterior);
          anterior = agora;
          if (agora - inicio >= 1500) resolver(diferencas);
          else requestAnimationFrame(medir);
        }
        requestAnimationFrame(medir);
      }),
  );
  const recursos = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entrada) => {
      const recurso = entrada as PerformanceResourceTiming;
      return {
        caminho: new URL(recurso.name).pathname,
        bytes: recurso.decodedBodySize,
        duracaoMs: recurso.duration,
      };
    }),
  );
  const js = recursos.filter((r) => r.caminho.endsWith(".js"));
  const bytesJs = js.reduce((soma, r) => soma + r.bytes, 0);
  expect(bytesJs).toBeLessThanOrEqual(500 * 1024);
  expect(
    js.some((r) => /RotaIndividual|RotaGalera|GaleriaAurelio/.test(r.caminho)),
  ).toBe(false);
  expect(recursos.some((r) => /\/audio\/.+\.(mp3|wav)$/.test(r.caminho))).toBe(
    false,
  );
  const ordenados = [...quadros].sort((a, b) => a - b);
  const medicoes = {
    projeto: info.project.name,
    ambiente: limitado
      ? "CPU 4x, rede 1,6 Mbps/750 kbps, latência 150 ms"
      : "CPU e rede locais, cache desativado",
    prontoMs,
    arteProntaMs,
    bytesJs,
    bytesFontes: recursos
      .filter((r) => /\/fontes\//.test(r.caminho))
      .reduce((soma, r) => soma + r.bytes, 0),
    quadros: quadros.length,
    intervaloP95Ms: ordenados[Math.floor(ordenados.length * 0.95)],
    intervaloMaximoMs: Math.max(...quadros),
    recursos,
  };
  await info.attach("medicoes-menu", {
    body: JSON.stringify(medicoes, null, 2),
    contentType: "application/json",
  });
  console.log(JSON.stringify(medicoes));
  await page.screenshot({
    path: info.outputPath("menu.png"),
    fullPage: true,
    animations: "disabled",
  });
  await sessao.detach();
});
