import { z } from "zod";
import type { User } from "@prisma/client";
import { prisma } from "../db";
import { hashPassword, verifyPassword } from "../auth/password";

export class WrongPasswordError extends Error {
  constructor() {
    super("Senha atual incorreta");
    this.name = "WrongPasswordError";
  }
}

const nameSchema = z.string().trim().min(2, "Nome muito curto").max(120);
const passwordSchema = z.string().min(8, "A senha deve ter ao menos 8 caracteres").max(128);

export async function updateOwnProfile(
  userId: string,
  input: { name: string },
): Promise<User> {
  const name = nameSchema.parse(input.name);
  return prisma.user.update({ where: { id: userId }, data: { name } });
}

export async function changeOwnPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new WrongPasswordError();
  const ok = await verifyPassword(user.passwordHash, currentPassword);
  if (!ok) throw new WrongPasswordError();

  const password = passwordSchema.parse(newPassword);
  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

/**
 * Direito de acesso/portabilidade (LGPD Art. 18): reúne todos os dados
 * pessoais do titular num objeto exportável. Nunca inclui o hash de senha.
 */
export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      consentedAt: true,
      consentVersion: true,
      createdAt: true,
      enrollments: {
        select: {
          enrolledAt: true,
          course: { select: { title: true } },
          review: { select: { rating: true, comment: true, updatedAt: true } },
        },
      },
      attempts: {
        select: {
          score: true,
          passed: true,
          submittedAt: true,
          assessment: { select: { title: true } },
        },
      },
    },
  });
  if (!user) throw new Error("Usuario nao encontrado");

  return {
    geradoEm: new Date().toISOString(),
    perfil: {
      id: user.id,
      nome: user.name,
      email: user.email,
      papel: user.role,
      consentimentoEm: user.consentedAt,
      versaoConsentimento: user.consentVersion,
      cadastroEm: user.createdAt,
    },
    matriculas: user.enrollments.map((e) => ({
      curso: e.course.title,
      matriculadoEm: e.enrolledAt,
    })),
    avaliacoes: user.attempts.map((a) => ({
      prova: a.assessment.title,
      nota: a.score,
      aprovado: a.passed,
      enviadaEm: a.submittedAt,
    })),
    pesquisasDeSatisfacao: user.enrollments
      .filter((e) => e.review)
      .map((e) => ({
        curso: e.course.title,
        nota: e.review!.rating,
        comentario: e.review!.comment,
        respondidaEm: e.review!.updatedAt,
      })),
  };
}

/**
 * Direito de eliminação (LGPD Art. 18, VI). Exige a senha para confirmar.
 * As relações (matrículas, progresso, tentativas, tokens) são removidas em
 * cascata pelas FKs onDelete: Cascade.
 */
export async function deleteOwnAccount(userId: string, password: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new WrongPasswordError();
  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) throw new WrongPasswordError();
  await prisma.user.delete({ where: { id: userId } });
}
