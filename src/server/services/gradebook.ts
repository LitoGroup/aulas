import type { Role } from "@prisma/client";
import { prisma } from "../db";
import { getCourseProgress } from "./progress";

export class GradebookForbiddenError extends Error {
  constructor() {
    super("Sem permissao sobre este curso");
    this.name = "GradebookForbiddenError";
  }
}

export interface Actor {
  id: string;
  role: Role;
}

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  progressPercent: number;
  scores: Record<string, { best: number | null; passed: boolean }>;
}

export interface Gradebook {
  assessments: { id: string; title: string }[];
  students: StudentRow[];
}

export async function getCourseGradebook(
  actor: Actor,
  courseId: string,
): Promise<Gradebook> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { ownerId: true },
  });
  if (!course || (actor.role !== "ADMIN" && course.ownerId !== actor.id)) {
    throw new GradebookForbiddenError();
  }

  const assessments = await prisma.assessment.findMany({
    where: { courseId },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { enrolledAt: "asc" },
  });

  // Todas as tentativas do curso, para calcular a melhor nota por aluno/avaliacao.
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { assessment: { courseId } },
    select: { assessmentId: true, userId: true, score: true, passed: true },
  });

  const best = new Map<string, { best: number; passed: boolean }>();
  for (const a of attempts) {
    const key = `${a.userId}:${a.assessmentId}`;
    const cur = best.get(key);
    if (!cur || a.score > cur.best) {
      best.set(key, { best: a.score, passed: a.passed || (cur?.passed ?? false) });
    } else if (a.passed) {
      best.set(key, { best: cur.best, passed: true });
    }
  }

  const students: StudentRow[] = [];
  for (const e of enrollments) {
    const u = e.user;
    const progress = await getCourseProgress(u.id, courseId);
    const scores: StudentRow["scores"] = {};
    for (const a of assessments) {
      const entry = best.get(`${u.id}:${a.id}`);
      scores[a.id] = entry
        ? { best: entry.best, passed: entry.passed }
        : { best: null, passed: false };
    }
    students.push({
      id: u.id,
      name: u.name,
      email: u.email,
      progressPercent: progress.percent,
      scores,
    });
  }

  return { assessments, students };
}
