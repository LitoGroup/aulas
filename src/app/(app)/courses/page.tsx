import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { listPublishedCourses } from "@/server/services/course";
import { CourseCover } from "@/components/course-cover";
import { PageHeader } from "@/components/ui";
import { SHOWCASE_COURSES } from "@/lib/showcase-courses";

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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <CourseCover title={c.title} seed={c.id} src={c.coverUrl} className="aspect-[16/9]" />
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

      {/* Vitrine: cursos do site oficial (bloqueados, com CTA de aquisição) */}
      <section className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl font-bold text-[color:var(--ink)]">
            Amplie sua formação em manutenção
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Cursos oficiais da Lito Aviation Academy. Adquira e desbloqueie o acesso.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {SHOWCASE_COURSES.map((c) => (
            <div
              key={c.url}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
            >
              {/* Capa com cadeado */}
              <div className="relative aspect-[16/9] overflow-hidden bg-[color:var(--navy-fill)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a1420]/55 backdrop-blur-[2px]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30">
                    <svg viewBox="0 0 16 16" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" />
                      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                    </svg>
                  </span>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-[#0a1420]/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                  {c.subtitle}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="font-semibold leading-snug text-[color:var(--ink)]">{c.title}</h3>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0a1f3c] transition hover:brightness-105"
                >
                  Adquirir curso agora →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
