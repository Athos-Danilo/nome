import { defineConfig } from "@playwright/test";
import configuracao from "./playwright.menu.config";
export default defineConfig({
  ...configuracao,
  testMatch: "audio.fluxo.ts",
  timeout: 30000,
  use: { ...configuracao.use, baseURL: "http://127.0.0.1:5182" },
  webServer: {
    command: "npm run dev -- --port 5182",
    url: "http://127.0.0.1:5182",
    reuseExistingServer: false,
  },
});
