import { test, expect, type Page } from "@playwright/test";

async function mockarGalera(page: Page, falharConexao = false) {
  let falhaPendente = falharConexao;
  const perfil = {
    jogador_id: "j",
    estado: "ativo",
    nome_usuario: "Ana",
    email: "ana@example.test",
    avatar_id: "capivara_zen",
  };
  const estado = {
    partida_id: "partida",
    estado: "preparada",
    versao: 0,
    configuracao: {
      dificuldade: "facil",
      quantidade_sessoes: 2,
      modo_tematicas: "manual",
      tematicas: ["objetos", "animais"],
    },
    participantes: [
      {
        participante_id: "p1",
        nome: "Ana",
        avatar_id: "capivara_zen",
        anfitriao: true,
        pontuacao: 0,
      },
      {
        participante_id: "p2",
        nome: "Beto",
        avatar_id: "coruja_sabia",
        anfitriao: false,
        pontuacao: 0,
      },
    ],
    ordem_primeira_sessao: ["p1", "p2"],
    painel: null as null | Record<string, unknown>,
    resumo_sessoes: [] as unknown[],
    tempo_total_ms: 0,
    resultado_galera: null as string | null,
    motivo_encerramento: null as string | null,
  };
  await page.route("**/api/**", async (r) => {
    const caminho = new URL(r.request().url()).pathname;
    if (caminho === "/api/autenticacao/sessao")
      return r.fulfill({
        json: { ...perfil, token_csrf: "token", expira_em: "2099-01-01" },
      });
    if (caminho === "/api/perfil") return r.fulfill({ json: perfil });
    if (caminho === "/api/avatares")
      return r.fulfill({
        json: estado.participantes.map((p) => ({
          id: p.avatar_id,
          nome: p.nome,
          recurso: `/avatares/${p.avatar_id}.webp`,
        })),
      });
    if (caminho === "/api/preferencias")
      return r.fulfill({
        json: {
          tema: "claro",
          paleta: "roxa",
          musica_id: null,
          volume_musica: 70,
          volume_interface: 70,
          volume_eventos: 70,
          silenciado: false,
          movimentos_reduzidos: true,
          salvas: true,
        },
      });
    if (caminho.endsWith("/conexoes") && falhaPendente) {
      falhaPendente = false;
      return r.fulfill({
        status: 503,
        json: {
          erro: {
            codigo: "DADOS_INDISPONIVEIS",
            mensagem: "Falha temporária de teste.",
          },
        },
      });
    }
    if (caminho.includes("/galera/partida")) {
      if (caminho.endsWith("/acoes")) {
        const d = r.request().postDataJSON();
        estado.versao++;
        if (d.tipo === "iniciar") {
          estado.estado = "em_andamento";
          estado.painel = {
            estado: "em_andamento",
            versao: estado.versao,
            sessao: 1,
            sessao_id: "sessao",
            tematica: "objetos",
            ordem: ["p1", "p2"],
            participante_atual: "p1",
            pontuacoes: { p1: 0, p2: 0 },
            lideres: [],
            concordantes: [],
            extra: false,
            dificuldade: "facil",
            bloqueadas: [],
            palavras: [
              [null, null, null, null],
              [null, null, null, null, null, null, null],
            ],
            tempo_ativo_ms: 0,
          };
          estado.resumo_sessoes = [
            {
              numero: 1,
              tematica: "objetos",
              estado: "apresentada",
              desempate: false,
              tempo_ativo_ms: 0,
            },
          ];
        } else if (d.tipo === "letra" && d.valor === "A") {
          estado.participantes[0].pontuacao = 400;
          estado.painel = {
            ...estado.painel,
            palavras: [
              [null, "A", null, "A"],
              [null, "A", null, null, null, null, "A"],
            ],
            bloqueadas: ["A"],
          };
        } else if (d.tipo === "encerrar") {
          estado.estado = "abandonada";
          estado.resultado_galera = "vencedor";
          estado.motivo_encerramento = "desistencia";
          estado.painel = {
            ...estado.painel,
            estado: "concluida",
            participante_atual: null,
            lideres: ["p1"],
            palavras: [Array.from("CASA"), Array.from("MADEIRA")],
          };
        }
      }
      return r.fulfill({
        json: {
          ...estado,
          ...(caminho.endsWith("/tempo")
            ? { relogio_servidor_ms: Date.now() }
            : {}),
        },
      });
    }
    return r.fulfill({ json: { individual: null } });
  });
}

test("joga no painel, recupera recarga e confirma desistência", async ({
  page,
}, info) => {
  await mockarGalera(page);
  await page.goto("/jogar/galera/partida");
  await page.getByRole("button", { name: "Iniciar desafio" }).click();
  await expect(
    page.getByRole("dialog").locator(".aurelio-animado"),
  ).toHaveAttribute("data-reacao", "sorteio");
  await page.getByRole("button", { name: "Liberar painel" }).click();
  await expect(
    page.getByRole("heading", { name: "É a vez de Ana" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tecla A", exact: true }).click();
  await expect(page.getByTestId("placar-p1")).toContainText("400");
  await expect(
    page.locator(".anfitriao-galera .aurelio-animado"),
  ).toHaveAttribute("data-reacao", "comemoracao");
  await page.reload();
  await expect(page.getByTestId("placar-p1")).toContainText("400");
  await expect(
    page.getByRole("button", { name: "Tecla A", exact: true }),
  ).toBeDisabled();
  await page.screenshot({
    path: `test-results/painel-galera-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Encerrar partida", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar encerramento" }).click();
  await expect(
    page.getByRole("heading", { name: "Resultado da galera" }),
  ).toBeVisible();
  await expect(page.locator(".final-galera .aurelio-animado")).toHaveAttribute(
    "data-reacao",
    "resultado",
  );
  await expect(
    page.getByRole("paragraph").filter({ hasText: /^MADEIRA$/ }),
  ).toBeVisible();
});

test("reconcilia falha inicial de conexão sem abandonar a partida", async ({
  page,
}) => {
  await mockarGalera(page, true);
  await page.goto("/jogar/galera/partida");
  await page.getByRole("button", { name: "Iniciar desafio" }).click();
  await page.getByRole("button", { name: "Liberar painel" }).click();
  await expect(
    page.getByRole("button", { name: "Reconciliar painel" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reconciliar painel" }).click();
  await page.getByRole("button", { name: "Tecla A", exact: true }).click();
  await expect(page.getByTestId("placar-p1")).toContainText("400");
});

test("sair pelo menu encerra e voltar mostra o resultado", async ({ page }) => {
  await mockarGalera(page);
  await page.goto("/jogar/galera/partida");
  await page.getByRole("button", { name: "Iniciar desafio" }).click();
  await page.getByRole("button", { name: "Liberar painel" }).click();
  await page.getByRole("link", { name: "Início", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar encerramento" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/jogar/galera/partida");
  await expect(
    page.getByRole("heading", { name: "Resultado da galera" }),
  ).toBeVisible();
});
