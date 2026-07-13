import { prisma } from "../db";

export class NotEnrolledError extends Error {
  constructor() {
    super("Aluno nao esta matriculado neste curso");
    this.name = "NotEnrolledError";
  }
}

export interface CourseProgress {
  total: number;
  completed: number;
  percent: number;
  completedLessonIds: string[];
}

/** Encontra a matricula (ancora do progresso) a partir da aula. */
async function enrollmentForLesson(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });
  if (!lesson) throw new NotEnrolledError();
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
    select: { id: true },
  });
  if (!enrollment) throw new NotEnrolledError();
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
