import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Padrão node (serviços/banco). Os testes de componente pedem jsdom pelo
    // comentário `@vitest-environment jsdom` no topo do arquivo.
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // Banco remoto (Supabase) + Argon2 sao lentos; evita timeouts e
    // reduz contencao rodando os arquivos em sequencia.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
