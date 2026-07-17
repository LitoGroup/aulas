import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getCourseBySlug } from "@/server/services/course";
import { isEnrolled } from "@/server/services/enrollment";
import { getCourseProgress } from "@/server/services/progress";
import { computeLessonLocks } from "@/server/services/lesson-access";
import { listAssessmentsByCourse } from "@/server/services/assessment";
import { CourseCover } from "@/components/course-cover";
import { ProgressBar } from "@/components/ui";
import { StatusCircle, typeLabel } from "@/components/status-circle";
import { EnrollButton } from "../enroll-button";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const course = await getCourseBySlug(slug);

  if (!course || !course.isPublished) notFound();

  const enrolled = await isEnrolled(actor.id, course.id);

  const ordered = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ id: l.id, requiresPrevious: l.requiresPrevious })),
  );
  const progress = enrolled
    ? await getCourseProgress(actor.id, course.id)
    : { total: ordered.length, completed: 0, percent: 0, completedLessonIds: [] as string[] };
  const completedSet = new Set(progress.completedLessonIds);
  const locks = computeLessonLocks(ordered, completedSet);
  const assessments = enrolled ? await listAssessmentsByCourse(course.id) : [];

  // Proxima aula: primeira nao concluida e desbloqueada (para "Continuar").
  const nextLesson = ordered.find(
    (l) => !completedSet.has(l.id) && locks.get(l.id) !== true,
  );
  const moduleOfNext = nextLesson
    ? course.modules.find((m) => m.lessons.some((l) => l.id === nextLesson.id))?.id
    : course.modules[0]?.id;

  return (
    <div className="space-y-6">
      <Link href="/courses" className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]">
        ← Catálogo
      </Link>

      {/* Cabeçalho do curso */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <CourseCover
          title={course.title}
          seed={course.id}
          src={course.coverUrl}
          fit="contain"
          className="h-52 w-full sm:h-72"
        />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[color:var(--ink)]">{course.title}</h1>
          {course.description && (
            <p className="mt-2 text-sm text-[color:var(--ink-soft)]">{course.description}</p>
          )}

          {enrolled ? (
            <div className="mt-5 flex flex-wrap items-center gap-6">
              <div className="min-w-56 flex-1">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-[color:var(--ink-soft)]">Seu progresso</span>
                  <span className="text-[color:var(--muted)]">
                    {progress.completed}/{progress.total} aulas · {progress.percent}%
                  </span>
                </div>
                <ProgressBar percent={progress.percent} />
              </div>
              {nextLesson && (
                <Link
                  href={`/learn/${nextLesson.id}`}
                  className="rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition hover:-translate-y-px"
                >
                  {progress.completed > 0 ? "Continuar de onde parei" : "Começar o curso"}
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-5">
              <EnrollButton courseId={course.id} slug={course.slug} />
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo: módulos expansíveis */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[color:var(--ink)]">Conteúdo do curso</h2>
        {course.modules.map((m) => {
          const doneInModule = m.lessons.filter((l) => completedSet.has(l.id)).length;
          const isOpen = m.id === moduleOfNext;
          return (
            <details
              key={m.id}
              open={isOpen}
              className="group overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition hover:bg-[color:var(--canvas)]">
                <span className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 12 12"
                    className="h-3 w-3 shrink-0 text-[color:var(--muted)] transition-transform group-open:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 2.5L8 6l-4 3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-semibold text-[color:var(--ink)]">
                    {m.order + 1}. {m.title}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-[color:var(--muted)]">
                  {enrolled ? `${doneInModule}/${m.lessons.length}` : `${m.lessons.length} aula(s)`}
                </span>
              </summary>

              <ul className="border-t border-[color:var(--border)]">
                {m.lessons.map((l) => {
                  const isDone = completedSet.has(l.id);
                  const isLocked = locks.get(l.id) === true;
                  const state = isDone ? "done" : isLocked ? "locked" : "pending";
                  const row = (
                    <span className="flex items-center gap-3 px-5 py-3">
                      <StatusCircle state={state} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm ${
                            isLocked ? "text-[color:var(--muted)]" : "text-[color:var(--ink)]"
                          }`}
                        >
                          {l.title}
                        </span>
                        <span className="text-xs text-[color:var(--muted)]">
                          {typeLabel(l.contentType)}
                        </span>
                      </span>
                      {isLocked && (
                        <span className="shrink-0 text-xs text-[color:var(--muted)]">
                          Conclua a anterior
                        </span>
                      )}
                    </span>
                  );

                  return (
                    <li key={l.id} className="border-b border-[color:var(--border)] last:border-0">
                      {enrolled && !isLocked ? (
                        <Link href={`/learn/${l.id}`} className="block transition hover:bg-[color:var(--canvas)]">
                          {row}
                        </Link>
                      ) : (
                        <div className={isLocked ? "opacity-70" : ""}>{row}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>

      {/* Avaliações */}
      {enrolled && assessments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-[color:var(--ink)]">Avaliações</h2>
          <ul className="divide-y divide-[color:var(--border)] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
            {assessments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/assessments/${a.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-[color:var(--canvas)]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--navy-fill)] text-white">
                      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <rect x="3" y="2" width="10" height="12" rx="1.5" />
                        <path d="M5.5 6l1.5 1.5L9.5 5M5.5 10.5h5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[color:var(--ink)]">{a.title}</span>
                      <span className="text-xs text-[color:var(--muted)]">
                        {a._count.questions} questão(ões) · aprovação com {a.passingScore}%
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-medium text-[color:var(--ink-soft)]">Fazer prova</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
