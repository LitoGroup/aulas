import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getAssessmentForEditing, AssessmentForbiddenError } from "@/server/services/assessment";
import { QuestionForm } from "@/app/(app)/manage/assessment-forms";
import { DeleteQuestionButton } from "@/app/(app)/manage/content-edit-forms";

export default async function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string; assessmentId: string }>;
}) {
  const { id, assessmentId } = await params;
  const actor = await requireRole(["TEACHER", "ADMIN"]);

  let assessment;
  try {
    assessment = await getAssessmentForEditing(actor, assessmentId);
  } catch (e) {
    if (e instanceof AssessmentForbiddenError) notFound();
    throw e;
  }
  if (!assessment) notFound();

  return (
    <div className="space-y-6">
      <Link href={`/manage/courses/${id}`} className="text-sm text-[color:var(--brand-ink)] hover:underline">
        &larr; Voltar ao curso
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--ink)]">{assessment.title}</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Nota de corte: <strong>{assessment.passingScore}%</strong> ·{" "}
          {assessment.questions.length} questao(oes)
        </p>
      </div>

      {assessment.questions.length > 0 && (
        <ol className="space-y-3">
          {assessment.questions.map((q, i) => (
            <li key={q.id} className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-[color:var(--ink)]">
                  {i + 1}. {q.statement}
                </p>
                <DeleteQuestionButton
                  courseId={id}
                  assessmentId={assessmentId}
                  questionId={q.id}
                />
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {q.options.map((o) => (
                  <li
                    key={o.id}
                    className={o.isCorrect ? "font-medium text-[color:var(--success)]" : "text-[color:var(--ink-soft)]"}
                  >
                    {o.isCorrect ? "" : "• "}
                    {o.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}

      <div>
        <h2 className="mb-2 text-lg font-medium text-[color:var(--ink)]">Nova questao</h2>
        <QuestionForm courseId={id} assessmentId={assessmentId} />
      </div>
    </div>
  );
}
