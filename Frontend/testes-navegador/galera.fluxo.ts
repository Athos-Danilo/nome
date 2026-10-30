import { test, expect } from "@playwright/test";
test("configura convidados e sessões e recupera a preparação", async ({
  page,
}, info) => {
  const perfil = {
    jogador_id: "j",
    estado: "ativo",
    nome_usuario: "Athos",
    email: "athos@example.test",
    avatar_id: "capivara_zen",
  };
  const preferencias = {
    tema: "claro",
    paleta: "roxa",
    musica_id: null,
    volume_musica: 70,
    volume_interface: 70,
    volume_eventos: 70,
    silenciado: false,
    movimentos_reduzidos: true,
    salvas: true,
  };
  let criacoes = 0;
  const grupo = [
    {
      participante_id: "p1",
      nome: "Athos",
      avatar_id: "capivara_zen",
      anfitriao: true,
      pontuacao: 0,
    },
    {
      participante_id: "p2",
      nome: "Amigo",
      avatar_id: "coruja_sabia",
      anfitriao: false,
      pontuacao: 0,
    },
  ];
  const configuracao = {
    dificuldade: "facil",
    quantidade_sessoes: 2,
    modo_tematicas: "manual",
    tematicas: ["animais", "paises"],
  };
  await page.route("**/api/**", (r) => {
    const caminho = new URL(r.request().url()).pathname;
    if (caminho === "/api/autenticacao/sessao")
      return r.fulfill({
        json: { ...perfil, token_csrf: "token", expira_em: "2099-01-01" },
      });
    if (caminho === "/api/perfil") return r.fulfill({ json: perfil });
    if (caminho === "/api/preferencias")
      return r.fulfill({ json: preferencias });
    if (caminho === "/api/avatares")
      return r.fulfill({
        json: [
          {
            id: "capivara_zen",
            nome: "Capivara zen",
            recurso: "/avatares/capivara_zen.webp",
          },
          {
            id: "coruja_sabia",
            nome: "Coruja sábia",
            recurso: "/avatares/coruja_sabia.webp",
          },
        ],
      });
    if (caminho === "/api/partidas/galera/configuracao")
      return r.fulfill({
        json: {
          pode_criar: true,
          plano_id: "plano",
          quantidade_participantes: 2,
          quantidade_sessoes: 2,
          quantidade_palavras: 4,
          participantes: grupo,
          configuracao,
        },
      });
    if (
      caminho === "/api/partidas/galera" ||
      caminho === "/api/partidas/galera/partida"
    ) {
      if (r.request().method() === "POST") criacoes++;
      return r.fulfill({
        json: {
          partida_id: "partida",
          estado: "preparada",
          versao: 1,
          participantes: grupo,
          configuracao,
          ordem_primeira_sessao: ["p2", "p1"],
        },
      });
    }
    return r.fulfill({ json: { individual: null }, status: 200 });
  });
  await page.goto("/jogar/galera/novo");
  await expect(
    page.getByRole("heading", { name: "Reúna sua galera" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Adicionar participante" }).click();
  await page.getByLabel("Nome do convidado 1").fill("Amigo");
  await page.getByLabel("Avatar do convidado 1").selectOption("coruja_sabia");
  await page.getByLabel("Quantidade de sessões").selectOption("2");
  await page.getByLabel("Temáticas").selectOption("manual");
  await page.getByLabel("Temática da sessão 1").selectOption("animais");
  await page.getByLabel("Temática da sessão 2").selectOption("paises");
  await page.getByRole("button", { name: "Conferir minha galera" }).click();
  await expect(
    page.getByText("4 palavras reservadas para 2 sessões."),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/configuracao-galera-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Preparar partida" }).click();
  await expect(
    page.getByRole("heading", { name: "Sua galera está reunida!" }),
  ).toBeVisible();
  expect(criacoes).toBe(1);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sua galera está reunida!" }),
  ).toBeVisible();
  await expect(page.getByText("Amigo", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
