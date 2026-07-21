import { prisma } from "../db";
import { reviewInputSchema, type ReviewInput } from "@/lib/validation/review";
import { getCourseProgress } from "./progress";

export class NotEnrolledError extends Error {
  constructor() {
    super("Aluno nao esta matriculado neste curso");
    this.name = "NotEnrolledError";
  }
}

export class CourseNotFinishedError extends Error {
  constructor() {
    super("A pesquisa abre ao concluir todas as aulas do curso");
    this.name = "CourseNotFinishedError";
  }
}

export interface ReviewSummary {
  total: number;
  /** Média das notas, uma casa decimal. Zero quando ainda não há respostas. */
  media: number;
  /** Quantas respostas por nota, de 1 a 5. */
  distribuicao: Record<1 | 2 | 3 | 4 | 5, number>;
}

/**
 * Média e distribuição a partir das notas cruas.
 *
 * Separada da consulta para poder ser exercitada sem banco — é onde mora a
 * aritmética que erra fácil (arredondamento, divisão por zero).
 */
export function resumirNotas(notas: number[]): ReviewSummary {
  const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary["distribuicao"];
  for (const n of notas) {
    if (n >= 1 && n <= 5) distribuicao[n as 1 | 2 | 3 | 4 | 5]++;
  }
  const total = notas.length;
  const media = total === 0 ? 0 : Math.round((notas.reduce((s, n) => s + n, 0) / total) * 10) / 10;
  return { total, media, distribuicao };
}

/** A matrícula do aluno no curso, ou null se não houver. */
async function matriculaDe(userId: string, courseId: string) {
  return prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
}

/** A resposta do próprio aluno, para preencher o formulário. */
export async function getOwnReview(userId: string, courseId: string) {
  const matricula = await matriculaDe(userId, courseId);
  if (!matricula) return null;
  return prisma.courseReview.findUnique({
    where: { enrollmentId: matricula.id },
    select: { rating: true, comment: true, updatedAt: true },
  });
}

/**
 * Grava (ou atualiza) a resposta do aluno.
 *
 * A exigência de curso concluído é conferida aqui, no servidor: esconder o
 * formulário na interface não impede um envio direto.
 */
export async function submitReview(
  userId: string,
  courseId: string,
  input: ReviewInput,
): Promise<void> {
  const matricula = await matriculaDe(userId, courseId);
  if (!matricula) throw new NotEnrolledError();

  const progresso = await getCourseProgress(userId, courseId);
  if (progresso.total === 0 || progresso.percent < 100) throw new CourseNotFinishedError();

  const data = reviewInputSchema.parse(input);
  await prisma.courseReview.upsert({
    where: { enrollmentId: matricula.id },
    update: { rating: data.rating, comment: data.comment ?? null },
    create: { enrollmentId: matricula.id, rating: data.rating, comment: data.comment ?? null },
  });
}

/**
 * Resumo de vários cursos de uma vez, para a lista de gestão.
 * Uma consulta só: com uma por curso a lista viraria N+1.
 */
export async function resumirCursos(courseIds: string[]): Promise<Map<string, ReviewSummary>> {
  const saida = new Map<string, ReviewSummary>();
  if (courseIds.length === 0) return saida;

  const linhas = await prisma.courseReview.findMany({
    where: { enrollment: { courseId: { in: courseIds } } },
    select: { rating: true, enrollment: { select: { courseId: true } } },
  });

  const porCurso = new Map<string, number[]>();
  for (const l of linhas) {
    const id = l.enrollment.courseId;
    const atual = porCurso.get(id);
    if (atual) atual.push(l.rating);
    else porCurso.set(id, [l.rating]);
  }
  for (const id of courseIds) saida.set(id, resumirNotas(porCurso.get(id) ?? []));
  return saida;
}

/** Notas e comentários de um curso, para o professor. */
export async function listCourseReviews(courseId: string) {
  const respostas = await prisma.courseReview.findMany({
    where: { enrollment: { courseId } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      updatedAt: true,
      enrollment: { select: { user: { select: { name: true, email: true } } } },
    },
  });

  return {
    resumo: resumirNotas(respostas.map((r) => r.rating)),
    respostas: respostas.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      updatedAt: r.updatedAt,
      aluno: r.enrollment.user.name,
      email: r.enrollment.user.email,
    })),
  };
}
