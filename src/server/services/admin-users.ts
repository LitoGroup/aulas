import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "../db";
import { hashPassword } from "../auth/password";

export class AdminForbiddenError extends Error {
  constructor() {
    super("Apenas administradores podem executar esta acao");
    this.name = "AdminForbiddenError";
  }
}

export interface Actor {
  id: string;
  role: Role;
}

const passwordSchema = z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(128);

/** ADMIN define uma nova senha para qualquer usuario. */
export async function adminSetPassword(
  actor: Actor,
  userId: string,
  newPassword: string,
): Promise<void> {
  if (actor.role !== "ADMIN") throw new AdminForbiddenError();
  const password = passwordSchema.parse(newPassword);
  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

/** Lista todos os usuarios com contagem de matriculas (area de alunos do admin). */
export async function listUsers(actor: Actor) {
  if (actor.role !== "ADMIN") throw new AdminForbiddenError();
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });
}
