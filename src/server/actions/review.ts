"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/rbac";
import {
  submitReview,
  NotEnrolledError,
  CourseNotFinishedError,
} from "@/server/services/review";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function submitReviewAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const courseId = String(formData.get("courseId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!courseId) return { error: "Curso inválido" };

  try {
    await submitReview(actor.id, courseId, {
      rating: formData.get("rating"),
      comment: formData.get("comment") ? String(formData.get("comment")) : null,
    });
  } catch (e) {
    if (e instanceof NotEnrolledError) return { error: "Você não está matriculado neste curso" };
    if (e instanceof CourseNotFinishedError) {
      return { error: "A pesquisa abre quando você concluir todas as aulas" };
    }
    if (e && typeof e === "object" && "issues" in e) {
      const issues = (e as { issues: { message: string }[] }).issues;
      return { error: issues[0]?.message ?? "Dados inválidos" };
    }
    return { error: "Não foi possível enviar sua avaliação" };
  }

  if (slug) revalidatePath(`/courses/${slug}`);
  revalidatePath("/manage");
  return { success: "Obrigado! Sua avaliação foi registrada." };
}
