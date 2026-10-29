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
    ["Galera", "/jogar/galera/novo", "Chame sua galera"],
    ["Histórico", "/perfil/historico", "Suas descobertas"],
    ["Rankings", "/rankings", "Cada descoberta conta"],
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
    page.getByText("Demonstração já utilizada", { exact: true }),
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
