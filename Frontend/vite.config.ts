import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/prova-api": "http://127.0.0.1:8770",
    },
  },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
