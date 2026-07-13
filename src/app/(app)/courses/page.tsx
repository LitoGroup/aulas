import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { listPublishedCourses } from "@/server/services/course";

export default async function CatalogPage() {
  await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const courses = await listPublishedCourses();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Cursos disponiveis</h1>

      {courses.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum curso publicado ainda.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
            >
              <h2 className="font-semibold text-slate-900">{c.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {c.description || "Sem descricao"}
              </p>
              <p className="mt-3 text-xs text-slate-400">Por {c.owner.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
