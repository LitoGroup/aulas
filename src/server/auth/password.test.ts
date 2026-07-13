import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("gera um hash diferente do texto puro", async () => {
    const hash = await hashPassword("segredo123");
    expect(hash).not.toBe("segredo123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifica corretamente a senha certa e a errada", async () => {
    const hash = await hashPassword("segredo123");
    expect(await verifyPassword(hash, "segredo123")).toBe(true);
    expect(await verifyPassword(hash, "errada")).toBe(false);
  });

  it("gera hashes diferentes para a mesma senha (salt)", async () => {
    const a = await hashPassword("mesmaSenha");
    const b = await hashPassword("mesmaSenha");
    expect(a).not.toBe(b);
  });
});
