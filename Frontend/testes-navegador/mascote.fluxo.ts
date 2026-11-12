import { expect, test, type Page } from "@playwright/test";
import { GESTOS_MENU } from "../src/funcionalidades/mascote/gestos-menu";
import { duracaoAtuacao } from "../src/funcionalidades/mascote/atuacao-visual";
import { REPERTORIO_GESTOS } from "../src/funcionalidades/mascote/repertorio-gestos-menu";
import { DURACOES, REACOES } from "../src/funcionalidades/mascote/reacoes";
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

test("MD-08 laboratório oferece cinco gestos com inspeção de extremos e retorno neutro", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  const desenho = page.locator(".ensaio-montagem svg");
  await expect(
    page.getByRole("group", { name: "Surpresas do menu" }).getByRole("button"),
  ).toHaveCount(5);
  await page.evaluate(() => document.fonts.ready);
  for (const gesto of GESTOS_MENU) {
    await page
      .getByRole("button", { name: REPERTORIO_GESTOS[gesto].nome, exact: true })
      .click();
    await expect(desenho).toHaveAttribute("data-atuacao", gesto);
    const inicio = await desenho
      .locator('[data-parte="personagem"]')
      .getAttribute("transform");
    for (const fracao of [0.15, 0.3, 0.4, 0.55, 0.62, 0.8]) {
      const instante = Math.round((duracaoAtuacao(gesto) * fracao) / 10) * 10;
      await page.getByRole("slider").fill(String(instante));
      await expect(desenho).toHaveAttribute("data-tempo", String(instante));
      await desenho.screenshot({
        path: info.outputPath(`${gesto}-${fracao}.png`),
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.getByRole("slider").fill(String(duracaoAtuacao(gesto)));
    await expect(desenho.locator('[data-parte="personagem"]')).toHaveAttribute(
      "transform",
      inicio!,
    );
    await page
      .getByRole("button", { name: "Voltar à pose original", exact: true })
      .click();
    await expect(desenho).toHaveAttribute("data-tempo", "0");
  }
});

test("MD-08 grava as cinco atuações em movimento real sem acelerar relógio", async ({
  browser,
}, info) => {
  test.setTimeout(90000);
  const contexto = await browser.newContext({
    baseURL: "http://127.0.0.1:5181",
    viewport: info.project.use.viewport,
    isMobile: info.project.name === "celular",
    hasTouch: info.project.name !== "computador",
    reducedMotion: "no-preference",
    recordVideo: { dir: info.outputPath("video") },
  });
  const pagina = await contexto.newPage();
  try {
    await visitante(pagina);
    await pagina.goto("/laboratorio/aurelio");
    const desenho = pagina.locator(".ensaio-montagem svg");
    await pagina.evaluate(() => document.fonts.ready);
    for (const gesto of GESTOS_MENU) {
      await pagina
        .getByRole("button", {
          name: REPERTORIO_GESTOS[gesto].nome,
          exact: true,
        })
        .click();
      await pagina
        .getByRole("button", {
          name: `Reproduzir ${REPERTORIO_GESTOS[gesto].controle}`,
          exact: true,
        })
        .click();
      await desenho.scrollIntoViewIfNeeded();
      await expect
        .poll(async () => Number(await desenho.getAttribute("data-tempo")), {
          timeout: 7000,
        })
        .toBeGreaterThanOrEqual(duracaoAtuacao(gesto) * 0.4);
      await pagina.screenshot({
        path: info.outputPath(`movimento-${gesto}.png`),
        fullPage: true,
      });
      await expect(desenho).toHaveAttribute(
        "data-tempo",
        String(duracaoAtuacao(gesto)),
        { timeout: 7000 },
      );
      expect(
        await pagina.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  } finally {
    await contexto.close();
  }
});
test("definições fixas preservam máscaras e referências exclusivas entre poses e personagens", async ({
  page,
}) => {
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  const montagem = page.locator(".ensaio-montagem svg");
  await expect(montagem).toHaveAttribute("data-tempo", "0");
  const antes = await montagem.locator("defs").innerHTML();
  const corpo = await montagem
    .locator('[data-parte="corpo_inteiro"]')
    .getAttribute("transform");
  await page.getByRole("slider").fill("2070");
  await expect(montagem).toHaveAttribute("data-tempo", "2070");
  expect(await montagem.locator("defs").innerHTML()).toBe(antes);
  expect(
    await montagem
      .locator('[data-parte="corpo_inteiro"]')
      .getAttribute("transform"),
  ).not.toBe(corpo);
  const referencias = await page
    .locator("svg.recorte-aurelio")
    .evaluateAll((desenhos) => {
      const todos = desenhos.flatMap((desenho) =>
        Array.from(desenho.querySelectorAll("defs [id]"), (el) => el.id),
      );
      const ausentes = desenhos.flatMap((desenho) => {
        const locais = new Set(
          Array.from(desenho.querySelectorAll("defs [id]"), (el) => el.id),
        );
        return Array.from(desenho.querySelectorAll("*")).flatMap((el) =>
          Array.from(el.attributes).flatMap(({ value }) => {
            const id = value.startsWith("url(#")
              ? value.slice(5, -1)
              : value.startsWith("#") && el.tagName === "use"
                ? value.slice(1)
                : null;
            return id && !locais.has(id) ? [id] : [];
          }),
        );
      });
      return { todos, ausentes };
    });
  expect(referencias.todos.length).toBeGreaterThan(20);
  expect(new Set(referencias.todos).size).toBe(referencias.todos.length);
  expect(referencias.ausentes).toEqual([]);
});
test("saudação preserva o PNG aprovado na montagem parada", async ({
  page,
}, info) => {
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  await expect(
    page.getByRole("heading", { name: "Aurélio em cena." }),
  ).toBeVisible();
  await page.waitForLoadState("networkidle");
  const montagem = page.locator(".ensaio-montagem svg"),
    referencia = page.locator(".ensaio-referencia img");
  await expect(montagem).toHaveAttribute("data-arte", "png-aprovado");
  // Comparar a arte, não a navegação fixa que pode cobrir só uma das capturas.
  const estilo =
    ".ensaio-montagem svg,.ensaio-referencia img{background:#f5efd9!important}.dock-jogo{visibility:hidden!important}";
  const a = (
    await montagem.screenshot({
      style: estilo,
      path: info.outputPath("montagem-comparada.png"),
    })
  ).toString("base64");
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
  const b = (
    await referencia.screenshot({
      style: estilo,
      path: info.outputPath("referencia-comparada.png"),
    })
  ).toString("base64");
  await info.attach("montagem-comparada", {
    body: Buffer.from(a, "base64"),
    contentType: "image/png",
  });
  await info.attach("referencia-comparada", {
    body: Buffer.from(b, "base64"),
    contentType: "image/png",
  });
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

test("repertório permite selecionar, examinar e pausar cada atuação sem perder a saudação", async ({
  page,
}, info) => {
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  const desenho = page.locator(".ensaio-montagem svg");
  for (const [nome, tipo] of [
    ["Espera", "espera"],
    ["Pensamento", "pensamento"],
    ["Apresentação de dica", "apresentacao"],
    ["Erro", "erro"],
    ["Comemoração", "comemoracao"],
    ["Passagem de vez", "turno"],
    ["Sorteio", "sorteio"],
    ["Resultado", "resultado"],
  ]) {
    await page.getByRole("button", { name: nome, exact: true }).click();
    await expect(desenho).toHaveAttribute("data-atuacao", tipo);
    const controle = page.getByRole("slider");
    const duracao = Number(await controle.getAttribute("max"));
    await controle.fill(String(Math.round((duracao * 0.4) / 10) * 10));
    await expect(
      desenho.locator("[data-parte='corpo_inteiro']"),
    ).not.toHaveAttribute(
      "transform",
      "translate(0 0) rotate(0 554 940) translate(0 940) scale(1 1) translate(0 -940)",
    );
    await desenho.screenshot({
      path: `test-results/aurelio-${tipo}-${info.project.name}.png`,
    });
  }
  await page
    .getByRole("button", { name: "Reproduzir resultado", exact: true })
    .click();
  await expect
    .poll(async () => Number(await desenho.getAttribute("data-tempo")))
    .toBeGreaterThan(100);
  await page
    .getByRole("button", { name: "Pausar resultado", exact: true })
    .click();
  const parado = await desenho.getAttribute("data-tempo");
  await page.waitForTimeout(150);
  await expect(desenho).toHaveAttribute("data-tempo", parado!);
  await page.getByRole("button", { name: "Saudação", exact: true }).click();
  await expect(desenho).toHaveAttribute("data-atuacao", "saudacao");
  await expect(desenho).toHaveAttribute("data-tempo", "0");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
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

test("piscada da comemoração apaga o contorno dos olhos abertos", async ({
  page,
}) => {
  await visitante(page);
  await page.goto("/laboratorio/aurelio");
  await page.getByRole("button", { name: "Comemoração", exact: true }).click();
  await page.getByRole("slider").fill("1400");
  const desenho = page.locator(".ensaio-montagem svg");
  await desenho.evaluate((elemento) =>
    Object.assign(elemento.style, {
      position: "fixed",
      left: "0",
      top: "0",
      zIndex: "1000",
      pointerEvents: "none",
      width: "1158px",
      height: "1359px",
      maxWidth: "none",
      background: "#ff00ff",
    }),
  );
  const captura = (await desenho.screenshot()).toString("base64");
  const residuos = await desenho.evaluate(async (elemento, png) => {
    const imagem = new Image();
    imagem.src = "data:image/png;base64," + png;
    await imagem.decode();
    const tela = document.createElement("canvas");
    tela.width = 1158;
    tela.height = 1359;
    const contexto = tela.getContext("2d")!;
    contexto.drawImage(imagem, 0, 0);
    const dados = contexto.getImageData(0, 0, 1158, 1359).data;
    const matriz = elemento
      .querySelector<SVGGElement>("[data-parte='rosto']")!
      .getCTM()!;
    let escuros = 0;
    for (const [olho, x0, y0, x1, y1, centro] of [
      ["esquerdo", 438, 350, 577, 553, 454],
      ["direito", 602, 288, 727, 498, 394],
    ] as const) {
      const caminho = elemento
        .querySelector(`clipPath[id$='contorno-${olho}'] path`)!
        .getAttribute("d")!;
      const contorno = new Path2D(caminho);
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) {
          if (
            Math.abs(y - centro) < 18 ||
            !contexto.isPointInPath(contorno, x, y)
          )
            continue;
          const ponto = new DOMPoint(x, y).matrixTransform(matriz);
          const i = (Math.round(ponto.y) * 1158 + Math.round(ponto.x)) * 4;
          if (dados[i] < 55 && dados[i + 1] < 55 && dados[i + 2] < 55)
            escuros++;
        }
    }
    return escuros;
  }, captura);
  expect(residuos).toBeLessThan(10);
});

test("repouso se repete no jogo e a preferência interrompe o movimento", async ({
  page,
}) => {
  await visitante(page);
  await page.clock.install();
  await page.goto("/");
  const mascote = page.locator(".palco-menu .aurelio-animado");
  await expect(mascote).toHaveAttribute("data-estatico", "false");
  await page.clock.runFor(5500);
  await expect(mascote).toHaveAttribute("data-reacao", "espera");
  await page.clock.runFor(100);
  await page.clock.runFor(6500);
  const tempo = Number(await mascote.locator("svg").getAttribute("data-tempo"));
  expect(tempo).toBeGreaterThan(0);
  expect(tempo).toBeLessThan(DURACOES.espera);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(mascote).toHaveAttribute("data-estatico", "true");
  await expect(mascote.locator("svg")).toHaveAttribute("data-tempo", "0");
});

for (const atuacao of [...REACOES, ...GESTOS_MENU]) {
  test(`encaixes e olhos preservados nas poses de ${atuacao}`, async ({
    page,
  }) => {
    await visitante(page);
    await page.goto("/laboratorio/aurelio");
    const nomes = {
      espera: "Espera",
      saudacao: "Saudação",
      pensamento: "Pensamento",
      apresentacao: "Apresentação de dica",
      erro: "Erro",
      comemoracao: "Comemoração",
      turno: "Passagem de vez",
      sorteio: "Sorteio",
      resultado: "Resultado",
      olhar_solo: "Olhar para o Solo",
      olhar_galera: "Olhar para a Galera",
      ajeitar_gravata: "Ajeitar a gravata",
      seguir_letra: "Seguir a letra",
      reagir_toque: "Reagir ao toque",
    };
    await page
      .getByRole("button", { name: nomes[atuacao], exact: true })
      .click();
    const desenho = page.locator(".ensaio-montagem svg");
    await desenho.evaluate((elemento) =>
      Object.assign(elemento.style, {
        position: "fixed",
        left: "0",
        top: "0",
        zIndex: "1000",
        pointerEvents: "none",
        width: "1158px",
        height: "1359px",
        maxWidth: "none",
        background: "#ff00ff",
      }),
    );
    const instantes =
      atuacao === "saudacao"
        ? [0, 350, 750, 1350, 2070, 3400, 5400]
        : [0.12, 0.4, 0.7].map(
            (fracao) =>
              Math.round((duracaoAtuacao(atuacao) * fracao) / 10) * 10,
          );
    for (const tempo of instantes) {
      await page.getByRole("slider").fill(String(tempo));
      await expect(desenho).toHaveAttribute("data-tempo", String(tempo));
      const png = (await desenho.screenshot()).toString("base64");
      const defeitos = await desenho.evaluate(async (elemento, imagem) => {
        const foto = new Image();
        foto.src = "data:image/png;base64," + imagem;
        await foto.decode();
        const original = new Image();
        original.src = "/mascote/aurelio.png";
        await original.decode();
        const quadro = document.createElement("canvas");
        quadro.width = 1158;
        quadro.height = 1359;
        const contexto = quadro.getContext("2d")!;
        contexto.drawImage(foto, 0, 0);
        const atual = contexto.getImageData(0, 0, 1158, 1359).data;
        contexto.clearRect(0, 0, 1158, 1359);
        contexto.drawImage(original, 0, 0);
        const fonte = contexto.getImageData(0, 0, 1158, 1359).data;
        const claro = (x: number, y: number) => {
          const i = (y * 1158 + x) * 4;
          return (
            fonte[i + 3] > 240 &&
            fonte[i] > 180 &&
            fonte[i + 1] > 165 &&
            fonte[i + 2] > 110
          );
        };
        const vazios: Record<string, number> = {};
        for (const [nome, parte, area] of [
          ["luva", "punho_direito", [905, 350, 253, 255]],
          ["tornozelo_esquerdo", "perna_esquerda", [265, 1085, 140, 80]],
          ["tornozelo_direito", "perna_direita", [520, 1060, 170, 90]],
        ] as const) {
          const grupo = elemento.querySelector<SVGGElement>(
            `[data-parte='${parte}']`,
          )!;
          const matriz = grupo.getCTM()!;
          let faltantes = 0;
          for (let y = area[1]; y < area[1] + area[3]; y++)
            for (let x = area[0]; x < area[0] + area[2]; x++) {
              if (
                !claro(x, y) ||
                !claro(x - 2, y) ||
                !claro(x + 2, y) ||
                !claro(x, y - 2) ||
                !claro(x, y + 2)
              )
                continue;
              const ponto = new DOMPoint(x, y).matrixTransform(matriz);
              let coberto = false;
              for (let dy = -1; dy <= 1 && !coberto; dy++)
                for (let dx = -1; dx <= 1; dx++) {
                  const j =
                    ((Math.round(ponto.y) + dy) * 1158 +
                      Math.round(ponto.x) +
                      dx) *
                    4;
                  if (
                    j >= 0 &&
                    j < atual.length &&
                    !(atual[j] > 230 && atual[j + 1] < 40 && atual[j + 2] > 230)
                  ) {
                    coberto = true;
                    break;
                  }
                }
              if (!coberto) faltantes++;
            }
          vazios[nome] = faltantes;
        }
        const matriz = elemento
          .querySelector<SVGGElement>("[data-parte='rosto']")!
          .getCTM()!;
        let ovalClaro = 0;
        for (const [x0, y0, x1, y1] of [
          [425, 380, 585, 500],
          [590, 315, 740, 485],
        ])
          for (let y = y0; y < y1; y++) {
            let esquerda = x1,
              direita = x0;
            for (let x = x0; x < x1; x++) {
              const i = (y * 1158 + x) * 4;
              if (
                fonte[i + 3] > 150 &&
                fonte[i] < 55 &&
                fonte[i + 1] < 55 &&
                fonte[i + 2] < 55
              ) {
                esquerda = Math.min(esquerda, x);
                direita = Math.max(direita, x);
              }
            }
            if (direita <= esquerda) continue;
            for (let x = x0; x < x1; x++) {
              if (x >= esquerda - 3 && x <= direita + 3) continue;
              const i = (y * 1158 + x) * 4;
              if (
                fonte[i + 3] < 200 ||
                fonte[i] < 65 ||
                fonte[i] > 155 ||
                fonte[i + 1] > 155
              )
                continue;
              const ponto = new DOMPoint(x, y).matrixTransform(matriz),
                j = (Math.round(ponto.y) * 1158 + Math.round(ponto.x)) * 4;
              if (atual[j] > 210 && atual[j + 1] > 195 && atual[j + 2] > 145)
                ovalClaro++;
            }
          }
        return { vazios, ovalClaro };
      }, png);
      for (const [nome, quantidade] of Object.entries(defeitos.vazios))
        expect(quantidade, `${nome} no instante ${tempo}`).toBeLessThanOrEqual(
          2,
        );
      expect(
        defeitos.ovalClaro,
        `oval claro no instante ${tempo}`,
      ).toBeLessThanOrEqual(10);
    }
  });
}
