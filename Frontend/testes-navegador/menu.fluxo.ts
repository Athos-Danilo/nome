import { expect, test, type Page } from "@playwright/test";

async function preparar(
  pagina: Page,
  logado = false,
  pendente = false,
  usada = false,
) {
  const estado = { expirou: false, falhar: false, aberta: false, consultas: 0 };
  let preferencias = {
    tema: "claro",
    musica_id: null,
    volume_musica: 70,
    volume_interface: 70,
    volume_eventos: 70,
    silenciado: false,
    movimentos_reduzidos: false,
    salvas: true,
  };
  await pagina.route("**/api/**", async (rota) => {
    const caminho = new URL(rota.request().url()).pathname;
    if (caminho === "/api/visitantes")
      return rota.fulfill({
        json: {
          demonstracao_utilizada: usada,
          pode_iniciar: !usada,
          vinculada: false,
          demonstracao: null,
          token_csrf: "visitante",
        },
      });
    if (!logado || estado.expirou)
      return rota.fulfill({
        status: 401,
        json: {
          erro: { codigo: "SESSAO_EXPIRADA", mensagem: "Entre novamente." },
        },
      });
    const perfil = {
      jogador_id: "jogador-menu",
      estado: pendente ? "cadastro_pendente" : "ativo",
      nome_usuario: pendente ? null : "Athos",
      email: "athos@example.test",
      avatar_id: pendente ? null : "capivara_zen",
    };
    if (caminho === "/api/autenticacao/sessao")
      return rota.fulfill({
        json: {
          ...perfil,
          token_csrf: "csrf",
          expira_em: "2099-01-01T00:00:00Z",
        },
      });
    if (caminho === "/api/perfil") return rota.fulfill({ json: perfil });
    if (caminho === "/api/avatares")
      return rota.fulfill({
        json: [
          {
            id: "capivara_zen",
            nome: "Capivara zen",
            recurso: "/avatares/capivara_zen.webp",
          },
        ],
      });
    if (caminho === "/api/preferencias") {
      if (rota.request().method() === "PUT")
        preferencias = { ...preferencias, ...rota.request().postDataJSON() };
      return rota.fulfill({ json: preferencias });
    }
    if (caminho === "/api/partidas/em-aberto") {
      estado.consultas++;
      if (estado.falhar)
        return rota.fulfill({
          status: 503,
          json: {
            erro: {
              codigo: "DADOS_INDISPONIVEIS",
              mensagem: "Não foi possível conferir a partida.",
            },
          },
        });
      return rota.fulfill({
        json: {
          individual: estado.aberta
            ? {
                partida_id: "partida-1",
                estado: "em_andamento",
                pontuacao: 80,
                quantidade_palavras: 5,
                rodadas_concluidas: 1,
                rodada_atual: { ordem: 2, dica_atual: 3 },
              }
            : null,
        },
      });
    }
    return rota.fulfill({ status: 404 });
  });
  return estado;
}

test("visitante navega pelo menu e volta das configurações sem consumir demonstração", async ({
  page,
}, info) => {
  await preparar(page);
  let criacoes = 0;
  page.on("request", (r) => {
    if (new URL(r.url()).pathname === "/api/demonstracoes") criacoes++;
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Jogo rápido", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page).toHaveURL(/\/configuracoes$/);
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await page.getByRole("link", { name: "Voltar ao menu" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  expect(criacoes).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/menu-visitante-escuro-${info.project.name}.png`,
    fullPage: true,
  });
});

test("conta ativa encontra modos, perfil, histórico, ranking e menu claro", async ({
  page,
}, info) => {
  await preparar(page, true);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Jogo rápido", exact: true }),
  ).toHaveCount(0);
  await page.screenshot({
    path: `test-results/menu-conta-${info.project.name}.png`,
    fullPage: true,
  });
  for (const [nome, caminho, titulo] of [
    ["Solo", "/jogar/individual/novo", "Um mundo de descobertas."],
    ["Galera", "/jogar/galera/novo", "Reúna sua galera"],
    ["Histórico", "/perfil/historico", "Seu álbum de descobertas"],
    ["Rankings", "/rankings", "O palco das descobertas"],
  ]) {
    await page.getByRole("link", { name: nome, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(caminho + "$"));
    await expect(
      page.getByRole("heading", { name: titulo, exact: true }),
    ).toBeFocused();
    await page.getByRole("link", { name: "Voltar ao menu" }).click();
  }
  await page.getByRole("link", { name: "Perfil", exact: true }).click();
  await expect(page.getByLabel("Nome de usuário")).toHaveValue("Athos");
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("primeiro acesso impede atalhos para os modos", async ({ page }) => {
  await preparar(page, true, true);
  await page.goto("/jogar/galera/novo");
  await expect(page).toHaveURL(/\/primeiro-acesso$/);
  await expect(
    page.getByRole("heading", { name: "Seu nome no jogo" }),
  ).toBeVisible();
});

test("demonstração usada mostra limite e convite ao Google", async ({
  page,
}) => {
  await preparar(page, false, false, true);
  await page.goto("/");
  await expect(
    page.getByText("Vamos para a próxima descoberta?", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Jogo rápido", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /Entrar com Google/ }),
  ).toBeVisible();
});

test("ajuda tem foco contido, fecha com Escape e devolve foco", async ({
  page,
}) => {
  await preparar(page);
  await page.goto("/");
  const ajuda = page.getByRole("button", { name: "Como jogar" });
  await ajuda.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Entendi" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(ajuda).toBeFocused();
});

test("consulta real de partida informa falha, permite repetir e mostra continuidade", async ({
  page,
}) => {
  const estado = await preparar(page, true);
  estado.falhar = true;
  await page.goto("/");
  await expect(
    page.getByText("Não foi possível conferir a partida.", { exact: true }),
  ).toBeVisible();
  estado.falhar = false;
  estado.aberta = true;
  await page
    .getByRole("button", { name: "Conferir partida novamente" })
    .click();
  await expect(
    page.getByRole("link", { name: "Continuar partida" }),
  ).toBeVisible();
  await expect(page.getByText(/80 pontos/)).toBeVisible();
});

test("sessão expirada numa consulta remove identidade e oferece login", async ({
  page,
}) => {
  const estado = await preparar(page, true);
  await page.goto("/");
  await expect(page.getByText(/OLÁ, ATHOS/)).toBeVisible();
  estado.expirou = true;
  await page.getByRole("link", { name: "Rankings", exact: true }).click();
  await page.getByRole("link", { name: "Voltar ao menu" }).click();
  await expect(page.getByText(/Sua sessão terminou/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Entrar com Google/ }),
  ).toBeVisible();
  await expect(page.getByText(/OLÁ, ATHOS/)).toHaveCount(0);
});

test("atalho de tema não grava ajustes de áudio ainda não confirmados", async ({
  page,
}) => {
  await preparar(page, true);
  await page.goto("/configuracoes");
  await page.getByRole("slider", { name: /interface e teclado/i }).fill("15");
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await expect(
    page.getByRole("slider", { name: /interface e teclado/i }),
  ).toHaveValue("70");
});

test("aba mantém Decifra e favicon da marca ao navegar e recarregar", async ({
  page,
}) => {
  await preparar(page);
  const resposta = await page.goto("/");
  expect(await resposta!.text()).toContain("<title>Decifra</title>");
  await expect(page).toHaveTitle("Decifra");
  const icone = page.locator('link[rel="icon"]');
  await expect(icone).toHaveAttribute("href", "/favicon.svg");
  const arquivo = await page.request.get("/favicon.svg");
  expect(arquivo.ok()).toBeTruthy();
  expect(arquivo.headers()["content-type"]).toContain("image/svg+xml");
  expect(await arquivo.text()).toContain("#D4FE62");
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Decifra");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeFocused();
  await expect(page).toHaveTitle("Decifra");
});

test("menu no computador cabe na janela e oferece volume e confirmação temporária", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "computador");
  await page.setViewportSize({ width: 1918, height: 945 });
  await preparar(page, true);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
  await expect(page.getByText("Minhas descobertas →")).toHaveCount(0);
  await expect(
    page.getByText("DICAS. DESCOBERTAS. VOCÊ.", { exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Desativar música do menu" }).hover();
  const volume = page.getByRole("slider", { name: "Volume da música" });
  await volume.focus();
  await volume.press("Home");
  await expect(
    page.getByText("✓ Preferências salvas na sua conta."),
  ).toBeVisible();
  await expect(
    page.getByText("✓ Preferências salvas na sua conta."),
  ).toHaveCount(0, { timeout: 6000 });
});

test("a mesma trilha acompanha as seções do menu", async ({ page }) => {
  await preparar(page, true);
  await page.addInitScript(() => {
    const janela = window as Window & {
      iniciosMenu?: number;
      terminouMenu?: boolean;
    };
    const iniciar = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      if (this.loop) {
        janela.iniciosMenu = (janela.iniciosMenu ?? 0) + 1;
        this.addEventListener("ended", () => {
          janela.terminouMenu = true;
        });
      }
      return iniciar.apply(this, args);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Como jogar" }).click();
  await page.keyboard.press("Escape");
  for (const nome of [
    "Perfil",
    "Histórico",
    "Rankings",
    "Configurações",
    "Início",
  ]) {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: nome, exact: true })
      .click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const janela = window as Window & {
            iniciosMenu?: number;
            terminouMenu?: boolean;
          };
          return [janela.iniciosMenu, !!janela.terminouMenu];
        }),
      )
      .toEqual([1, false]);
  }
});

for (const cenario of [
  "conta",
  "visitante",
  "demonstracao-usada",
  "individual-aberta",
] as const) {
  test(`referência estabilizada do menu: ${cenario}`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const logado = cenario === "conta" || cenario === "individual-aberta";
    const estado = await preparar(
      page,
      logado,
      false,
      cenario === "demonstracao-usada",
    );
    estado.aberta = cenario === "individual-aberta";
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Bora decifrar?" }),
    ).toBeFocused();
    await expect(page).toHaveTitle("Decifra");
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
      "href",
      "/favicon.svg",
    );
    if (logado) {
      await expect(
        page.getByRole("link", { name: "Solo", exact: true }),
      ).toHaveAttribute("href", "/jogar/individual/novo");
      await expect(
        page.getByRole("link", { name: "Galera", exact: true }),
      ).toHaveAttribute("href", "/jogar/galera/novo");
    } else {
      await expect(
        page.getByRole("link", { name: /Entrar com Google/ }),
      ).toHaveAttribute("href", "/api/autenticacao/google");
      await expect(
        page.getByRole("link", { name: "Jogo rápido", exact: true }),
      ).toHaveCount(cenario === "visitante" ? 1 : 0);
    }
    await expect(
      page.getByRole("link", { name: "Continuar partida" }),
    ).toHaveCount(estado.aberta ? 1 : 0);
    if (estado.aberta) await expect(page.getByText(/80 pontos/)).toBeVisible();
    await expect(page.locator(".aurelio-animado")).toHaveAttribute(
      "data-estatico",
      "true",
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images, (imagem) => imagem.decode()),
      );
      const fontes = new Set(
        Array.from(
          document.querySelectorAll<SVGImageElement>(".aurelio-animado image"),
          (imagem) => imagem.href.baseVal,
        ),
      );
      await Promise.all(
        Array.from(fontes, async (fonte) => {
          const imagem = new Image();
          imagem.src = fonte;
          await imagem.decode();
        }),
      );
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`referencia-${cenario}.png`),
      fullPage: true,
      animations: "disabled",
    });
  });
}

test("agenda do menu distingue ausência, redução, diálogo e desmontagem", async ({
  page,
}) => {
  await preparar(page, true);
  await page.goto("/");
  const menu = page.locator(".sala-jogo");
  await expect(menu).toHaveAttribute("data-agenda", "ativa");
  await expect(menu).toHaveAttribute("data-acontecimento", "entrada");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(menu).toHaveAttribute("data-agenda", "pausada");
  await expect(menu).toHaveAttribute("data-ausente", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(menu).toHaveAttribute("data-reduzida", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(menu).toHaveAttribute("data-agenda", "pausada");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(menu).toHaveAttribute("data-agenda", "ativa");
  await page.getByRole("button", { name: "Como jogar" }).click();
  await expect(menu).toHaveAttribute("data-agenda", "pausada");
  await expect(page.locator(".aurelio-animado")).toHaveAttribute(
    "data-estatico",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("data-agenda", "ativa");
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(menu).toHaveCount(0);
  await page.getByRole("link", { name: "Voltar ao menu" }).click();
  await expect(menu).toHaveAttribute("data-agenda", "ativa");
  await page.evaluate(
    () => (document.documentElement.dataset.movimentos = "reduzidos"),
  );
  await expect(menu).toHaveAttribute("data-reduzida", "true");
});

test("pausa do menu preserva o restante da saudação", async ({ page }) => {
  await preparar(page, true);
  await page.clock.install();
  await page.goto("/");
  const mascote = page.locator(".aurelio-animado");
  await expect(mascote).toHaveAttribute("data-reacao", "saudacao");
  await page.clock.runFor(3800);
  await page.getByRole("button", { name: "Como jogar" }).click();
  await page.clock.runFor(6000);
  await expect(mascote).toHaveAttribute("data-reacao", "saudacao");
  await page.keyboard.press("Escape");
  await page.clock.runFor(1000);
  await expect(mascote).toHaveAttribute("data-reacao", "saudacao");
  await page.clock.runFor(1000);
  await expect(mascote).toHaveAttribute("data-reacao", "espera");
});

test("cenário ambiente anima sem capturar controles e pausa com o menu e fora da tela", async ({
  page,
}) => {
  await preparar(page, true);
  await page.goto("/");
  const cenario = page.locator(".cenario-menu");
  await expect(cenario).toHaveAttribute("data-cenario", "ativo");
  await expect(cenario).toHaveAttribute("aria-hidden", "true");
  await expect(cenario.locator(".bloco-orbita")).toHaveCount(2);
  await expect(cenario.locator(".brilho-menu")).toHaveCount(3);
  expect(
    await cenario.evaluate((el) => getComputedStyle(el).pointerEvents),
  ).toBe("none");
  expect(await cenario.locator("button,a,input,[tabindex]").count()).toBe(0);
  const tempos = () =>
    page
      .locator(".circulos-menu")
      .evaluate((el) => el.getAnimations().map((a) => Number(a.currentTime)));
  const antes = await tempos();
  await expect
    .poll(async () => (await tempos())[0])
    .toBeGreaterThan(antes[0] + 50);
  await page.getByRole("button", { name: "Como jogar" }).click();
  await expect(cenario).toHaveAttribute("data-cenario", "pausado");
  await expect
    .poll(() =>
      page
        .locator(".circulos-menu")
        .evaluate((el) => el.getAnimations()[0]?.playState),
    )
    .toBe("paused");
  const parado = await tempos();
  await page.waitForTimeout(180);
  expect(Math.abs((await tempos())[0] - parado[0])).toBeLessThan(2);
  await page.keyboard.press("Escape");
  await expect(cenario).toHaveAttribute("data-cenario", "ativo");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(cenario).toHaveAttribute("data-cenario", "pausado");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(cenario).toHaveAttribute("data-cenario", "ativo");
  await page
    .locator(".palco-menu")
    .evaluate((el) => (el.style.transform = "translateY(-3000px)"));
  await expect(cenario).toHaveAttribute("data-cenario", "pausado");
  await page.locator(".palco-menu").evaluate((el) => (el.style.transform = ""));
  await expect(cenario).toHaveAttribute("data-cenario", "ativo");
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(cenario).toHaveCount(0);
  await expect(page.locator(".fundo-menu-ambiente")).toHaveCount(0);
});

test("cenário respeita as oito aparências e a redução sem deslocar textos e links", async ({
  page,
}, info) => {
  await preparar(page, true);
  await page.goto("/");
  const cenario = page.locator(".cenario-menu");
  await expect(cenario).toHaveAttribute("data-cenario", "ativo");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cenario).toHaveAttribute("data-cenario", "reduzido");
  for (const paleta of ["original", "azul", "roxa", "grafite"]) {
    for (const tema of ["claro", "escuro"]) {
      await page.evaluate(
        ({ paleta, tema }) => {
          document.documentElement.dataset.paleta = paleta;
          document.documentElement.dataset.tema = tema;
        },
        { paleta, tema },
      );
      expect(
        await cenario.evaluate(
          (el) => el.getAnimations({ subtree: true }).length,
        ),
      ).toBe(0);
      expect(
        await page
          .locator(".circulos-menu")
          .evaluate((el) => el.getAnimations().length),
      ).toBe(0);
      await expect(
        page.getByRole("link", { name: "Solo", exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: info.outputPath(`cenario-${paleta}-${tema}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(cenario).toHaveAttribute("data-cenario", "ativo");
  await page.evaluate(
    () => (document.documentElement.dataset.movimentos = "reduzidos"),
  );
  await expect(cenario).toHaveAttribute("data-cenario", "reduzido");
});

test.describe("inspeção do movimento ambiente", () => {
  test("sequência mantém texto e controles estáveis durante os ciclos", async ({
    browser,
  }, info) => {
    test.setTimeout(30000);
    const contexto = await browser.newContext({
      viewport: info.project.use.viewport,
      isMobile: info.project.name === "celular",
      hasTouch: info.project.name !== "computador",
      recordVideo: { dir: info.outputPath("video") },
    });
    const page = await contexto.newPage();
    try {
      await preparar(page, true);
      await page.goto("/");
      await expect(page.locator(".cenario-menu")).toHaveAttribute(
        "data-cenario",
        "ativo",
      );
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          Array.from(document.images, (imagem) => imagem.decode()),
        );
        await Promise.all(
          Array.from(
            document.querySelectorAll<SVGImageElement>(
              ".aurelio-animado image",
            ),
            async (el) => {
              const imagem = new Image();
              imagem.src = el.href.baseVal;
              await imagem.decode();
            },
          ),
        );
      });
      await page.locator(".sala-jogo").evaluate(async (el) => {
        const entradas = el
          .getAnimations({ subtree: true })
          .filter(
            (animacao) => animacao.effect?.getTiming().iterations !== Infinity,
          );
        await Promise.all(entradas.map((animacao) => animacao.finished));
      });
      const titulo = page.getByRole("heading", { name: "Bora decifrar?" });
      const solo = page.getByRole("link", { name: "Solo", exact: true });
      const baseTitulo = await titulo.boundingBox();
      const baseSolo = await solo.boundingBox();
      const posicoes = new Set<string>();
      const duracoes = await page
        .locator(".cenario-menu .bloco-orbita")
        .evaluateAll((els) =>
          els.map((el) => getComputedStyle(el).animationDuration),
        );
      expect(new Set(duracoes).size).toBe(2);
      for (let passo = 0; passo < 8; passo++) {
        if (passo) await page.waitForTimeout(1500);
        posicoes.add(
          await page
            .locator(".cenario-menu .orbita-a")
            .evaluate((el) => getComputedStyle(el).translate),
        );
        const atualTitulo = await titulo.boundingBox();
        const atualSolo = await solo.boundingBox();
        expect(atualTitulo?.x).toBeCloseTo(baseTitulo!.x, 0);
        expect(atualTitulo?.y).toBeCloseTo(baseTitulo!.y, 0);
        expect(atualSolo?.x).toBeCloseTo(baseSolo!.x, 0);
        expect(atualSolo?.y).toBeCloseTo(baseSolo!.y, 0);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: info.outputPath(`sequencia-${passo}.png`),
          fullPage: true,
        });
      }
      expect(posicoes.size).toBeGreaterThan(2);
      await solo.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/jogar\/individual\/novo$/);
    } finally {
      await contexto.close();
    }
  });
});

test("fundo percorre distância perceptível em poucos segundos", async ({
  page,
}) => {
  await preparar(page, true);
  await page.goto("/");
  await expect(page.locator(".cenario-menu")).toHaveAttribute(
    "data-cenario",
    "ativo",
  );
  const posicao = () =>
    page.locator(".circulos-menu").evaluate((el) => {
      const matriz = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return { x: matriz.m41, y: matriz.m42 };
    });
  const inicio = await posicao();
  await page.waitForTimeout(3200);
  const fim = await posicao();
  expect(Math.hypot(fim.x - inicio.x, fim.y - inicio.y)).toBeGreaterThan(12);
});

test("balão no celular fica ao lado do mascote e não sob os pés", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "celular");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const logado of [true, false]) {
    await page.unroute("**/api/**");
    await preparar(page, logado);
    for (const largura of [360, 390, 430]) {
      await page.setViewportSize({ width: largura, height: 873 });
      await page.goto("/");
      await expect(page.locator(".balao-menu")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const balao = await page.locator(".balao-menu").boundingBox();
      const mascote = await page
        .locator(".palco-menu .aurelio-animado")
        .boundingBox();
      const descricao = await page
        .locator(".boas-vindas-menu > p")
        .boundingBox();
      expect(balao!.x + balao!.width).toBeLessThan(mascote!.x - 2);
      expect(balao!.y).toBeGreaterThan(descricao!.y + descricao!.height + 2);
      expect(balao!.x).toBeGreaterThanOrEqual(9);
    }
  }
});

test("cartões no celular ficam próximos do menu inferior sem cobrir ações", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "celular");
  const estado = await preparar(page, true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [
    { width: 360, height: 740 },
    { width: 390, height: 844 },
    { width: 430, height: 873 },
    { width: 430, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Solo", exact: true }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    if (viewport.height >= 844) {
      const acoes = await page
        .locator(".rodape-cartao")
        .evaluateAll((els) =>
          els.map((el) => el.getBoundingClientRect().bottom),
        );
      const navegacao = await page
        .getByRole("navigation", { name: "Navegação principal" })
        .boundingBox();
      expect(Math.max(...acoes)).toBeLessThan(navegacao!.y - 8);
    }
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    const cartoes = await page
      .locator(".cartao-modo")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().bottom));
    const menu = await page
      .getByRole("navigation", { name: "Navegação principal" })
      .boundingBox();
    const distancia = menu!.y - Math.max(...cartoes);
    expect(distancia).toBeGreaterThanOrEqual(12);
    expect(distancia).toBeLessThanOrEqual(80);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`celular-${viewport.width}-${viewport.height}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  estado.aberta = true;
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Continuar partida" }),
  ).toBeVisible();
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  const fundoCartoes = await page
    .locator(".cartao-modo")
    .evaluateAll((els) =>
      Math.max(...els.map((el) => el.getBoundingClientRect().bottom)),
    );
  const navegacao = await page
    .getByRole("navigation", { name: "Navegação principal" })
    .boundingBox();
  expect(navegacao!.y - fundoCartoes).toBeGreaterThanOrEqual(12);
  expect(navegacao!.y - fundoCartoes).toBeLessThanOrEqual(80);
});

test("entrada encenada ocorre uma vez na aba e retorna curta após navegação e recarga", async ({
  page,
}) => {
  await preparar(page, true);
  await page.goto("/");
  const menu = page.locator(".sala-jogo");
  await expect(menu).toHaveAttribute("data-entrada", "primeira");
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeFocused();
  const fases = await page.evaluate(() =>
    [
      ".marca-jogo",
      ".boas-vindas-menu h1",
      ".palco-menu",
      ".escolhas-menu",
    ].map((seletor) => {
      const estilo = getComputedStyle(document.querySelector(seletor)!);
      return {
        nome: estilo.animationName,
        atraso: parseFloat(estilo.animationDelay),
        duracao: parseFloat(estilo.animationDuration),
      };
    }),
  );
  expect(fases.every((fase) => fase.nome !== "none")).toBe(true);
  expect(fases.map((fase) => fase.atraso)).toEqual(
    [...fases.map((fase) => fase.atraso)].sort((a, b) => a - b),
  );
  expect(
    Math.max(...fases.map((fase) => fase.atraso + fase.duracao)),
  ).toBeLessThanOrEqual(1.1);
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page).toHaveURL(/\/configuracoes$/);
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeVisible();
  await page.goBack();
  await expect(menu).toHaveAttribute("data-entrada", "retorno");
  await expect(page.locator(".aurelio-animado")).toHaveAttribute(
    "data-reacao",
    "espera",
  );
  expect(
    await page
      .locator(".marca-jogo")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  expect(
    await page
      .locator(".boas-vindas-menu")
      .evaluate((el) => parseFloat(getComputedStyle(el).animationDuration)),
  ).toBeLessThanOrEqual(0.35);
  await page.reload();
  await expect(menu).toHaveAttribute("data-entrada", "retorno");
  const outra = await page.context().newPage();
  try {
    await preparar(outra, true);
    await outra.goto("/");
    await expect(outra.locator(".sala-jogo")).toHaveAttribute(
      "data-entrada",
      "primeira",
    );
  } finally {
    await outra.close();
  }
});

test("armazenamento indisponível não impede entrada, navegação ou retorno", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new Error("Bloqueado para teste");
      },
    }),
  );
  await preparar(page, true);
  await page.goto("/");
  await expect(page.locator(".sala-jogo")).toHaveAttribute(
    "data-entrada",
    "primeira",
  );
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await page.getByRole("link", { name: "Voltar ao menu" }).click();
  await expect(page.locator(".sala-jogo")).toHaveAttribute(
    "data-entrada",
    "retorno",
  );
});

test("redução cancela apresentação sem reproduzir saudação ao ser desabilitada", async ({
  page,
}) => {
  await preparar(page, true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const menu = page.locator(".sala-jogo");
  await expect(menu).toHaveAttribute("data-entrada", "estatica");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(menu).toHaveAttribute("data-entrada", "estatica");
  await expect(page.locator(".aurelio-animado")).toHaveAttribute(
    "data-reacao",
    "espera",
  );
  await page.reload();
  await expect(menu).toHaveAttribute("data-entrada", "retorno");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(menu).toHaveAttribute("data-entrada", "estatica");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(menu).toHaveAttribute("data-entrada", "estatica");
});

test("entrada não bloqueia ações mesmo com falhas de arte e consulta", async ({
  page,
}) => {
  await preparar(page, true);
  await page.route(/\/mascote\/[^/]+\.(png|webp)(\?.*)?$/, (rota) =>
    rota.abort(),
  );
  await page.route("**/api/partidas/em-aberto", (rota) =>
    rota.fulfill({
      status: 503,
      json: {
        erro: {
          codigo: "DADOS_INDISPONIVEIS",
          mensagem: "Não foi possível conferir a partida.",
        },
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator(".sala-jogo")).toHaveAttribute(
    "data-entrada",
    "primeira",
  );
  const solo = page.getByRole("link", { name: "Solo", exact: true });
  await solo.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/jogar\/individual\/novo$/);
  await page.goBack();
  await expect(page.locator(".sala-jogo")).toHaveAttribute(
    "data-entrada",
    "retorno",
  );
});

test("sair da conta durante a entrada troca para retorno sem guardar a saudação anterior", async ({
  page,
}) => {
  const estado = await preparar(page, true);
  await page.route("**/api/autenticacao/sair", (rota) => {
    estado.expirou = true;
    return rota.fulfill({ status: 204 });
  });
  await page.goto("/");
  await expect(page.locator(".sala-jogo")).toHaveAttribute(
    "data-entrada",
    "primeira",
  );
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page.locator(".sala-visitante")).toHaveAttribute(
    "data-entrada",
    "retorno",
  );
  await expect(page.locator(".aurelio-animado")).toHaveAttribute(
    "data-reacao",
    "espera",
  );
  await expect(page.locator(".sala-visitante")).toHaveAttribute(
    "data-acontecimento",
    "repouso",
  );
  await expect(
    page.getByRole("link", { name: /Entrar com Google/ }),
  ).toBeVisible();
});

test("quadros da apresentação preservam conteúdo visível e foco", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const observador = new MutationObserver(() => {
      const animacoes = document
        .getAnimations()
        .filter(
          (animacao) =>
            animacao instanceof CSSAnimation &&
            animacao.animationName === "revelar-menu",
        );
      if (animacoes.length >= 4) {
        animacoes.forEach((animacao) => {
          animacao.pause();
          animacao.currentTime = 0;
        });
        observador.disconnect();
      }
    });
    observador.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-entrada"],
    });
  });
  await preparar(page, true);
  await page.goto("/");
  await expect(page.locator(".sala-jogo")).toHaveAttribute(
    "data-entrada",
    "primeira",
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, (imagem) => imagem.decode()));
    await Promise.all(
      Array.from(
        document.querySelectorAll<SVGImageElement>(".aurelio-animado image"),
        async (el) => {
          const imagem = new Image();
          imagem.src = el.href.baseVal;
          await imagem.decode();
        },
      ),
    );
  });
  for (const instante of [0, 150, 350, 650, 900]) {
    await page.evaluate(
      (tempo) =>
        document
          .getAnimations()
          .filter(
            (animacao) =>
              animacao instanceof CSSAnimation &&
              animacao.animationName === "revelar-menu",
          )
          .forEach((animacao) => (animacao.currentTime = tempo)),
      instante,
    );
    await expect(
      page.getByRole("heading", { name: "Bora decifrar?" }),
    ).toBeFocused();
    await expect(
      page.getByRole("link", { name: "Solo", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`entrada-${instante}.png`),
      fullPage: true,
    });
  }
});
