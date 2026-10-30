import { expect, test, type Page } from "@playwright/test";

async function preparar(page: Page, logado = true, vazio = false) {
  const perfil = {
    jogador_id: "pessoa",
    estado: "ativo",
    nome_usuario: "Athos",
    email: "teste@example.test",
    avatar_id: "capivara_zen",
  };
  const estado = { falha: false, filtros: "" };
  await page.route("**/api/**", async (rota) => {
    const url = new URL(rota.request().url()),
      caminho = url.pathname;
    if (caminho === "/api/autenticacao/sessao")
      return rota.fulfill({
        status: logado ? 200 : 401,
        json: logado
          ? { ...perfil, token_csrf: "csrf", expira_em: "2099-01-01" }
          : { erro: { codigo: "SESSAO_NECESSARIA", mensagem: "Entre." } },
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
    if (caminho === "/api/preferencias")
      return rota.fulfill({
        json: {
          tema: "claro",
          paleta: "original",
          musica_id: null,
          volume_musica: 70,
          volume_interface: 70,
          volume_eventos: 70,
          silenciado: false,
          movimentos_reduzidos: false,
          salvas: true,
        },
      });
    if (estado.falha)
      return rota.fulfill({
        status: 503,
        json: {
          erro: { codigo: "DADOS_INDISPONIVEIS", mensagem: "Tente novamente." },
        },
      });
    if (caminho.startsWith("/api/rankings/"))
      return rota.fulfill({
        json: {
          categoria: caminho.split("/").at(-1),
          total: vazio ? 0 : 3,
          pagina: 1,
          por_pagina: 10,
          itens: vazio
            ? []
            : [
                { nome: "Athos", posicao: 1, valor: 160 },
                { nome: "Jogador excluído", posicao: 1, valor: 160 },
                { nome: "Curioso", posicao: 3, valor: -100 },
              ],
        },
      });
    if (caminho === "/api/estatisticas")
      return rota.fulfill({
        json: {
          resumo: {
            partidas_encerradas: vazio ? 0 : 2,
            partidas_concluidas: vazio ? 0 : 1,
            partidas_abandonadas: vazio ? 0 : 1,
            pontos: vazio ? 0 : 60,
            melhor_pontuacao: vazio ? null : 160,
            palavras_acertadas: vazio ? 0 : 2,
            palavras_desistidas: vazio ? 0 : 1,
            erros: vazio ? 0 : 3,
            media_dicas: vazio ? null : 2,
          },
          em_aberto: null,
          por_tematica: vazio
            ? {}
            : {
                paises: {
                  palavras_apresentadas: 3,
                  palavras_acertadas: 2,
                  palavras_desistidas: 1,
                  erros: 3,
                  pontos: 160,
                  media_dicas: 2,
                },
              },
          por_dificuldade: vazio
            ? {}
            : {
                facil: {
                  palavras_apresentadas: 3,
                  palavras_acertadas: 2,
                  palavras_desistidas: 1,
                  erros: 3,
                  pontos: 160,
                  media_dicas: 2,
                },
              },
        },
      });
    if (caminho === "/api/historico") {
      estado.filtros = url.search;
      const galera = url.searchParams.get("modo") === "galera";
      return rota.fulfill({
        json: {
          total: vazio ? 0 : 11,
          pagina: Number(url.searchParams.get("pagina") ?? 1),
          por_pagina: 10,
          itens: vazio
            ? []
            : [
                {
                  partida_id: "partida",
                  modo: galera ? "galera" : "individual",
                  origem: "normal",
                  estado: "concluida",
                  criado_em: "2026-10-30T12:00:00Z",
                  encerrada_em: "2026-10-30T12:05:00Z",
                  pontuacao: 160,
                  palavras: 3,
                  acertos: 2,
                  participantes: galera
                    ? [
                        { nome: "Athos", pontos: 500 },
                        { nome: "Bia", pontos: 300 },
                      ]
                    : [],
                  vencedores: galera ? ["Athos"] : [],
                  resultado_galera: galera ? "vencedor" : null,
                  motivo_encerramento: galera ? "sessoes_concluidas" : null,
                },
              ],
        },
      });
    }
    return rota.fulfill({ status: 404 });
  });
  return estado;
}

test("histórico, filtros, paginação e estatísticas privadas", async ({
  page,
}, info) => {
  const estado = await preparar(page);
  await page.goto("/perfil/historico");
  await expect(
    page.getByRole("heading", { name: "Seu álbum de descobertas" }),
  ).toBeVisible();
  await page.getByLabel("Modo de jogo").selectOption("galera");
  await expect(page.getByText("Bia · 300 pontos")).toBeVisible();
  await page.getByRole("button", { name: "Próxima página" }).click();
  await expect.poll(() => estado.filtros).toContain("pagina=2");
  await page.getByRole("link", { name: "Ver minhas estatísticas" }).click();
  await expect(
    page.getByRole("heading", { name: "Cada descoberta conta" }),
  ).toBeVisible();
  await expect(page.getByText("Média de dicas nos acertos")).toBeVisible();
  await expect(page).toHaveTitle("Cada descoberta conta — Decifra");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/estatisticas-${info.project.name}.png`,
    fullPage: true,
  });
});
test("ranking público mostra empate e negativos nas três categorias", async ({
  page,
}, info) => {
  await preparar(page, false);
  await page.goto("/rankings");
  await expect(
    page.getByRole("heading", { name: "O palco das descobertas" }),
  ).toBeVisible();
  await expect(
    page.getByRole("rowheader", { name: "Jogador excluído", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Palavras acertadas", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Partidas concluídas", exact: true })
    .click();
  await expect(page.getByText("−100", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/ranking-${info.project.name}.png`,
    fullPage: true,
  });
});
test("histórico vazio e falha recuperável sem números inventados", async ({
  page,
}) => {
  const estado = await preparar(page, true, true);
  await page.goto("/perfil/historico");
  await expect(
    page.getByText("Seu álbum começa na próxima partida."),
  ).toBeVisible();
  estado.falha = true;
  await page.getByRole("link", { name: "Ver minhas estatísticas" }).click();
  await expect(page.getByRole("alert")).toContainText("Tente novamente.");
  estado.falha = false;
  await page
    .getByRole("button", { name: "Tentar novamente", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cada descoberta conta" }),
  ).toBeVisible();
});

test("visitante não consulta histórico privado e vê ranking vazio", async ({
  page,
}) => {
  await preparar(page, false, true);
  const privadas: string[] = [];
  page.on("request", (r) => {
    if (
      ["/api/historico", "/api/estatisticas"].includes(
        new URL(r.url()).pathname,
      )
    )
      privadas.push(r.url());
  });
  await page.goto("/perfil/historico");
  await expect(
    page.getByRole("heading", { name: "Suas descobertas merecem uma conta" }),
  ).toBeVisible();
  expect(privadas).toEqual([]);
  await page.getByRole("link", { name: "Rankings", exact: true }).click();
  await expect(
    page.getByText("O palco está esperando as primeiras descobertas."),
  ).toBeVisible();
});

test("rankings preservam layout e teclado nas quatro paletas claras e escuras", async ({
  page,
}, info) => {
  await preparar(page, false);
  for (const paleta of ["original", "azul", "roxa", "grafite"]) {
    for (const tema of ["claro", "escuro"]) {
      await page.addInitScript(
        ({ paleta, tema }) =>
          localStorage.setItem(
            "decifra_preferencias",
            JSON.stringify({
              paleta,
              tema,
              musica_id: null,
              volume_musica: 70,
              volume_interface: 70,
              volume_eventos: 70,
              silenciado: false,
              movimentos_reduzidos: true,
            }),
          ),
        { paleta, tema },
      );
      await page.goto("/rankings");
      await expect(
        page.getByRole("rowheader", { name: "Curioso" }),
      ).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-paleta", paleta);
      await expect(page.locator("html")).toHaveAttribute("data-tema", tema);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.getByRole("button", { name: "Pontos", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Palavras acertadas", exact: true }),
  ).toBeFocused();
  await page.screenshot({
    path: `test-results/ranking-grafite-escuro-${info.project.name}.png`,
    fullPage: true,
  });
});
