import { prisma } from "../db";

export class CourseUnavailableError extends Error {
  constructor() {
    super("Curso indisponivel");
    this.name = "CourseUnavailableError";
  }
}

export interface CourseProgress {
  total: number;
  completed: number;
  percent: number;
  completedLessonIds: string[];
}

/**
 * A matricula (ancora do progresso) a partir da aula.
 *
 * Nao exige matricula previa: qualquer aluno tem acesso ao conteudo, e a
 * matricula e criada aqui, de forma invisivel, no primeiro progresso. A trava
 * de rascunho fica nos vetores de conteudo (ver aula, baixar, prova); marcar
 * progresso nao revela nada, entao aqui basta ancorar.
 */
async function enrollmentForLesson(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!lesson) throw new CourseUnavailableError();

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
    update: {},
    create: { userId, courseId: lesson.module.courseId },
    select: { id: true },
  });
  return enrollment.id;
}

/** Marca a aula como concluida (idempotente via unique enrollmentId_lessonId). */
export async function markLessonComplete(
  userId: string,
  lessonId: string,
): Promise<void> {
  const enrollmentId = await enrollmentForLesson(userId, lessonId);
  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
    update: { status: "COMPLETED", completedAt: new Date() },
    create: { enrollmentId, lessonId, status: "COMPLETED", completedAt: new Date() },
  });
}

export async function getCourseProgress(
  userId: string,
  courseId: string,
): Promise<CourseProgress> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });

  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { id: true },
  });
  const total = lessons.length;

  let completedLessonIds: string[] = [];
  if (enrollment) {
    const done = await prisma.lessonProgress.findMany({
      where: { enrollmentId: enrollment.id, status: "COMPLETED" },
      select: { lessonId: true },
    });
    const lessonSet = new Set(lessons.map((l) => l.id));
    completedLessonIds = done
      .map((d) => d.lessonId)
      .filter((id) => lessonSet.has(id));
  }

  const completed = completedLessonIds.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent, completedLessonIds };
}
