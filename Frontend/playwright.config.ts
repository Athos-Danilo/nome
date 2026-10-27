import { defineConfig } from "@playwright/test";

const python =
  process.env.DECIFRA_PYTHON ??
  (process.platform === "win32"
    ? "../Backend/.venv/Scripts/python.exe"
    : "python");

export default defineConfig({
  testDir: "./testes-navegador",
  testMatch: "**/*.teste.ts",
  workers: 1,
  timeout: 30000,
  reporter: [
    ["line"],
    ["json", { outputFile: "test-results/interrupcoes.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5175",
    browserName: "chromium",
    channel: process.env.DECIFRA_CANAL_NAVEGADOR ?? "msedge",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "computador", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "tablet-emulado",
      testIgnore: "**/*avancadas*",
      use: { viewport: { width: 820, height: 1180 }, hasTouch: true },
    },
    {
      name: "celular-emulado",
      testIgnore: "**/*avancadas*",
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
  webServer: [
    {
      command: `"${python}" -m uvicorn experimentos.interrupcoes.api:aplicacao --app-dir ../Backend --host 127.0.0.1 --port 8770`,
      url: "http://127.0.0.1:8770/openapi.json",
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 5175",
      url: "http://127.0.0.1:5175/provas/interrupcoes.html",
      reuseExistingServer: false,
    },
  ],
});
