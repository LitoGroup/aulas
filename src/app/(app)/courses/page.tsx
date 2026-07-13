import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { listPublishedCourses } from "@/server/services/course";
import { CourseCover } from "@/components/course-cover";
import { PageHeader } from "@/components/ui";

export default async function CatalogPage() {
  await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const courses = await listPublishedCourses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explorar cursos"
        subtitle="Escolha um curso e comece a estudar no seu ritmo."
      />

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[color:var(--muted)]">
          Nenhum curso publicado ainda.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <CourseCover title={c.title} seed={c.id} className="aspect-[16/9]" />
              <div className="space-y-2 p-4">
                <h2 className="font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--brand-ink)]">
                  {c.title}
                </h2>
                <p className="line-clamp-2 text-sm text-[color:var(--muted)]">
                  {c.description || "Sem descrição"}
                </p>
                <p className="pt-1 text-xs text-[color:var(--muted)]">Por {c.owner.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
