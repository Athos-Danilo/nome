import { test, expect, type Page } from "@playwright/test";

async function mockarGalera(
  page: Page,
  falharConexao = false,
  tresPessoas = false,
) {
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
  if (tresPessoas) {
    estado.participantes[0].nome = "Apresentador_1234567";
    estado.participantes[1].nome = "Participante_1234567";
    estado.participantes.push({
      participante_id: "p3",
      nome: "Convidado_1234567890",
      avatar_id: "aurelio_apresentador",
      anfitriao: false,
      pontuacao: 0,
    });
    estado.ordem_primeira_sessao.push("p3");
  }
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
            ordem: estado.ordem_primeira_sessao,
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
          if (tresPessoas)
            estado.painel.palavras = [
              "BRILHO ETERNO DE UMA MENTE SEM LEMBRANÇAS",
              "O SENHOR DOS ANÉIS: A SOCIEDADE DO ANEL",
              "GILMORE GIRLS: TAL MÃE, TAL FILHA",
            ].map((resposta) =>
              Array.from(resposta, (c) => (/[\p{L}0-9]/u.test(c) ? null : c)),
            );
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

test("três participantes e três expressões longas preservam painel e teclado no tema escuro", async ({
  page,
}, info) => {
  await mockarGalera(page, false, true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/jogar/galera/partida");
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await page.getByRole("button", { name: "Iniciar desafio" }).click();
  await page.getByRole("button", { name: "Liberar painel" }).click();
  await expect(page.locator(".placar-galera > li")).toHaveCount(3);
  await expect(page.locator(".palavra-painel")).toHaveCount(3);
  await page.getByRole("button", { name: "Selecionar palavra 3" }).click();
  await expect(
    page.getByRole("button", { name: "Tentar palavra completa" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("textbox", { name: "Digitação pelo teclado" })
    .fill("GILMORE GIRLS: TAL MÃE, TAL FILHA");
  await expect(
    page.getByRole("button", { name: "Enviar palpite" }),
  ).toBeEnabled();
  const contraste = await page
    .locator('.quadradinho[aria-pressed="true"]')
    .evaluate((botao) => {
      function luz(cor: string) {
        const canais = cor
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((n) => n / 255)
          .map((n) =>
            n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4,
          );
        return canais[0] * 0.2126 + canais[1] * 0.7152 + canais[2] * 0.0722;
      }
      const letra = luz(
          getComputedStyle(botao.querySelector(".caractere")!).color,
        ),
        fundo = luz(getComputedStyle(botao).backgroundColor);
      return (Math.max(letra, fundo) + 0.05) / (Math.min(letra, fundo) + 0.05);
    });
  expect(contraste).toBeGreaterThanOrEqual(4.5);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Enviar palpite" })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `test-results/acabamento-galera-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
});

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
