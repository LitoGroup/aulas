import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { NewCourseForm } from "../../course-forms";

export default async function NewCoursePage() {
  await requireRole(["TEACHER", "ADMIN"]);
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/manage" className="text-sm text-indigo-600 hover:underline">
        &larr; Voltar
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900">Novo curso</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <NewCourseForm />
      </div>
    </div>
  );
}
