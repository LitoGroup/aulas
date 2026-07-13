"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/rbac";
import { enroll } from "@/server/services/enrollment";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function enrollAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const courseId = String(formData.get("courseId"));
  const slug = String(formData.get("slug") ?? "");
  if (!courseId) return { error: "Curso invalido" };

  await enroll(actor.id, courseId);
  if (slug) revalidatePath(`/courses/${slug}`);
  revalidatePath("/dashboard");
  return { success: "Matricula realizada!" };
}
