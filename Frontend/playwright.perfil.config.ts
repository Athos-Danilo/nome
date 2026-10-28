import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./testes-navegador",
  testMatch: "perfil.fluxo.ts",
  workers: 1,
  timeout: 15000,
  expect: { timeout: 3000 },
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:5176",
    channel: process.env.DECIFRA_CANAL_NAVEGADOR ?? "msedge",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "computador", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "tablet",
      use: { viewport: { width: 820, height: 1180 }, hasTouch: true },
    },
    {
      name: "celular",
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 5176",
    url: "http://127.0.0.1:5176",
    reuseExistingServer: false,
  },
});
