import type { Course, Enrollment } from "@prisma/client";
import { prisma } from "../db";

/** Matricula idempotente: usa a unique (userId, courseId). */
export async function enroll(userId: string, courseId: string): Promise<Enrollment> {
  return prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId },
  });
}

/**
 * Matricula o usuario em TODOS os cursos publicados (idempotente).
 * Usado no cadastro: todo aluno novo ja entra com acesso ao conteudo ativo.
 */
export async function autoEnrollAll(userId: string): Promise<number> {
  const published = await prisma.course.findMany({
    where: { isPublished: true },
    select: { id: true },
  });
  for (const course of published) {
    await enroll(userId, course.id);
  }
  return published.length;
}

export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const found = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
  return found !== null;
}

export async function listEnrollments(
  userId: string,
): Promise<(Enrollment & { course: Course })[]> {
  return prisma.enrollment.findMany({
    where: { userId },
    include: { course: true },
    orderBy: { enrolledAt: "desc" },
  });
}
