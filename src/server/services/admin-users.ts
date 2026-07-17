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

export class LastAdminError extends Error {
  constructor() {
    super("Nao e possivel remover o ultimo administrador");
    this.name = "LastAdminError";
  }
}

export class SelfActionError extends Error {
  constructor() {
    super("Voce nao pode executar esta acao sobre a sua propria conta");
    this.name = "SelfActionError";
  }
}

const ROLES = ["STUDENT", "TEACHER", "ADMIN"] as const;

/** ADMIN altera o papel de um usuario. Impede deixar o sistema sem administrador. */
export async function adminSetRole(actor: Actor, userId: string, role: Role) {
  if (actor.role !== "ADMIN") throw new AdminForbiddenError();
  if (!ROLES.includes(role)) throw new Error("Papel invalido");

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) throw new Error("Usuario nao encontrado");

  // Rebaixar um ADMIN so e permitido se sobrar outro ADMIN.
  if (target.role === "ADMIN" && role !== "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) throw new LastAdminError();
  }

  return prisma.user.update({ where: { id: userId }, data: { role } });
}

/** ADMIN exclui um usuario. Nao pode excluir a si mesmo nem o ultimo admin. */
export async function adminDeleteUser(actor: Actor, userId: string): Promise<void> {
  if (actor.role !== "ADMIN") throw new AdminForbiddenError();
  if (actor.id === userId) throw new SelfActionError();

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return;

  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) throw new LastAdminError();
  }

  await prisma.user.delete({ where: { id: userId } });
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
