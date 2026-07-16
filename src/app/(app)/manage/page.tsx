import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { listCoursesByOwner } from "@/server/services/course";

export default async function ManagePage() {
  const actor = await requireRole(["TEACHER", "ADMIN"]);
  const courses = await listCoursesByOwner(actor.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[color:var(--ink)]">Meus cursos</h1>
        <Link
          href="/manage/courses/new"
          className="rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white "
        >
          Novo curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">Voce ainda nao criou cursos.</p>
      ) : (
        <ul className="divide-y divide-[color:var(--border)] rounded-xl border border-[color:var(--border)] bg-[var(--surface)]">
          {courses.map((c) => (
            <li key={c.id}>
              <Link
                href={`/manage/courses/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[color:var(--canvas)]"
              >
                <span className="font-medium text-[color:var(--ink)]">{c.title}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    c.isPublished
                      ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                      : "bg-[color:var(--canvas)] text-[color:var(--muted)]"
                  }`}
                >
                  {c.isPublished ? "Publicado" : "Rascunho"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
