import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getManageCourse, NotOwnerError } from "@/server/services/course";
import { NewAssessmentForm } from "@/app/(app)/manage/assessment-forms";

export default async function NewAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await requireRole(["TEACHER", "ADMIN"]);
  try {
    const course = await getManageCourse(actor, id);
    if (!course) notFound();
  } catch (e) {
    if (e instanceof NotOwnerError) notFound();
    throw e;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href={`/manage/courses/${id}`} className="text-sm text-indigo-600 hover:underline">
        &larr; Voltar ao curso
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900">Nova avaliacao</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <NewAssessmentForm courseId={id} />
      </div>
    </div>
  );
}
