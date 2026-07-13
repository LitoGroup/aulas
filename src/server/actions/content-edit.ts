"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/rbac";
import {
  updateModule,
  moveModule,
  deleteModule,
} from "@/server/services/module";
import {
  updateLesson,
  moveLesson,
  deleteLesson,
} from "@/server/services/lesson";
import { deleteQuestion } from "@/server/services/assessment";
import { lessonInputSchema } from "@/lib/validation/content";

export interface ActionState {
  error?: string;
}

const TEACHER = ["TEACHER", "ADMIN"] as const;

function revalidateCourse(courseId: string) {
  revalidatePath(`/manage/courses/${courseId}`);
}

export async function updateModuleAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  const moduleId = String(formData.get("moduleId"));
  const title = String(formData.get("title") ?? "");
  try {
    await updateModule(actor, moduleId, { title });
  } catch {
    return { error: "Não foi possível salvar o módulo" };
  }
  revalidateCourse(courseId);
  return {};
}

export async function moveModuleAction(formData: FormData): Promise<void> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  await moveModule(actor, String(formData.get("moduleId")), String(formData.get("dir")) as "up" | "down");
  revalidateCourse(courseId);
}

export async function deleteModuleAction(formData: FormData): Promise<void> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  await deleteModule(actor, String(formData.get("moduleId")));
  revalidateCourse(courseId);
}

export async function updateLessonAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  const lessonId = String(formData.get("lessonId"));
  const parsed = lessonInputSchema.safeParse({
    title: formData.get("title"),
    contentType: formData.get("contentType"),
    videoProvider: formData.get("videoProvider") || null,
    videoRef: formData.get("videoRef") || null,
    textBody: formData.get("textBody") || null,
    requiresPrevious: formData.get("requiresPrevious") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  try {
    await updateLesson(actor, lessonId, parsed.data);
  } catch {
    return { error: "Não foi possível salvar a aula" };
  }
  revalidateCourse(courseId);
  return {};
}

export async function moveLessonAction(formData: FormData): Promise<void> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  await moveLesson(actor, String(formData.get("lessonId")), String(formData.get("dir")) as "up" | "down");
  revalidateCourse(courseId);
}

export async function deleteLessonAction(formData: FormData): Promise<void> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  await deleteLesson(actor, String(formData.get("lessonId")));
  revalidateCourse(courseId);
}

export async function deleteQuestionAction(formData: FormData): Promise<void> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  const assessmentId = String(formData.get("assessmentId"));
  await deleteQuestion(actor, String(formData.get("questionId")));
  revalidatePath(`/manage/courses/${courseId}/assessments/${assessmentId}`);
}
