import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (rota) =>
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

test("prévia produz sinal de áudio real e o silêncio geral zera a saída", async ({
  page,
}) => {
  // Entrega os bytes reais via transporte de teste: gerenciadores de download locais podem interceptar mídia no Edge.
  await page.route("**/audio/**", async (rota) =>
    rota.fulfill({ response: await rota.fetch() }),
  );
  await page.addInitScript(() => {
    const criar = AudioContext.prototype.createGain;
    const contextos = new WeakSet<AudioContext>();
    const janela = window as Window & { medidorDecifra?: AnalyserNode };
    AudioContext.prototype.createGain = function () {
      const ganho = criar.call(this);
      // O primeiro ganho criado pelo Howler é a saída mestre.
      if (!contextos.has(this)) {
        contextos.add(this);
        const medidor = this.createAnalyser();
        medidor.fftSize = 2048;
        ganho.connect(medidor);
        const saidaSilenciosa = criar.call(this);
        saidaSilenciosa.gain.value = 0;
        medidor.connect(saidaSilenciosa);
        saidaSilenciosa.connect(this.destination);
        janela.medidorDecifra = medidor;
      }
      return ganho;
    };
  });
  const medir = () =>
    page.evaluate(() => {
      const medidor = (window as Window & { medidorDecifra?: AnalyserNode })
        .medidorDecifra;
      if (!medidor) return 0;
      const amostras = new Float32Array(medidor.fftSize);
      medidor.getFloatTimeDomainData(amostras);
      return Math.sqrt(
        amostras.reduce((soma, valor) => soma + valor * valor, 0) /
          amostras.length,
      );
    });
  await page.goto("/configuracoes");
  await page.getByLabel("Volume de interface e teclado").fill("0");
  for (const faixa of [
    "lofi_01",
    "lofi_02",
    "lofi_03",
    "arcade_01",
    "arcade_02",
    "menu",
  ]) {
    if (faixa !== "menu")
      await page.getByLabel("Faixa preferida").selectOption(faixa);
    await page
      .getByRole("button", {
        name:
          faixa === "menu" ? "Ouvir trilha do menu" : "Ouvir faixa selecionada",
      })
      .click();
    await expect.poll(medir, { timeout: 10000 }).toBeGreaterThan(0.0001);
    await page.getByRole("button", { name: "Parar prévia" }).click();
    await expect.poll(medir).toBeLessThan(0.00001);
  }
  await page.getByRole("button", { name: "Ouvir trilha do menu" }).click();
  await expect.poll(medir, { timeout: 10000 }).toBeGreaterThan(0.0001);
  await page.getByLabel("Silenciar tudo").check();
  await expect.poll(medir).toBeLessThan(0.00001);
});

test("áudio só carrega depois do gesto e o botão do menu persiste sua própria escolha", async ({
  page,
}) => {
  const arquivos: string[] = [];
  page.on("request", (r) => {
    if (/\/audio\/.*\.(mp3|wav)$/.test(r.url())) arquivos.push(r.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
  expect(arquivos).toHaveLength(0);
  await page.getByRole("button", { name: "Desativar música do menu" }).click();
  await expect(
    page.getByRole("button", { name: "Ativar música do menu" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Ativar música do menu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ativar música do menu" }).click();
  await expect
    .poll(() => arquivos.some((url) => url.includes("menu.mp3")))
    .toBe(true);
  expect(arquivos.some((url) => url.includes("lofi_"))).toBe(false);
});

test("configurações apresentam seis prévias, grupos, silêncio e recuperação de arquivo indisponível", async ({
  page,
}, info) => {
  await page.goto("/configuracoes");
  await page.getByLabel("Faixa preferida").selectOption("lofi_02");
  await page.getByRole("button", { name: "Ouvir faixa selecionada" }).click();
  await expect(
    page.getByRole("button", { name: "Parar prévia" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Parar prévia" }).click();
  await page.getByLabel("Volume de interface e teclado").fill("0");
  await page.getByLabel("Silenciar tudo").check();
  await expect(
    page.getByRole("button", { name: "Ouvir faixa selecionada" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await page.reload();
  await expect(page.getByLabel("Silenciar tudo")).toBeChecked();
  await page.getByLabel("Silenciar tudo").uncheck();
  await page.getByLabel("Faixa preferida").selectOption("arcade_02");
  await page.route("**/audio/musicas/arcade_02.mp3", (r) =>
    r.fulfill({ status: 404, body: "indisponível" }),
  );
  await page.getByRole("button", { name: "Ouvir faixa selecionada" }).click();
  await expect(
    page.getByText(/Não foi possível reproduzir um áudio/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Salvar preferências" }),
  ).toBeEnabled();
  await page.screenshot({
    path: `test-results/audio-${info.project.name}.png`,
    fullPage: true,
  });
});
