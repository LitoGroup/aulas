import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Banco remoto (Supabase) + Argon2 sao lentos; evita timeouts e
    // reduz contencao rodando os arquivos em sequencia.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
