import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { listCoursesByOwner } from "@/server/services/course";

export default async function ManagePage() {
  const actor = await requireRole(["TEACHER", "ADMIN"]);
  const courses = await listCoursesByOwner(actor.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Meus cursos</h1>
        <Link
          href="/manage/courses/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Novo curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-slate-500">Voce ainda nao criou cursos.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {courses.map((c) => (
            <li key={c.id}>
              <Link
                href={`/manage/courses/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <span className="font-medium text-slate-800">{c.title}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    c.isPublished
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
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
