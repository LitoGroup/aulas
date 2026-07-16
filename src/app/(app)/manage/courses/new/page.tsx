import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { NewCourseForm } from "../../course-forms";

export default async function NewCoursePage() {
  await requireRole(["TEACHER", "ADMIN"]);
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/manage" className="text-sm text-[color:var(--brand-ink)] hover:underline">
        &larr; Voltar
      </Link>
      <h1 className="text-2xl font-semibold text-[color:var(--ink)]">Novo curso</h1>
      <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-6">
        <NewCourseForm />
      </div>
    </div>
  );
}
