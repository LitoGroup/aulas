import type { Lesson } from "@prisma/client";
import { prisma } from "../db";
import { assertCanEdit, type Actor } from "./course";
import { lessonInputSchema, type LessonInput } from "@/lib/validation/content";

/** Descobre o curso dono do modulo, para checar permissao. */
async function courseIdOfModule(moduleId: string): Promise<string> {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!mod) throw new Error("Modulo nao encontrado");
  return mod.courseId;
}

async function nextOrder(moduleId: string): Promise<number> {
  const last = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return last ? last.order + 1 : 0;
}

export async function createLesson(
  actor: Actor,
  moduleId: string,
  input: LessonInput,
): Promise<Lesson> {
  await assertCanEdit(actor, await courseIdOfModule(moduleId));
  const data = lessonInputSchema.parse(input);
  return prisma.lesson.create({
    data: {
      moduleId,
      title: data.title,
      order: await nextOrder(moduleId),
      contentType: data.contentType,
      videoProvider: data.videoProvider ?? null,
      videoRef: data.videoRef ?? null,
      textBody: data.textBody ?? null,
      requiresPrevious: data.requiresPrevious ?? false,
    },
  });
}

export async function updateLesson(
  actor: Actor,
  lessonId: string,
  input: LessonInput,
): Promise<Lesson> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true },
  });
  if (!lesson) throw new Error("Aula nao encontrada");
  await assertCanEdit(actor, await courseIdOfModule(lesson.moduleId));
  const data = lessonInputSchema.parse(input);
  return prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title: data.title,
      contentType: data.contentType,
      videoProvider: data.videoProvider ?? null,
      videoRef: data.videoRef ?? null,
      textBody: data.textBody ?? null,
      requiresPrevious: data.requiresPrevious ?? false,
    },
  });
}

/** Carrega a aula com o curso e as apostilas, para a tela de visualizacao. */
export function getLessonForViewer(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      attachments: true,
      module: { include: { course: { select: { id: true, slug: true, ownerId: true, title: true } } } },
    },
  });
}

export async function deleteLesson(actor: Actor, lessonId: string): Promise<void> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true },
  });
  if (!lesson) return;
  await assertCanEdit(actor, await courseIdOfModule(lesson.moduleId));
  await prisma.lesson.delete({ where: { id: lessonId } });
}
