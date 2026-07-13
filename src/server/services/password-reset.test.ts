import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import {
  requestReset,
  resetPassword,
  InvalidTokenError,
} from "./password-reset";
import { verifyPassword } from "../auth/password";

const marker = `reset_${Date.now()}`;
const email = `${marker}@example.com`;

beforeAll(async () => {
  await createUser({ name: "Reset User", email, password: "senhaAntiga1" });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("fluxo de reset de senha", () => {
  it("troca a senha com um token valido", async () => {
    const token = await requestReset(email);
    expect(token).toBeTruthy();

    await resetPassword(token!, "senhaNova123");

    const user = await prisma.user.findUnique({ where: { email } });
    expect(await verifyPassword(user!.passwordHash, "senhaNova123")).toBe(true);
  });

  it("rejeita token ja utilizado", async () => {
    const token = await requestReset(email);
    await resetPassword(token!, "outraSenha123");
    await expect(resetPassword(token!, "maisUma123")).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it("rejeita token expirado", async () => {
    const token = await requestReset(email);
    // Expira manualmente o token recem-criado.
    const { createHash } = await import("node:crypto");
    const tokenHash = createHash("sha256").update(token!).digest("hex");
    await prisma.passwordResetToken.updateMany({
      where: { tokenHash },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await expect(resetPassword(token!, "qualquer123")).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it("nao revela se o e-mail existe (retorna null silenciosamente)", async () => {
    const token = await requestReset("naoexiste@example.com");
    expect(token).toBeNull();
  });
});
