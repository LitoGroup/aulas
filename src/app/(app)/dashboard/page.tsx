import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { listEnrollments } from "@/server/services/enrollment";
import { getCourseProgress } from "@/server/services/progress";
import { CourseCover } from "@/components/course-cover";
import { ProgressRing } from "@/components/progress-ring";
import { studyCta, studyEyebrow } from "@/lib/study-cta";

export default async function DashboardPage() {
  const user = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const isTeacher = user.role === "TEACHER" || user.role === "ADMIN";

  const enrollments = await listEnrollments(user.id);
  const courses = await Promise.all(
    enrollments.map(async (e) => ({
      course: e.course,
      progress: await getCourseProgress(user.id, e.courseId),
    })),
  );

  const inProgress = courses.filter((c) => c.progress.percent < 100);
  const featured = inProgress[0] ?? courses[0];

  return (
    <div className="space-y-8">
      {/* Hero: continue de onde parou */}
      {featured ? (
        <Link
          href={`/courses/${featured.course.slug}`}
          className="group grid overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] sm:grid-cols-[240px_1fr]"
        >
          <CourseCover title={featured.course.title} seed={featured.course.id} src={featured.course.coverUrl} className="min-h-40" />
          <div className="flex flex-col justify-center gap-3 p-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              {studyEyebrow(featured.progress.percent)}
            </span>
            <h2 className="text-xl font-bold text-[color:var(--ink)]">{featured.course.title}</h2>
            <div className="flex items-center gap-3">
              <ProgressRing percent={featured.progress.percent} />
              <span className="text-sm text-[color:var(--muted)]">
                {featured.progress.completed} de {featured.progress.total} aulas concluídas
              </span>
            </div>
            <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-xl brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition group-hover:-translate-y-px">
              {studyCta(featured.progress.percent)}
            </span>
          </div>
        </Link>
      ) : (
        <div className="rounded-3xl border border-dashed border-[color:var(--border)] bg-[var(--surface)] p-10 text-center">
          <h2 className="text-lg font-bold text-[color:var(--ink)]">Bem-vindo(a) à School</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Você ainda não está matriculado em nenhum curso.
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)]"
          >
            Explorar cursos
          </Link>
        </div>
      )}

      {/* Meus cursos */}
      {courses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[color:var(--ink)]">Meus cursos</h2>
            <Link href="/courses" className="text-sm font-medium text-[color:var(--brand-ink)] hover:underline">
              Explorar catálogo
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {courses.map(({ course, progress }) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              >
                <CourseCover title={course.title} seed={course.id} src={course.coverUrl} className="aspect-[16/9]" />
                <div className="space-y-3 p-4">
                  <h3 className="font-semibold text-[color:var(--ink)]">{course.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--canvas)]">
                      <div
                        className={`h-full rounded-full ${progress.percent >= 100 ? "bg-[color:var(--accent)]" : "bg-[color:var(--accent)]"}`}
                        style={{ width: `${Math.max(progress.percent, 3)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-[color:var(--ink-soft)]">{progress.percent}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {isTeacher && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
          <div>
            <h2 className="font-bold text-[color:var(--ink)]">Área do professor</h2>
            <p className="mt-0.5 text-sm text-[color:var(--muted)]">
              Crie e edite cursos, aulas e avaliações.
            </p>
          </div>
          <Link
            href="/manage"
            className="shrink-0 rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)]"
          >
            Gerenciar
          </Link>
        </section>
      )}
    </div>
  );
}
