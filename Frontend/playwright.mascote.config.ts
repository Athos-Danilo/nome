import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./testes-navegador",
  testMatch: /mascote\.fluxo\.ts/,
  workers: 1,
  timeout: 25000,
  expect: { timeout: 5000 },
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:5181",
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
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 5181",
    url: "http://127.0.0.1:5181",
    reuseExistingServer: false,
  },
});
