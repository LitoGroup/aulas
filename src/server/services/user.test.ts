import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../db";
import { createUser, EmailAlreadyInUseError } from "./user";

const marker = `test_${Date.now()}`;
const email = `${marker}@example.com`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("createUser", () => {
  it("cria usuario com senha em hash e role STUDENT por padrao", async () => {
    const user = await createUser({ name: "Fulano", email, password: "segredo123" });
    expect(user.role).toBe("STUDENT");
    expect(user.email).toBe(email);
    // senha nunca fica em texto puro
    expect(user.passwordHash).not.toBe("segredo123");
    expect(user.passwordHash.length).toBeGreaterThan(20);
  });

  it("rejeita e-mail duplicado", async () => {
    await expect(
      createUser({ name: "Outro", email, password: "outrasenha1" }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });

  it("valida entrada invalida (senha curta)", async () => {
    await expect(
      createUser({ name: "X", email: `${marker}2@example.com`, password: "123" }),
    ).rejects.toThrow();
  });
});
