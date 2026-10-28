import { expect, test, type Page } from "@playwright/test";

const identificadores = [
  "aurelio_apresentador",
  "aurelio_oculos",
  "aurelio_detetive",
  "aurelio_comemorando",
  "coruja_sabia",
  "onca_pintada",
  "capivara_zen",
  "tucano_tropical",
  "lampada_ideia",
  "lupa_misterio",
  "livro_encantado",
  "pena_tinteiro",
  "claquete_cinema",
  "pipoca_divertida",
  "trofeu_campeao",
  "cartola_magica",
  "controle_arcade",
  "fita_cassete",
  "disco_vinil",
  "dado_da_sorte",
];
const nomes = [
  "Aurélio apresentador",
  "Aurélio de óculos",
  "Aurélio detetive",
  "Aurélio comemorando",
  "Coruja sábia",
  "Onça pintada",
  "Capivara zen",
  "Tucano tropical",
  "Lâmpada de ideias",
  "Lupa do mistério",
  "Livro encantado",
  "Pena e tinteiro",
  "Claquete de cinema",
  "Pipoca divertida",
  "Troféu de campeão",
  "Cartola mágica",
  "Controle arcade",
  "Fita cassete",
  "Disco de vinil",
  "Dado da sorte",
];

async function preparar(pagina: Page, ativo = false, salvo = false) {
  const estado = {
    logado: true,
    excluir: 0,
    falhar: false,
    perfil: {
      jogador_id: "00000000-0000-4000-8000-000000000001",
      email: "jogador@example.test",
      estado: ativo ? "ativo" : "cadastro_pendente",
      nome_usuario: ativo ? "Jogador" : (null as string | null),
      avatar_id: ativo ? "capivara_zen" : (null as string | null),
    },
    preferencias: {
      tema: salvo ? "escuro" : "claro",
      musica_id: null,
      volume_musica: 70,
      volume_interface: 70,
      volume_eventos: 70,
      silenciado: false,
      movimentos_reduzidos: false,
      salvas: salvo,
    },
  };
  await pagina.route("**/api/**", async (rota) => {
    const requisicao = rota.request();
    const caminho = new URL(requisicao.url()).pathname;
    if (caminho === "/api/visitantes")
      return rota.fulfill({
        json: {
          demonstracao_utilizada: false,
          pode_iniciar: true,
          vinculada: false,
          demonstracao: null,
          token_csrf: "csrf-visitante",
        },
      });
    if (caminho === "/api/partidas/em-aberto")
      return rota.fulfill({ json: { individual: null } });
    if (caminho === "/api/avatares")
      return rota.fulfill({
        json: identificadores.map((id, i) => ({
          id,
          nome: nomes[i],
          recurso: `/avatares/${id}.webp`,
        })),
      });
    if (!estado.logado)
      return rota.fulfill({
        status: 401,
        json: {
          erro: { codigo: "SESSAO_EXPIRADA", mensagem: "Entre novamente." },
        },
      });
    if (caminho === "/api/autenticacao/sessao")
      return rota.fulfill({
        json: {
          ...estado.perfil,
          token_csrf: "csrf-de-teste",
          expira_em: "2099-01-01T00:00:00Z",
        },
      });
    if (requisicao.method() !== "GET")
      expect(requisicao.headers()["x-decifra-csrf"]).toBe("csrf-de-teste");
    if (caminho === "/api/perfil" && requisicao.method() === "DELETE") {
      estado.excluir++;
      expect(requisicao.postDataJSON()).toEqual({ confirmacao: "EXCLUIR" });
      if (estado.falhar)
        return rota.fulfill({
          status: 503,
          json: {
            erro: {
              codigo: "DADOS_INDISPONIVEIS",
              mensagem: "Tente novamente.",
            },
          },
        });
      estado.logado = false;
      return rota.fulfill({ status: 204 });
    }
    if (caminho === "/api/perfil" && requisicao.method() === "PATCH") {
      const dados = requisicao.postDataJSON();
      if (dados.nome_usuario === "Ocupado")
        return rota.fulfill({
          status: 409,
          json: {
            erro: {
              codigo: "NOME_INDISPONIVEL",
              mensagem: "Esse nome já tem dono. Experimente outro!",
            },
          },
        });
      estado.perfil = { ...estado.perfil, ...dados, estado: "ativo" };
    }
    if (caminho === "/api/perfil") return rota.fulfill({ json: estado.perfil });
    if (caminho === "/api/preferencias") {
      if (requisicao.method() === "PUT") {
        const { somente_se_ausentes, ...dados } = requisicao.postDataJSON();
        if (!(somente_se_ausentes && estado.preferencias.salvas))
          estado.preferencias = {
            ...estado.preferencias,
            ...dados,
            salvas: true,
          };
      }
      return rota.fulfill({ json: estado.preferencias });
    }
    return rota.fulfill({ status: 404 });
  });
  return estado;
}

test("carrega as vinte ilustrações reais do frontend na seleção", async ({
  page,
}, informacoes) => {
  await preparar(page);
  await page.goto("/");
  const imagens = page.locator(".avatar-opcao img");
  await expect(imagens).toHaveCount(20);
  for (let indice = 0; indice < 20; indice++) {
    const imagem = imagens.nth(indice);
    await imagem.scrollIntoViewIfNeeded();
    await expect(imagem).toHaveAttribute(
      "src",
      `/avatares/${identificadores[indice]}.webp`,
    );
    await expect
      .poll(() =>
        imagem.evaluate(
          (elemento: HTMLImageElement) =>
            elemento.complete && elemento.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/avatares-ilustrados-${informacoes.project.name}.png`,
    fullPage: true,
  });
});

test("primeiro acesso exige nome e avatar e conclui perfil", async ({
  page,
}, informacoes) => {
  await preparar(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Seu nome no jogo" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Vamos nessa" }),
  ).toBeDisabled();
  await page.getByLabel("Nome de usuário").fill("José_42");
  await page.getByRole("button", { name: "Capivara zen", exact: true }).click();
  await page.getByRole("button", { name: "Vamos nessa" }).click();
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Perfil", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Seu perfil" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/perfil-${informacoes.project.name}.png`,
    fullPage: true,
  });
});

test("nome indisponível permite corrigir sem perder avatar", async ({
  page,
}) => {
  await preparar(page);
  await page.goto("/");
  await page.getByLabel("Nome de usuário").fill("Ocupado");
  await page.getByRole("button", { name: "Capivara zen", exact: true }).click();
  await page.getByRole("button", { name: "Vamos nessa" }).click();
  await expect(page.getByRole("alert")).toContainText("já tem dono");
  await expect(page.getByRole("alert")).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Capivara zen", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("preferências da conta prevalecem e alterações persistem", async ({
  page,
}, informacoes) => {
  await preparar(page, true, true);
  await page.goto("/");
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page.getByRole("combobox", { name: /^Tema/ })).toHaveValue(
    "escuro",
  );
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await page.screenshot({
    path: `test-results/preferencias-escuras-${informacoes.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("combobox", { name: /^Tema/ }).selectOption("claro");
  await page.getByLabel("Silenciar tudo").check();
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Preferências salvas" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page.getByRole("combobox", { name: /^Tema/ })).toHaveValue(
    "claro",
  );
  await expect(page.getByLabel("Silenciar tudo")).toBeChecked();
});

test("cancelar exclusão não envia pedido e falha permite tentar novamente", async ({
  page,
}) => {
  const estado = await preparar(page, true, true);
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Excluir minha conta" }).click();
  await expect(
    page.getByRole("button", { name: "Cancelar", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  expect(estado.excluir).toBe(0);
  await page.getByRole("button", { name: "Excluir minha conta" }).click();
  await expect(
    page.getByRole("button", { name: "Excluir definitivamente" }),
  ).toBeDisabled();
  await page.getByLabel("Digite EXCLUIR").fill("EXCLUIR");
  estado.falhar = true;
  await page.getByRole("button", { name: "Excluir definitivamente" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Tente novamente",
  );
  estado.falhar = false;
  await page.getByRole("button", { name: "Excluir definitivamente" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Conta excluída" }),
  ).toBeVisible();
  expect(estado.excluir).toBe(2);
});

test("conta nova herda escolhas locais", async ({ page }) => {
  const estado = await preparar(page);
  await page.addInitScript(() =>
    localStorage.setItem(
      "decifra_preferencias",
      JSON.stringify({
        tema: "escuro",
        musica_id: null,
        volume_musica: 15,
        volume_interface: 70,
        volume_eventos: 70,
        silenciado: false,
        movimentos_reduzidos: true,
      }),
    ),
  );
  await page.goto("/");
  await expect.poll(() => estado.preferencias.salvas).toBe(true);
  expect(estado.preferencias.tema).toBe("escuro");
  expect(estado.preferencias.volume_musica).toBe(15);
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
});

test("visitante guarda preferências somente no navegador", async ({ page }) => {
  const estado = await preparar(page);
  estado.logado = false;
  let escritas = 0;
  page.on("request", (requisicao) => {
    if (
      requisicao.url().includes("/api/preferencias") &&
      requisicao.method() === "PUT"
    )
      escritas++;
  });
  await page.goto("/configuracoes");
  await page.getByRole("combobox", { name: /^Tema/ }).selectOption("escuro");
  await page.getByRole("button", { name: "Salvar preferências" }).click();
  await page.reload();
  await expect(page.getByRole("combobox", { name: /^Tema/ })).toHaveValue(
    "escuro",
  );
  expect(escritas).toBe(0);
});

test("sessão expirada limpa a tela privada e oferece nova entrada", async ({
  page,
}) => {
  const estado = await preparar(page, true, true);
  await page.goto("/perfil");
  await page.getByLabel("Nome de usuário").fill("OutroNome");
  estado.logado = false;
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(
    page.getByRole("link", { name: /Entrar com Google/ }),
  ).toBeVisible();
  await expect(
    page.getByText("jogador@example.test", { exact: true }),
  ).toHaveCount(0);
});

test("cadastro pendente pode excluir sem escolher nome e avatar", async ({
  page,
}) => {
  await preparar(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Excluir minha conta" }).click();
  await page.getByLabel("Digite EXCLUIR").fill("EXCLUIR");
  await page.getByRole("button", { name: "Excluir definitivamente" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Conta excluída" }),
  ).toBeVisible();
});
