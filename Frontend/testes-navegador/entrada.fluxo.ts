import { expect, test, type Page } from "@playwright/test";
const tecla = (pagina: Page, letra: string) =>
  pagina.getByRole("button", { name: `Tecla ${letra}`, exact: true });
const posicao = (pagina: Page, numero: number) =>
  pagina.getByRole("button", { name: new RegExp(`^Posição ${numero}:`) });
async function abrir(pagina: Page, exemplo = "ARARA") {
  await pagina.goto("/provas/entrada.html");
  await pagina.getByLabel("Exemplo público").selectOption(exemplo);
}

test("monta por clique, bloqueia excesso e reabre ao remover", async ({
  page,
}) => {
  await abrir(page);
  for (let i = 0; i < 3; i++) await tecla(page, "A").click();
  await expect(tecla(page, "A")).toBeDisabled();
  await expect(tecla(page, "W")).toBeEnabled();
  await posicao(page, 2).click();
  await page.getByRole("button", { name: "Apagar posição" }).click();
  await expect(tecla(page, "A")).toBeEnabled();
  await tecla(page, "R").click();
  await expect(posicao(page, 2).locator(".caractere")).toHaveText("R");
});
test("envio incompleto não dispara ação e digitação preserva caixa alta", async ({
  page,
}) => {
  await abrir(page);
  await page.getByRole("button", { name: "Enviar palpite" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: /Preencha/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Palpite enviado")).toHaveText("Nenhum");
  await page.getByRole("group", { name: "Área de montagem" }).focus();
  await page.keyboard.type("arara");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Palpite enviado")).toHaveText("ARARA");
});
test("aplica e remove acento sem consumir outra vogal; C e Ç separados", async ({
  page,
}) => {
  await abrir(page, "MAÇÃ");
  for (const letra of ["M", "A", "Ç", "A"]) await tecla(page, letra).click();
  await expect(tecla(page, "A")).toBeDisabled();
  await expect(tecla(page, "C")).toBeEnabled();
  await posicao(page, 4).click();
  await page.getByRole("button", { name: "Aplicar til" }).click();
  await page.getByRole("button", { name: "Enviar palpite" }).click();
  await expect(page.getByLabel("Palpite enviado")).toHaveText("MAÇÃ");
  await page.getByRole("button", { name: "Remover acento" }).click();
  await expect(posicao(page, 4).locator(".caractere")).toHaveText("A");
});
test("composição Unicode insere uma letra, sem duplicar o evento final", async ({
  page,
}) => {
  await abrir(page, "MAÇÃ");
  await tecla(page, "M").click();
  await tecla(page, "A").click();
  await tecla(page, "Ç").click();
  const campo = page.getByLabel("Digitação pelo teclado");
  await campo.focus();
  await campo.dispatchEvent("compositionstart", { data: "" });
  await campo.evaluate((elemento) => {
    const campo = elemento as HTMLInputElement;
    const alterar = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    alterar.call(campo, "a\u0303");
    campo.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "a\u0303",
        isComposing: true,
        inputType: "insertCompositionText",
      }),
    );
  });
  await campo.dispatchEvent("compositionend", { data: "a\u0303" });
  await campo.evaluate((elemento) => {
    const campo = elemento as HTMLInputElement;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(campo, "ã");
    campo.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "ã",
        inputType: "insertText",
      }),
    );
  });
  await page.getByRole("button", { name: "Enviar palpite" }).click();
  await expect(page.getByLabel("Palpite enviado")).toHaveText("MAÇÃ");
  await expect(
    page.getByRole("status").filter({ hasText: /limite/ }),
  ).toHaveCount(0);
});
test("sinais fixos não exigem entrada e número continua obrigatório", async ({
  page,
}) => {
  await abrir(page, "WALL-E 3");
  const editor = page.getByRole("group", { name: "Área de montagem" });
  await editor.focus();
  await page.keyboard.type("walle");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Palpite enviado")).toHaveText("Nenhum");
  await tecla(page, "3").click();
  await page.getByRole("button", { name: "Enviar palpite" }).click();
  await expect(page.getByLabel("Palpite enviado")).toHaveText("WALL-E 3");
  await expect(page.getByLabel("Separador: -")).toBeVisible();
});
test("galera preserva posições reveladas e bloqueio não consome ação", async ({
  page,
}) => {
  await abrir(page, "GALERA");
  await expect(posicao(page, 1)).toBeDisabled();
  await expect(posicao(page, 4)).toBeDisabled();
  await page.getByRole("group", { name: "Área de montagem" }).focus();
  await page.keyboard.type("c");
  await expect(
    page.getByRole("status").filter({ hasText: /bloqueada/ }),
  ).toBeVisible();
  await expect(page.getByLabel("Palpite enviado")).toHaveText("Nenhum");
  await page.keyboard.type("as");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Palpite enviado")).toHaveText("CASA");
});
test("escolha isolada envia família da vogal e não preenche o painel", async ({
  page,
}) => {
  await abrir(page, "LETRA");
  await page.getByLabel("Digitação pelo teclado").fill("á");
  await expect(page.getByLabel("Letra escolhida")).toHaveText("A");
  await expect(posicao(page, 2).locator(".caractere")).toHaveText("");
  await expect(
    page.getByRole("button", { name: "Enviar palpite" }),
  ).toHaveCount(0);
});
test("arraste de uma tecla preenche apenas o alvo e não duplica clique", async ({
  page,
}) => {
  await abrir(page);
  await tecla(page, "R").scrollIntoViewIfNeeded();
  const origem = await tecla(page, "R").boundingBox();
  const destino = await posicao(page, 4).boundingBox();
  if (!origem || !destino) throw new Error("Controles ausentes");
  await page.mouse.move(
    origem.x + origem.width / 2,
    origem.y + origem.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    origem.x + origem.width / 2 + 12,
    origem.y + origem.height / 2,
    { steps: 3 },
  );
  await page.mouse.move(
    destino.x + destino.width / 2,
    destino.y + destino.height / 2,
    { steps: 20 },
  );
  await page.mouse.up();
  await expect(posicao(page, 4).locator(".caractere")).toHaveText("R");
  await expect(
    page.locator(".quadradinho .caractere").filter({ hasText: /^R$/ }),
  ).toHaveCount(1);
});
test("expressão longa, teclado acessível e movimentos reduzidos", async ({
  page,
}, info) => {
  await abrir(page, "LONGA");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByLabel("Digitação pelo teclado")
    .fill("o fabuloso destino de amélie poulain");
  await page.getByRole("button", { name: "Enviar palpite" }).click();
  await expect(page.getByLabel("Palpite enviado")).toHaveText(
    "O FABULOSO DESTINO DE AMÉLIE POULAIN",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/entrada-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Alternar tema" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await page.screenshot({
    path: `test-results/entrada-escura-${info.project.name}.png`,
    fullPage: true,
  });
});

test("repetir a vogal após composição continua sendo uma nova entrada", async ({
  page,
}) => {
  await abrir(page);
  const campo = page.getByLabel("Digitação pelo teclado");
  await campo.focus();
  await campo.dispatchEvent("compositionstart", { data: "" });
  await campo.evaluate((elemento) => {
    const campo = elemento as HTMLInputElement;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(campo, "a");
    campo.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "a",
        isComposing: true,
        inputType: "insertCompositionText",
      }),
    );
  });
  await campo.dispatchEvent("compositionend", { data: "a" });
  await page.keyboard.type("a");
  await expect(posicao(page, 1).locator(".caractere")).toHaveText("A");
  await expect(posicao(page, 2).locator(".caractere")).toHaveText("A");
});
test("colar texto além das posições não sobrescreve a última letra", async ({
  page,
}) => {
  await abrir(page);
  await page.getByLabel("Digitação pelo teclado").fill("araraz");
  await page.getByRole("button", { name: "Enviar palpite" }).click();
  await expect(page.getByLabel("Palpite enviado")).toHaveText("ARARA");
});
test("ação em andamento bloqueia teclado, montagem e envio", async ({
  page,
}) => {
  await abrir(page);
  await page.getByLabel("Simular ação em andamento").check();
  await expect(tecla(page, "A")).toBeDisabled();
  await expect(page.getByLabel("Digitação pelo teclado")).toBeDisabled();
  await page.getByRole("group", { name: "Área de montagem" }).focus();
  await page.keyboard.type("arara");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Palpite enviado")).toHaveText("Nenhum");
});
test("toque permite escolher posição, preencher e remover", async ({
  page,
}, info) => {
  test.skip(info.project.name === "computador", "Cenário de toque");
  await abrir(page);
  await posicao(page, 3).tap();
  await tecla(page, "R").tap();
  await expect(posicao(page, 3).locator(".caractere")).toHaveText("R");
  await posicao(page, 3).tap();
  await page.getByRole("button", { name: "Apagar posição" }).tap();
  await expect(posicao(page, 3).locator(".caractere")).toHaveText("");
});

test("arraste por toque respeita a espera e preenche o alvo", async ({
  page,
}, info) => {
  test.skip(info.project.name === "computador", "Cenário de toque");
  await abrir(page);
  await tecla(page, "R").scrollIntoViewIfNeeded();
  const origem = await tecla(page, "R").boundingBox();
  const destino = await posicao(page, 4).boundingBox();
  if (!origem || !destino) throw new Error("Controles ausentes");
  const sessao = await page.context().newCDPSession(page);
  const x = origem.x + origem.width / 2;
  const y = origem.y + origem.height / 2;
  await sessao.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await page.waitForTimeout(320);
  for (let passo = 1; passo <= 12; passo++) {
    const proporcao = passo / 12;
    await sessao.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: x + (destino.x + destino.width / 2 - x) * proporcao,
          y: y + (destino.y + destino.height / 2 - y) * proporcao,
        },
      ],
    });
  }
  await sessao.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await sessao.detach();
  await expect(posicao(page, 4).locator(".caractere")).toHaveText("R");
});

test("gesto rápido no teclado permite rolar sem inserir uma letra", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "celular", "Rolagem no celular");
  await abrir(page);
  await tecla(page, "R").scrollIntoViewIfNeeded();
  const origem = await tecla(page, "R").boundingBox();
  if (!origem) throw new Error("Tecla ausente");
  const antes = await page.evaluate(() => scrollY);
  const sessao = await page.context().newCDPSession(page);
  const x = origem.x + origem.width / 2;
  const y = origem.y + origem.height / 2;
  await sessao.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let passo = 1; passo <= 6; passo++)
    await sessao.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y - passo * 25 }],
    });
  await sessao.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await sessao.detach();
  await expect(
    page.locator(".quadradinho .caractere").filter({ hasText: /^[A-Z]$/ }),
  ).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(antes);
});
