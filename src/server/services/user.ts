import type { User } from "@prisma/client";
import { prisma } from "../db";
import { hashPassword } from "../auth/password";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";

export class EmailAlreadyInUseError extends Error {
  constructor() {
    super("E-mail ja cadastrado");
    this.name = "EmailAlreadyInUseError";
  }
}

export async function createUser(
  input: RegisterInput,
  opts?: { consentVersion?: string },
): Promise<User> {
  // Valida e normaliza (email lowercase, trims) antes de tocar o banco.
  const data = registerSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) throw new EmailAlreadyInUseError();

  const passwordHash = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      // LGPD: registra quando/qual versao o titular aceitou (se informado)
      ...(opts?.consentVersion
        ? { consentedAt: new Date(), consentVersion: opts.consentVersion }
        : {}),
      // role default STUDENT vem do schema Prisma
    },
  });
}
