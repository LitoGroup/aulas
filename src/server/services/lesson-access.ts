import { prisma } from "../db";
import { getCourseProgress } from "./progress";

export interface OrderedLesson {
  id: string;
  requiresPrevious: boolean;
}

/**
 * Funcao pura: dada a lista ordenada de aulas (ordem global do curso) e o
 * conjunto de aulas concluidas, retorna um mapa lessonId -> bloqueada?.
 * Regra: uma aula com requiresPrevious fica bloqueada se a aula imediatamente
 * anterior nao estiver concluida. A primeira aula nunca bloqueia.
 */
export function computeLessonLocks(
  lessons: OrderedLesson[],
  completed: Set<string>,
): Map<string, boolean> {
  const locks = new Map<string, boolean>();
  lessons.forEach((lesson, index) => {
    if (index === 0 || !lesson.requiresPrevious) {
      locks.set(lesson.id, false);
      return;
    }
    const previous = lessons[index - 1];
    locks.set(lesson.id, !completed.has(previous.id));
  });
  return locks;
}

/** Retorna a lista de aulas do curso na ordem global (modulo.order, lesson.order). */
export async function getOrderedLessons(courseId: string): Promise<OrderedLesson[]> {
  const modules = await prisma.module.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    select: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, requiresPrevious: true },
      },
    },
  });
  return modules.flatMap((m) => m.lessons);
}

/** Versao com banco: a aula esta liberada para este aluno? */
export async function isLessonUnlocked(
  userId: string,
  courseId: string,
  lessonId: string,
): Promise<boolean> {
  const lessons = await getOrderedLessons(courseId);
  const { completedLessonIds } = await getCourseProgress(userId, courseId);
  const locks = computeLessonLocks(lessons, new Set(completedLessonIds));
  return locks.get(lessonId) === false;
}
