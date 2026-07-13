"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import {
  createAssessment,
  addQuestion,
  InvalidQuestionError,
} from "@/server/services/assessment";
import { submitAttempt, type AttemptResult } from "@/server/services/grading";
import {
  assessmentInputSchema,
  questionInputSchema,
} from "@/lib/validation/assessment";

export interface ActionState {
  error?: string;
}

const TEACHER = ["TEACHER", "ADMIN"] as const;

export async function createAssessmentAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  const parsed = assessmentInputSchema.safeParse({
    title: formData.get("title"),
    passingScore: formData.get("passingScore"),
    moduleId: formData.get("moduleId") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };

  const assessment = await createAssessment(actor, courseId, parsed.data);
  redirect(`/manage/courses/${courseId}/assessments/${assessment.id}`);
}

export async function addQuestionAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole([...TEACHER]);
  const courseId = String(formData.get("courseId"));
  const assessmentId = String(formData.get("assessmentId"));
  const type = String(formData.get("type")) as "MULTIPLE_CHOICE" | "TRUE_FALSE";

  // Reconstroi as opcoes a partir do form.
  let options: { text: string; isCorrect: boolean }[];
  if (type === "TRUE_FALSE") {
    const correct = String(formData.get("correctTF")); // "V" ou "F"
    options = [
      { text: "Verdadeiro", isCorrect: correct === "V" },
      { text: "Falso", isCorrect: correct === "F" },
    ];
  } else {
    const texts = formData.getAll("optionText").map(String);
    const correctIndex = Number(formData.get("correctIndex"));
    options = texts
      .filter((t) => t.trim().length > 0)
      .map((t, i) => ({ text: t, isCorrect: i === correctIndex }));
  }

  const parsed = questionInputSchema.safeParse({
    statement: formData.get("statement"),
    type,
    options,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Questao invalida" };

  try {
    await addQuestion(actor, assessmentId, parsed.data);
  } catch (e) {
    if (e instanceof InvalidQuestionError) return { error: e.message };
    return { error: "Nao foi possivel adicionar a questao" };
  }
  revalidatePath(`/manage/courses/${courseId}/assessments/${assessmentId}`);
  return {};
}

export async function submitAttemptAction(
  assessmentId: string,
  answers: { questionId: string; selectedOptionId: string }[],
): Promise<{ result: AttemptResult } | { error: string }> {
  try {
    const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
    const result = await submitAttempt(actor, assessmentId, answers);
    revalidatePath(`/assessments/${assessmentId}`);
    return { result };
  } catch {
    return { error: "Nao foi possivel enviar suas respostas" };
  }
}
