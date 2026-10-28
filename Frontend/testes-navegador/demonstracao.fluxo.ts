import { expect, test, type Page } from "@playwright/test";

async function preparar(
  pagina: Page,
  logado = false,
  usada = false,
  conflito = false,
) {
  const estado = { vinculos: 0, vinculada: false, criacoes: 0 };
  await pagina.route("**/api/**", async (rota) => {
    const caminho = new URL(rota.request().url()).pathname;
    if (caminho === "/api/visitantes")
      return rota.fulfill({
        json: {
          demonstracao_utilizada: usada,
          pode_iniciar: !usada,
          vinculada: estado.vinculada,
          token_csrf: "csrf-visitante",
          demonstracao:
            usada && !estado.vinculada
              ? {
                  partida_id: "demo-teste",
                  estado: "em_andamento",
                  pontuacao: 80,
                  versao: 3,
                  quantidade_palavras: 3,
                  dificuldade: "facil",
                  vinculo_expira_em: "2099-01-01T00:00:00Z",
                }
              : null,
        },
      });
    if (caminho === "/api/demonstracoes") {
      estado.criacoes++;
      return rota.fulfill({ status: 500 });
    }
    if (caminho === "/api/demonstracoes/vinculo") {
      estado.vinculos++;
      expect(rota.request().headers()["x-decifra-csrf"]).toBe("csrf-conta");
      if (conflito)
        return rota.fulfill({
          status: 409,
          json: {
            erro: {
              codigo: "INDIVIDUAL_EM_ABERTO",
              mensagem:
                "Sua conta já tem uma partida em aberto. Conclua ou abandone a demonstração antes de vinculá-la.",
            },
          },
        });
      estado.vinculada = true;
      return rota.fulfill({
        json: { partida_id: "demo-teste", vinculada: true },
      });
    }
    if (!logado)
      return rota.fulfill({
        status: 401,
        json: {
          erro: { codigo: "SESSAO_NECESSARIA", mensagem: "Entre com Google." },
        },
      });
    const perfil = {
      jogador_id: "conta-teste",
      estado: "ativo",
      nome_usuario: "Jogador",
      email: "teste@example.test",
      avatar_id: "capivara_zen",
    };
    if (caminho === "/api/autenticacao/sessao")
      return rota.fulfill({
        json: {
          ...perfil,
          token_csrf: "csrf-conta",
          expira_em: "2099-01-01T00:00:00Z",
        },
      });
    if (caminho === "/api/perfil") return rota.fulfill({ json: perfil });
    if (caminho === "/api/preferencias")
      return rota.fulfill({
        json: {
          tema: "claro",
          musica_id: null,
          volume_musica: 70,
          volume_interface: 70,
          volume_eventos: 70,
          silenciado: false,
          movimentos_reduzidos: false,
          salvas: true,
        },
      });
    if (caminho === "/api/partidas/em-aberto")
      return rota.fulfill({ json: { individual: null } });
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
    return rota.fulfill({ status: 404 });
  });
  return estado;
}

test("visitante recebe convite sem consumir demonstração ainda não jogável", async ({
  page,
}, informacoes) => {
  const estado = await preparar(page);
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Jogo rápido", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Três palavras fáceis, temas surpresa."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Entrar com Google/ }),
  ).toBeVisible();
  expect(estado.criacoes).toBe(0);
  await page.screenshot({
    path: `test-results/visitante-${informacoes.project.name}.png`,
    fullPage: true,
  });
});

test("demonstração usada bloqueia nova partida e mantém convite ao Google", async ({
  page,
}) => {
  const estado = await preparar(page, false, true);
  await page.goto("/");
  await expect(page.getByText("Demonstração já utilizada")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Entrar com Google/ }),
  ).toBeVisible();
  expect(estado.criacoes).toBe(0);
});

test("entrada vincula uma única vez e recarga não duplica transferência", async ({
  page,
}) => {
  const estado = await preparar(page, true, true);
  await page.goto("/");
  await expect(
    page.getByText("Demonstração vinculada à sua conta."),
  ).toBeVisible();
  expect(estado.vinculos).toBe(1);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
  expect(estado.vinculos).toBe(1);
});

test("conflito de partida informa o motivo sem repetir o vínculo automaticamente", async ({
  page,
}) => {
  const estado = await preparar(page, true, true, true);
  await page.goto("/");
  await expect(
    page.getByText(/Conclua ou abandone a demonstração antes/),
  ).toBeVisible();
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Do seu jeito" }),
  ).toBeVisible();
  expect(estado.vinculos).toBe(1);
});
