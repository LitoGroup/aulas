import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getAssessmentForTaking, NotEnrolledError } from "@/server/services/grading";
import { TakeForm } from "./take-form";

export default async function TakeAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);

  let assessment;
  try {
    assessment = await getAssessmentForTaking(actor, id);
  } catch (e) {
    if (e instanceof NotEnrolledError) redirect("/courses");
    throw e;
  }
  if (!assessment) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
        &larr; Painel
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{assessment.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Nota de corte: <strong>{assessment.passingScore}%</strong> ·{" "}
          {assessment.questions.length} questao(oes)
        </p>
      </div>

      {assessment.questions.length === 0 ? (
        <p className="text-sm text-slate-500">Esta avaliacao ainda nao tem questoes.</p>
      ) : (
        <TakeForm assessmentId={assessment.id} questions={assessment.questions} />
      )}
    </div>
  );
}
