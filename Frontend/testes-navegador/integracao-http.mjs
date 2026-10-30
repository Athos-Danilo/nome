import { chromium, expect } from "@playwright/test";
const origem = process.env.DECIFRA_ORIGEM_PROVA;
const navegador = await chromium.launch({
  channel: process.env.DECIFRA_CANAL_NAVEGADOR ?? "msedge",
  headless: true,
});
try {
  for (const demo of [false, true]) {
    const contexto = await navegador.newContext();
    const pagina = await contexto.newPage();
    if (!demo) {
      const inicio = await contexto.request.get(
        origem + "/api/autenticacao/google",
        { maxRedirects: 0 },
      );
      const estado = new URL(inicio.headers().location).searchParams.get(
        "state",
      );
      await contexto.request.get(
        origem +
          "/api/autenticacao/google/retorno?state=" +
          estado +
          "&code=codigo-teste",
        { maxRedirects: 0 },
      );
      const sessao = await (
        await contexto.request.get(origem + "/api/autenticacao/sessao")
      ).json();
      const resposta = await contexto.request.patch(origem + "/api/perfil", {
        headers: { Origin: origem, "X-Decifra-CSRF": sessao.token_csrf },
        data: { nome_usuario: "Jogador", avatar_id: "capivara_zen" },
      });
      expect(resposta.status()).toBe(200);
    }
    await pagina.goto(
      origem + (demo ? "/jogar/demonstracao" : "/jogar/individual/novo"),
    );
    if (demo)
      await pagina
        .getByRole("button", { name: "Começar demonstração" })
        .click();
    else {
      await pagina.getByRole("button", { name: "Conferir desafio" }).click();
      await pagina.getByRole("button", { name: "Começar partida" }).click();
    }
    for (let i = 0; i < 3; i++) {
      await expect(
        pagina.getByText("Dica 1 de 5", { exact: true }),
      ).toBeVisible();
      const dica = await pagina.locator(".cartao-dica>p").innerText();
      const indice = Number(dica.match(/item (\d+)/)[1]);
      const resposta = ["JAPÃO", "MAÇÃ", "CASA", "ÁGUA", "CÉU", "ARARA", "PÃO"][
        indice
      ];
      if (i === 0) {
        await pagina
          .getByRole("textbox", { name: "Digitação pelo teclado" })
          .fill(resposta.slice(0, 2));
        await expect(
          pagina.getByText("Montagem salva", { exact: true }),
        ).toBeVisible();
        await pagina
          .getByRole("button", { name: "Pausar partida", exact: true })
          .click();
        await pagina
          .getByRole("button", { name: "Confirmar pausa de 100 pontos" })
          .click();
        await expect(
          pagina.getByRole("heading", { name: "Suas pistas estão guardadas" }),
        ).toBeVisible();
        await pagina.reload();
        if (demo)
          await pagina
            .getByRole("button", { name: "Continuar demonstração" })
            .click();
        await pagina.getByRole("button", { name: "Retomar partida" }).click();
        await expect(
          pagina.getByRole("button", {
            name: `Posição 1: ${resposta[0]}`,
            exact: true,
          }),
        ).toBeVisible();
      }
      await pagina
        .getByRole("textbox", { name: "Digitação pelo teclado" })
        .fill(i === 0 ? resposta.slice(2) : resposta);
      await pagina.getByRole("button", { name: "Enviar palpite" }).click();
      await expect(
        pagina.getByRole("heading", { name: "Boa descoberta!" }),
      ).toBeVisible();
      await pagina
        .getByRole("button", {
          name: i === 2 ? "Ver resultado" : "Próxima palavra",
        })
        .click();
    }
    await expect(pagina.getByTestId("pontos-resultado")).toHaveText("200");
    const estadoFinal = await (
      await contexto.request.get(
        origem +
          (demo
            ? "/api/demonstracoes/jogo"
            : "/api/partidas/" + pagina.url().split("/").at(-1)),
      )
    ).json();
    expect(estadoFinal.pontuacao).toBe(200);
    expect(estadoFinal.acertos).toBe(3);
    expect(estadoFinal.quantidade_pausas).toBe(1);
    expect(estadoFinal.estado).toBe("concluida");
    expect(estadoFinal.tempo_total_ms).toBeGreaterThan(0);
    expect(estadoFinal.tempo_completo).toBe(true);
    expect(
      estadoFinal.resumo_rodadas.reduce((s, r) => s + r.tempo_ativo_ms, 0),
    ).toBe(estadoFinal.tempo_total_ms);
    const formatar = (ms) => {
      const s = Math.floor(ms / 1000);
      return [Math.floor(s / 60), s % 60]
        .map((n) => String(n).padStart(2, "0"))
        .join(":");
    };
    await expect(pagina.getByTestId("tempo-total")).toHaveText(
      formatar(estadoFinal.tempo_total_ms),
    );
    await pagina.screenshot({
      path: `test-results/tempo-integrado-${demo ? "demo" : "conta"}.png`,
      fullPage: true,
    });
    if (!demo) {
      await pagina.goto(origem + "/jogar/galera/novo");
      await pagina
        .getByRole("button", { name: "Adicionar participante" })
        .click();
      await pagina.getByLabel("Nome do convidado 1").fill("Amigo");
      await pagina.getByLabel("Quantidade de sessões").selectOption("1");
      await pagina.getByLabel("Temáticas").selectOption("manual");
      await pagina.getByLabel("Temática da sessão 1").selectOption("paises");
      await pagina
        .getByRole("button", { name: "Conferir minha galera" })
        .click();
      await pagina.getByRole("button", { name: "Preparar partida" }).click();
      await expect(
        pagina.getByRole("heading", { name: "Sua galera está reunida!" }),
      ).toBeVisible();
      await pagina.reload();
      await expect(
        pagina.getByRole("heading", { name: "Sua galera está reunida!" }),
      ).toBeVisible();
      const preparada = await (
        await contexto.request.get(
          origem + "/api/partidas/galera/" + pagina.url().split("/").at(-1),
        )
      ).json();
      expect(preparada.estado).toBe("preparada");
      expect(preparada.participantes).toHaveLength(2);
      expect(preparada.ordem_primeira_sessao).toHaveLength(2);
      expect(preparada).not.toHaveProperty("reservas");
      expect(preparada).not.toHaveProperty("respostas");
    }
    await contexto.close();
  }
} finally {
  await navegador.close();
}
