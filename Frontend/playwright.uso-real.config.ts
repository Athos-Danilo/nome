import { defineConfig } from "@playwright/test";
import configuracao from "./playwright.menu.config";

export default defineConfig({
  ...configuracao,
  testMatch: "uso-real.fluxo.ts",
  outputDir: "./test-results/uso-real",
  timeout: 60000,
  use: { ...configuracao.use, baseURL: "http://127.0.0.1:5184" },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5184 --strictPort",
    url: "http://127.0.0.1:5184",
    reuseExistingServer: false,
  },
});
