"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { createCourse, updateCourse, deleteCourse, NotOwnerError } from "@/server/services/course";
import { createModule } from "@/server/services/module";
import { createLesson } from "@/server/services/lesson";
import { courseInputSchema } from "@/lib/validation/course";
import { moduleInputSchema, lessonInputSchema } from "@/lib/validation/content";

export interface ActionState {
  error?: string;
}

const TEACHER = ["TEACHER", "ADMIN"] as const;

export async function deleteCourseAction(
  courseId: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const actor = await requireRole([...TEACHER]);
    await deleteCourse(actor, courseId);
  } catch (e) {
    if (e instanceof NotOwnerError) return { error: "Você não tem permissão sobre este curso" };
    return { error: "Não foi possível excluir o curso" };
  }
  revalidatePath("/manage");
  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createCourseAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole([...TEACHER]);
  const parsed = courseInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };

  const course = await createCourse(actor.id, parsed.data);
  redirect(`/manage/courses/${course.id}`);
}

export async function updateCourseAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole([...TEACHER]);
  const id = String(formData.get("id"));
  const parsed = courseInputSchema.partial().safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };

  await updateCourse(actor, id, {
    ...parsed.data,
    isPublished: formData.get("isPublished") === "on",
  });
  revalidatePath(`/manage/courses/${id}`);
  return {};
}

export async function createModuleAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  const parsed = moduleInputSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };

  await createModule(actor, courseId, parsed.data);
  revalidatePath(`/manage/courses/${courseId}`);
  return {};
}

export async function createLessonAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  const moduleId = String(formData.get("moduleId"));
  const parsed = lessonInputSchema.safeParse({
    title: formData.get("title"),
    contentType: formData.get("contentType"),
    videoProvider: formData.get("videoProvider") || null,
    videoRef: formData.get("videoRef") || null,
    textBody: formData.get("textBody") || null,
    requiresPrevious: formData.get("requiresPrevious") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };

  await createLesson(actor, moduleId, parsed.data);
  revalidatePath(`/manage/courses/${courseId}`);
  return {};
}
