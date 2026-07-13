"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/rbac";
import { markLessonComplete } from "@/server/services/progress";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function markCompleteAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const lessonId = String(formData.get("lessonId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!lessonId) return { error: "Aula invalida" };

  try {
    await markLessonComplete(actor.id, lessonId);
  } catch {
    return { error: "Nao foi possivel marcar como concluida" };
  }

  revalidatePath(`/learn/${lessonId}`);
  if (slug) revalidatePath(`/courses/${slug}`);
  revalidatePath("/dashboard");
  return { success: "Aula concluida!" };
}
