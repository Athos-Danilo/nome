import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
async function preparar(pagina: Page, demo = false) {
  let ativa = false;
  let envio = 0;
  let falhar = false;
  let tema = "claro";
  const estado = {
    partida_id: "partida",
    estado: "em_andamento",
    origem: demo ? "demonstracao" : "normal",
    versao: 1,
    pontuacao: 0,
    quantidade_palavras: 3,
    rodadas_concluidas: 0,
    acertos: 0,
    resumo_rodadas: [] as object[],
    rodada_atual: {
      rodada_id: "rodada-1",
      ordem: 1,
      dificuldade: "facil",
      tematicas: ["animais"],
      posicoes: [null, null, null, null],
      dica_atual: 1,
      dicas_reveladas: ["Primeira pista: animal doméstico."],
      pontos_disponiveis: 100,
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
  await pagina.route("**/api/**", async (r) => {
    const p = new URL(r.request().url()).pathname;
    const body = r.request().postDataJSON();
    if (p === "/api/autenticacao/sessao")
      return r.fulfill(
        demo
          ? {
              status: 401,
              json: {
                erro: {
                  codigo: "SESSAO_NECESSARIA",
                  mensagem: "Entre com Google",
                },
              },
            }
          : {
              json: { ...perfil, token_csrf: "csrf", expira_em: "2099-01-01" },
            },
      );
    if (p === "/api/perfil") return r.fulfill({ json: perfil });
    if (p === "/api/avatares")
      return r.fulfill({
        json: [
          {
            id: "capivara_zen",
            nome: "Capivara zen",
            recurso: "/avatares/capivara_zen.webp",
          },
        ],
      });
    if (p === "/api/preferencias") {
      if (r.request().method() === "PUT") tema = body.tema;
      return r.fulfill({
        json: {
          tema,
          musica_id: null,
          volume_musica: 70,
          volume_interface: 70,
          volume_eventos: 70,
          silenciado: false,
          movimentos_reduzidos: false,
          salvas: true,
        },
      });
    }
    if (p === "/api/visitantes")
      return r.fulfill({
        json: {
          pode_iniciar: !ativa,
          demonstracao_utilizada: ativa,
          vinculada: false,
          demonstracao: null,
          token_csrf: "visitante",
        },
      });
    if (p === "/api/partidas/em-aberto")
      return r.fulfill({ json: { individual: ativa ? estado : null } });
    if (p === "/api/partidas/individual/configuracao")
      return r.fulfill({
        json: {
          pode_iniciar: true,
          plano_id: "plano",
          disponiveis: body.quantidade_palavras,
          quantidade_solicitada: body.quantidade_palavras,
          sequencia_solicitada: ["facil", "facil", "facil"],
          distribuicao_disponivel: { facil: 3 },
          alternativas: [],
          configuracao: {
            ...body,
            sequencia_efetiva: ["facil", "facil", "facil"],
          },
        },
      });
    if (
      p === "/api/partidas/individual" ||
      p === "/api/demonstracoes" ||
      (p === "/api/demonstracoes/jogo" && r.request().method() === "POST")
    ) {
      ativa = true;
      return r.fulfill({ json: estado });
    }
    if (p === "/api/partidas/partida" || p === "/api/demonstracoes/jogo")
      return r.fulfill({ json: estado });
    if (
      p.endsWith("/palpites") ||
      p.endsWith("/dicas") ||
      p.endsWith("/desistencia-palavra") ||
      p.endsWith("/encerramento")
    ) {
      envio++;
      if (falhar) {
        falhar = false;
        return r.abort("failed");
      }
      if (p.endsWith("/encerramento")) {
        estado.estado = "abandonada";
        estado.acao = {
          resultado: "abandonada",
          pontos: 0,
          limpar_montagem: false,
        };
        estado.rodada_atual = null!;
        estado.versao++;
        return r.fulfill({ json: estado });
      }
      if (
        p.endsWith("/dicas") ||
        (p.endsWith("/palpites") && body.palpite !== "GATO")
      ) {
        estado.rodada_atual.dica_atual = Math.min(
          5,
          estado.rodada_atual.dica_atual + 1,
        );
        estado.rodada_atual.dicas_reveladas = Array.from(
          { length: estado.rodada_atual.dica_atual },
          (_, i) => `Pista ${i + 1}: animal doméstico.`,
        );
        estado.rodada_atual.pontos_disponiveis =
          120 - estado.rodada_atual.dica_atual * 20;
        estado.acao = {
          resultado: p.endsWith("/dicas") ? "dica_revelada" : "erro",
          pontos: 0,
          limpar_montagem: p.endsWith("/palpites"),
        };
      } else {
        const acertou = p.endsWith("/palpites");
        const pontos = acertou ? estado.rodada_atual.pontos_disponiveis : 0;
        estado.pontuacao += pontos;
        estado.acertos += Number(acertou);
        estado.rodadas_concluidas++;
        estado.resumo_rodadas.push({
          ordem: estado.rodadas_concluidas,
          estado: acertou ? "acertada" : "desistida",
          resposta: "GATO",
          pontos,
          dicas_utilizadas: estado.rodada_atual.dica_atual,
        });
        estado.acao = {
          resultado: acertou ? "acerto" : "desistencia",
          pontos,
          limpar_montagem: false,
          resposta_revelada: "GATO",
        };
        if (estado.rodadas_concluidas === 3) {
          estado.estado = "concluida";
          estado.rodada_atual = null!;
        } else
          estado.rodada_atual = {
            ...estado.rodada_atual,
            rodada_id: `rodada-${estado.rodadas_concluidas + 1}`,
            ordem: estado.rodadas_concluidas + 1,
            dica_atual: 1,
            dicas_reveladas: ["Primeira pista: animal doméstico."],
            pontos_disponiveis: 100,
          };
      }
      estado.versao++;
      return r.fulfill({ json: estado });
    }
    return r.fulfill({
      status: 404,
      json: { erro: { codigo: "AUSENTE", mensagem: p } },
    });
  });
  return {
    estado,
    envios: () => envio,
    falhar: () => {
      falhar = true;
    },
  };
}
async function comecar(p: Page) {
  await p.goto("/jogar/individual/novo");
  await p.getByRole("button", { name: "Conferir desafio" }).click();
  await p.getByRole("button", { name: "Começar partida" }).click();
  await expect(p.getByText("Dica 1 de 5", { exact: true })).toBeVisible();
}
async function digitar(p: Page, palpite: string) {
  await p.getByRole("group", { name: "Área de montagem" }).click();
  await p.keyboard.type(palpite);
  await p.getByRole("button", { name: "Enviar palpite" }).click();
}
test("configura, acerta três palavras e mostra os pontos confirmados", async ({
  page,
}) => {
  const c = await preparar(page);
  await comecar(page);
  for (let i = 0; i < 3; i++) {
    await digitar(page, "GATO");
    await expect(
      page.getByRole("heading", { name: "Boa descoberta!" }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: i === 2 ? "Ver resultado" : "Próxima palavra",
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Você decifrou!" }),
  ).toBeVisible();
  await expect(page.getByTestId("pontos-resultado")).toHaveText("300");
  expect(c.envios()).toBe(3);
  await page.reload();
  await expect(page.getByTestId("pontos-resultado")).toHaveText("300");
});
test("erro limpa montagem e quinta dica mantém tentativas", async ({
  page,
}) => {
  await preparar(page);
  await comecar(page);
  await digitar(page, "CASA");
  await expect(page.getByText("Dica 2 de 5", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Posição 1: vazia", exact: true }),
  ).toBeVisible();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Pedir outra dica" }).click();
  await digitar(page, "CASA");
  await expect(page.getByText("Dica 5 de 5", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Pedir outra dica" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Ver dicas anteriores" }).click();
  await expect(
    page.getByText("Pista 1: animal doméstico.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Posição 1: vazia", exact: true }),
  ).toBeVisible();
});
test("desistir da palavra revela solução e encerrar pede confirmação", async ({
  page,
}) => {
  await preparar(page);
  await comecar(page);
  await page.getByRole("button", { name: "Desistir desta palavra" }).click();
  await expect(
    page.getByRole("dialog", { name: "Revelar esta palavra?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Revelar e seguir" }).click();
  await expect(
    page.getByRole("heading", { name: "Uma descoberta para guardar" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Próxima palavra" }).click();
  await page.getByRole("button", { name: "Encerrar partida" }).click();
  await page.getByRole("button", { name: "Encerrar definitivamente" }).click();
  await expect(
    page.getByRole("heading", { name: "Até a próxima descoberta" }),
  ).toBeVisible();
  await expect(page.getByTestId("pontos-resultado")).toHaveText("0");
});
test("falha de envio mantém tentativa e oferece reenvio explícito", async ({
  page,
}) => {
  const c = await preparar(page);
  await comecar(page);
  c.falhar();
  await digitar(page, "GATO");
  await expect(
    page.getByRole("button", { name: "Reenviar mesma ação" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reenviar mesma ação" }).click();
  await expect(
    page.getByRole("heading", { name: "Boa descoberta!" }),
  ).toBeVisible();
  expect(c.envios()).toBe(2);
});
test("demonstração usa o mesmo painel e convida para a conta", async ({
  page,
}) => {
  await preparar(page, true);
  await page.goto("/jogar/demonstracao");
  await page.getByRole("button", { name: "Começar demonstração" }).click();
  await digitar(page, "GATO");
  await expect(
    page.getByRole("heading", { name: "Boa descoberta!" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Guardar com Google" }),
  ).toBeVisible();
});
test("painel cabe na tela e respeita movimentos reduzidos e tema escuro", async ({
  page,
}) => {
  await preparar(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await comecar(page);
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test("cliques repetidos não enviam duas ações", async ({ page }) => {
  const c = await preparar(page);
  await comecar(page);
  await page.getByRole("group", { name: "Área de montagem" }).click();
  await page.keyboard.type("GATO");
  await page
    .getByRole("button", { name: "Enviar palpite" })
    .evaluate((botao: HTMLButtonElement) => {
      botao.click();
      botao.click();
    });
  await expect(
    page.getByRole("heading", { name: "Boa descoberta!" }),
  ).toBeVisible();
  expect(c.envios()).toBe(1);
});
test("captura visual da arena e da configuração", async ({ page }, info) => {
  await preparar(page);
  await page.goto("/jogar/individual/novo");
  await expect(
    page.getByRole("button", { name: "Conferir desafio" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/solo-configuracao-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await comecar(page);
  await page.screenshot({
    path: `test-results/solo-arena-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
});

test("catálogo 003 preenche expressões reais com sinais, acentos e algarismos", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const catalogo: {
    palavras: { id: string; resposta: string; dicas: string[] }[];
  } = JSON.parse(
    readFileSync(
      new URL("../../Data/palavras/filmes-e-series-003.json", import.meta.url),
      "utf8",
    ),
  );
  const exemplos = catalogo.palavras.filter((p) =>
    [
      "1917",
      "homem-aranha",
      "wall-e",
      "monstros-s-a",
      "bob-esponja-calca-quadrada",
      "moana-um-mar-de-aventuras",
      "o-show-de-truman-o-show-da-vida",
      "que-horas-ela-volta",
      "gilmore-girls-tal-mae-tal-filha",
      "brooklyn-nine-nine",
      "brilho-eterno-de-uma-mente-sem-lembrancas",
      "adeus-lenin",
    ].includes(p.id),
  );
  expect(exemplos).toHaveLength(12);
  const controle = await preparar(page);
  let palavra = exemplos[0];
  let enviado = "";
  function estado() {
    return {
      ...controle.estado,
      rodada_atual: {
        ...controle.estado.rodada_atual,
        tematicas: ["filmes-e-series"],
        dificuldade: palavra.dificuldade,
        posicoes: Array.from(palavra.resposta, (c) =>
          /[\p{L}0-9]/u.test(c) ? null : c,
        ),
        dicas_reveladas: [palavra.dicas[0]],
      },
    };
  }
  await page.route("**/api/partidas/partida", (r) =>
    r.fulfill({ json: estado() }),
  );
  await page.route("**/api/partidas/partida/palpites", (r) => {
    enviado = r.request().postDataJSON().palpite;
    return r.fulfill({ json: estado() });
  });
  for (palavra of exemplos) {
    enviado = "";
    await page.goto("/jogar/individual/partida");
    await expect(page.locator(".cartao-dica > p")).toHaveText(palavra.dicas[0]);
    const letras = Array.from(palavra.resposta).filter((c) =>
      /[\p{L}0-9]/u.test(c),
    );
    await expect(page.locator(".quadradinho")).toHaveCount(letras.length);
    await page
      .getByRole("textbox", { name: "Digitação pelo teclado" })
      .fill(palavra.resposta);
    await page.getByRole("button", { name: "Enviar palpite" }).click();
    await expect.poll(() => enviado).toBe(palavra.resposta);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    if (palavra.id === "brilho-eterno-de-uma-mente-sem-lembrancas")
      await page.screenshot({
        path: `test-results/catalogo-expressao-longa-${info.project.name}.png`,
        fullPage: true,
        animations: "disabled",
      });
  }
});
