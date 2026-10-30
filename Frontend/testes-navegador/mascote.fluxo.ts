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
test("saudação preserva o PNG aprovado na montagem parada", async ({
  page,
}, info) => {
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  await expect(
    page.getByRole("heading", { name: "O mesmo Aurélio. Uma nova saudação." }),
  ).toBeVisible();
  await page.waitForLoadState("networkidle");
  const montagem = page.locator(".ensaio-montagem svg"),
    referencia = page.locator(".ensaio-referencia img");
  await expect(montagem).toHaveAttribute("data-arte", "png-aprovado");
  const estilo =
    ".ensaio-montagem svg,.ensaio-referencia img{background:#f5efd9!important}";
  const a = (await montagem.screenshot({ style: estilo })).toString("base64");
  // Comparar na mesma posição física evita diferença de amostragem subpixel entre colunas.
  const limites = await montagem.boundingBox();
  expect(limites).not.toBeNull();
  const estiloAnterior = await referencia.getAttribute("style");
  await referencia.evaluate((elemento, quadro) => {
    if (!quadro) throw new Error("Montagem sem área visível.");
    Object.assign(elemento.style, {
      position: "fixed",
      left: `${quadro.x}px`,
      top: `${quadro.y}px`,
      width: `${quadro.width}px`,
      height: `${quadro.height}px`,
      maxWidth: "none",
      zIndex: "100",
    });
  }, limites);
  const b = (await referencia.screenshot({ style: estilo })).toString("base64");
  await referencia.evaluate((elemento, anterior) => {
    if (anterior === null) elemento.removeAttribute("style");
    else elemento.setAttribute("style", anterior);
  }, estiloAnterior);
  const diferenca = await page.evaluate(
    async ({ a, b }) => {
      async function pixels(texto: string) {
        const imagem = new Image();
        imagem.src = "data:image/png;base64," + texto;
        await imagem.decode();
        const quadro = document.createElement("canvas");
        quadro.width = imagem.width;
        quadro.height = imagem.height;
        const contexto = quadro.getContext("2d")!;
        contexto.drawImage(imagem, 0, 0);
        return {
          dados: contexto.getImageData(0, 0, quadro.width, quadro.height).data,
          largura: quadro.width,
          altura: quadro.height,
        };
      }
      const x = await pixels(a),
        y = await pixels(b);
      if (x.largura !== y.largura || x.altura !== y.altura) return 1;
      let diferentes = 0;
      // SVG e img podem suavizar a borda em pixels vizinhos; tolerar só um pixel,
      // mantendo o limite de cor e sem aceitar mudanças maiores da silhueta.
      for (let i = 0; i < x.dados.length; i += 4) {
        const px = (i / 4) % x.largura,
          py = Math.floor(i / 4 / x.largura);
        let corresponde = false;
        for (let dy = -1; dy <= 1 && !corresponde; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const cx = px + dx,
              cy = py + dy;
            if (cx < 0 || cx >= y.largura || cy < 0 || cy >= y.altura) continue;
            const j = (cy * y.largura + cx) * 4;
            if (
              [0, 1, 2].every(
                (c) => Math.abs(x.dados[i + c] - y.dados[j + c]) <= 40,
              )
            ) {
              corresponde = true;
              break;
            }
          }
        if (!corresponde) diferentes++;
      }
      return diferentes / (x.dados.length / 4);
    },
    { a, b },
  );
  expect(diferenca).toBeLessThan(0.02);
  await page.screenshot({
    path: `test-results/saudacao-fidelidade-${info.project.name}.png`,
    fullPage: true,
  });
});

test("ensaio permite examinar pupilas, articulações e fim do aceno sem repetir", async ({
  page,
}, info) => {
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  const tempo = page.getByLabel("Instante da saudação");
  await tempo.fill("1350");
  const desenho = page.locator(".ensaio-montagem svg");
  await expect(desenho).toHaveAttribute("data-tempo", "1350");
  await expect(
    desenho.locator("[data-parte='punho_direito']"),
  ).not.toHaveAttribute("transform", "rotate(0 977 559)");
  await expect(desenho.locator("[data-parte='pupila_esquerdo']")).toBeVisible();
  await page.getByLabel("Mostrar recortes e articulações").check();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/saudacao-articulacoes-${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Reproduzir saudação", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pausar saudação", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Saudação concluída", { exact: true }),
  ).toBeVisible({ timeout: 8000 });
  await expect(desenho).toHaveAttribute("data-tempo", "5400");
  await page.waitForTimeout(200);
  await expect(desenho).toHaveAttribute("data-tempo", "5400");
});

test("movimentos reduzidos mantêm a arte original e o menu funciona", async ({
  page,
}) => {
  await visitante(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/laboratorio/aurelio");
  await page
    .getByRole("button", { name: "Reproduzir saudação", exact: true })
    .click();
  await expect(page.locator(".ensaio-montagem svg")).toHaveAttribute(
    "data-tempo",
    "0",
  );
  await page.getByLabel("Instante da saudação").fill("1350");
  await expect(page.locator(".ensaio-montagem svg")).toHaveAttribute(
    "data-tempo",
    "1350",
  );
  await page.goto("/");
  await expect(page.locator(".palco-menu .aurelio-animado")).toBeVisible();
  await page.getByRole("button", { name: "Como jogar" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
