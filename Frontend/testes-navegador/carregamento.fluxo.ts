import { expect, test } from "@playwright/test";
import { PADRAO } from "../src/funcionalidades/perfil/preferencias";

function criarPortao() {
  let liberar!: () => void;
  const promessa = new Promise<void>((resolve) => {
    liberar = resolve;
  });
  return { promessa, liberar };
}

test("carregamento inicial exibe peças do jogo e aviso progressivo de servidor despertando", async ({
  page,
}, info) => {
  await page.clock.install();
  const portaoSessao = criarPortao();
  await page.route("**/api/**", async (rota) => {
    const caminho = new URL(rota.request().url()).pathname;
    if (caminho === "/api/autenticacao/sessao") {
      await portaoSessao.promessa;
      return rota.fulfill({
        status: 401,
        json: {
          erro: { codigo: "SESSAO_NECESSARIA", mensagem: "Entre com Google." },
        },
      });
    }
    if (caminho === "/api/visitantes")
      return rota.fulfill({
        json: {
          pode_iniciar: true,
          demonstracao_utilizada: false,
          vinculada: false,
          demonstracao: null,
          token_csrf: "visitante",
        },
      });
    return rota.fulfill({ status: 404 });
  });

  await page.goto("/");
  const carregando = page.getByTestId("carregando-jogo");
  await expect(carregando).toBeVisible();
  await expect(carregando.locator(".peca-carregamento")).toHaveText([
    "D",
    "E",
    "C",
    "I",
    "F",
    "R",
    "A",
  ]);
  await expect(carregando).toContainText(
    "Preparando suas próximas descobertas…",
  );
  await page.screenshot({
    path: `test-results/carregamento/tela-inicial-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });

  await page.clock.runFor(4000);
  await expect(carregando).toContainText(/100 pontos/);

  await page.clock.runFor(8000);
  await expect(carregando).toContainText(
    /servidor gratuito pode estar despertando/i,
  );

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

  portaoSessao.liberar();
  await expect(
    page.getByRole("heading", { name: "Bora decifrar?" }),
  ).toBeVisible();
});

test("Solo lento mostra sincronização, dica e conferência de palpite sem alterar dimensões", async ({
  page,
}, info) => {
  await page.clock.install();
  let portaoConexao = criarPortao();
  let portaoDica = criarPortao();
  let portaoPalpite = criarPortao();

  const estado = {
    partida_id: "partida",
    estado: "em_andamento",
    origem: "normal",
    versao: 1,
    pontuacao: 0,
    quantidade_palavras: 3,
    rodadas_concluidas: 0,
    acertos: 0,
    quantidade_pausas: 0,
    relogio_servidor_ms: Date.now(),
    tempo_total_ms: 0,
    tempo_completo: true,
    resumo_rodadas: [] as object[],
    rodada_atual: {
      tempo_ativo_ms: 0,
      rodada_id: "rodada-1",
      ordem: 1,
      dificuldade: "facil",
      tematicas: ["animais"],
      posicoes: [null, null, null, null],
      dica_atual: 1,
      dicas_reveladas: ["Primeira pista: animal doméstico."],
      pontos_disponiveis: 100,
      rascunho: null as null | {
        revisao: number;
        letras: (string | null)[];
        selecionada: number;
      },
    },
    acao: undefined as object | undefined,
  };
  const perfil = {
    jogador_id: "jogador",
    estado: "ativo",
    nome_usuario: "Athos",
    email: "athos@example.test",
    avatar_id: "capivara_zen",
  };

  await page.route("**/api/**", async (rota) => {
    const caminho = new URL(rota.request().url()).pathname;
    if (caminho === "/api/autenticacao/sessao")
      return rota.fulfill({
        json: { ...perfil, token_csrf: "csrf", expira_em: "2099-01-01" },
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
        json: { ...PADRAO, paleta: "azul", silenciado: true, salvas: true },
      });
    if (caminho === "/api/partidas/partida")
      return rota.fulfill({ json: estado });
    if (caminho.endsWith("/conexoes")) {
      await portaoConexao.promessa;
      return rota.fulfill({ json: estado });
    }
    if (caminho.endsWith("/tempo"))
      return rota.fulfill({
        json: { ...estado, relogio_servidor_ms: Date.now() },
      });
    if (caminho.endsWith("/rascunho")) {
      const dados = rota.request().postDataJSON() as {
        letras: (string | null)[];
        selecionada: number;
        revisao_esperada: number;
      };
      estado.rodada_atual.rascunho = {
        revisao: dados.revisao_esperada + 1,
        letras: dados.letras,
        selecionada: dados.selecionada,
      };
      return rota.fulfill({ json: estado });
    }
    if (caminho.endsWith("/dicas")) {
      await portaoDica.promessa;
      estado.versao++;
      estado.rodada_atual.dica_atual = 2;
      estado.rodada_atual.pontos_disponiveis = 80;
      estado.rodada_atual.dicas_reveladas.push("Segunda pista: faz miau.");
      return rota.fulfill({ json: estado });
    }
    if (caminho.endsWith("/palpites")) {
      await portaoPalpite.promessa;
      estado.versao++;
      estado.pontuacao = 80;
      estado.rodadas_concluidas = 1;
      estado.acertos = 1;
      estado.acao = {
        resultado: "acerto",
        pontos: 80,
        resposta_revelada: "GATO",
        limpar_montagem: true,
      };
      return rota.fulfill({ json: estado });
    }
    return rota.fulfill({ json: { individual: null } });
  });

  await page.goto("/jogar/individual/partida");
  await expect(page.getByText("Dica 1 de 5", { exact: true })).toBeVisible();
  await page.clock.runFor(250);
  const indicador = page.getByTestId("indicador-processamento");
  await expect(indicador).toBeVisible();
  await expect(indicador).toContainText("Sincronizando a partida…");

  portaoConexao.liberar();
  await expect(indicador).toHaveCount(0);

  const alturaBase = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );

  await page.getByRole("button", { name: "Pedir outra dica" }).click();
  await expect(
    page.getByRole("button", { name: "Buscando dica…" }),
  ).toBeDisabled();
  await expect(indicador).toBeVisible();
  await expect(indicador).toContainText("Abrindo a próxima dica…");

  portaoDica.liberar();
  await expect(page.getByText("Dica 2 de 5", { exact: true })).toBeVisible();
  await expect(indicador).toHaveCount(0);

  await page
    .getByRole("textbox", { name: "Digitação pelo teclado" })
    .fill("GATO");
  await page.getByRole("button", { name: "Enviar palpite" }).click();

  await expect(
    page.getByRole("button", { name: "Conferindo palpite…" }),
  ).toBeDisabled();
  await expect(indicador).toBeVisible();
  await expect(indicador).toContainText("MODO SOLO");
  await expect(indicador).toContainText("Conferindo seu palpite…");

  await page.screenshot({
    path: `test-results/carregamento/solo-processando-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });

  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeLessThanOrEqual(alturaBase + 1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

  await page.clock.runFor(4000);
  await expect(indicador).toContainText(/Servidor processando devagar/i);

  portaoPalpite.liberar();
  await expect(
    page.getByRole("heading", { name: "Boa descoberta!" }),
  ).toBeVisible();
  await expect(indicador).toHaveCount(0);
});

test("Galera lenta destaca letra escolhida, palpite do participante e início da partida", async ({
  page,
}, info) => {
  const portaoInicio = criarPortao();
  const portaoLetra = criarPortao();
  const portaoPalpite = criarPortao();

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
      quantidade_sessoes: 1,
      modo_tematicas: "manual",
      tematicas: ["animais"],
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

  await page.route("**/api/**", async (rota) => {
    const caminho = new URL(rota.request().url()).pathname;
    if (caminho === "/api/autenticacao/sessao")
      return rota.fulfill({
        json: { ...perfil, token_csrf: "token", expira_em: "2099-01-01" },
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
          {
            id: "coruja_sabia",
            nome: "Coruja sábia",
            recurso: "/avatares/coruja_sabia.webp",
          },
        ],
      });
    if (caminho === "/api/preferencias")
      return rota.fulfill({
        json: {
          ...PADRAO,
          tema: "escuro",
          paleta: "roxa",
          silenciado: true,
          salvas: true,
        },
      });
    if (caminho.includes("/galera/partida")) {
      if (caminho.endsWith("/acoes")) {
        const d = rota.request().postDataJSON();
        if (d.tipo === "iniciar") {
          await portaoInicio.promessa;
          estado.versao = 1;
          estado.estado = "em_andamento";
          estado.painel = {
            estado: "em_andamento",
            versao: 1,
            sessao: 1,
            sessao_id: "sessao",
            tematica: "animais",
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
              [null, null, null, null],
            ],
            tempo_ativo_ms: 0,
          };
        } else if (d.tipo === "letra") {
          await portaoLetra.promessa;
          estado.versao = 2;
          estado.participantes[0].pontuacao = 200;
          estado.painel = {
            ...estado.painel,
            bloqueadas: ["A"],
            palavras: [
              [null, "A", null, "A"],
              [null, "A", null, null],
            ],
          };
        } else if (d.tipo === "palpite") {
          await portaoPalpite.promessa;
          estado.versao = 3;
          estado.participantes[0].pontuacao = 400;
          estado.painel = {
            ...estado.painel,
            palavras: [
              ["C", "A", "S", "A"],
              [null, "A", null, null],
            ],
          };
        }
      }
      return rota.fulfill({
        json: {
          ...estado,
          ...(caminho.endsWith("/tempo")
            ? { relogio_servidor_ms: Date.now() }
            : {}),
        },
      });
    }
    return rota.fulfill({ json: { individual: null } });
  });

  await page.goto("/jogar/galera/partida");
  await page.getByRole("button", { name: "Iniciar desafio" }).click();

  await expect(
    page.getByRole("button", { name: "Iniciando desafio…" }),
  ).toBeDisabled();
  const indicador = page.getByTestId("indicador-processamento");
  await expect(indicador).toBeVisible();
  await expect(indicador).toContainText("Montando o desafio no servidor…");

  portaoInicio.liberar();
  await page.getByRole("button", { name: "Liberar painel" }).click();
  await expect(indicador).toHaveCount(0);

  const teclaA = page.getByRole("button", { name: "Tecla A", exact: true });
  await teclaA.click();

  await expect(teclaA).toBeDisabled();
  await expect(teclaA).toHaveAttribute("data-processando", "true");
  await expect(indicador).toBeVisible();
  await expect(indicador.locator(".peca-destaque")).toHaveText("A");
  await expect(indicador).toContainText("Procurando a letra A no painel…");
  await expect(indicador).toContainText("Ana");

  await page.screenshot({
    path: `test-results/carregamento/galera-letra-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });

  portaoLetra.liberar();
  await expect(page.getByTestId("placar-p1")).toContainText("200");
  await expect(teclaA).not.toHaveAttribute("data-processando", "true");
  await expect(indicador).toHaveCount(0);

  await page
    .getByRole("button", { name: "Tentar palavra completa", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Digitação pelo teclado" })
    .fill("CS");
  await page.getByRole("button", { name: "Enviar palpite" }).click();

  await expect(indicador).toBeVisible();
  await expect(indicador).toContainText("Conferindo o palpite de Ana…");

  portaoPalpite.liberar();
  await expect(page.getByTestId("placar-p1")).toContainText("400");
  await expect(indicador).toHaveCount(0);
});

test("indicadores respeitam redução de movimentos sem animações ativas nem rolagem horizontal", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const portao = criarPortao();
  await page.route("**/api/**", async (rota) => {
    const caminho = new URL(rota.request().url()).pathname;
    if (caminho === "/api/autenticacao/sessao") {
      await portao.promessa;
      return rota.fulfill({
        status: 401,
        json: { erro: { codigo: "SESSAO_NECESSARIA", mensagem: "Entre." } },
      });
    }
    return rota.fulfill({ status: 404 });
  });

  await page.goto("/");
  await expect(page.getByTestId("carregando-jogo")).toBeVisible();
  expect(
    await page
      .locator("main")
      .evaluate(
        (el) =>
          el
            .getAnimations({ subtree: true })
            .filter((a) => a.playState === "running").length,
      ),
  ).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  portao.liberar();
});
