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

  // Ordem global das aulas + progresso + cadeados (so faz sentido se matriculado).
  const ordered = course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ id: l.id, requiresPrevious: l.requiresPrevious })),
  );
  const progress = enrolled
    ? await getCourseProgress(actor.id, course.id)
    : { total: ordered.length, completed: 0, percent: 0, completedLessonIds: [] as string[] };
  const completedSet = new Set(progress.completedLessonIds);
  const locks = computeLessonLocks(ordered, completedSet);
  const assessments = enrolled ? await listAssessmentsByCourse(course.id) : [];

  return (
    <div className="space-y-6">
      <Link href="/courses" className="text-sm text-indigo-600 hover:underline">
        &larr; Catalogo
      </Link>

      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <CourseCover title={course.title} seed={course.id} className="h-40 sm:h-52" />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[color:var(--ink)]">{course.title}</h1>
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">{course.description}</p>
          <div className="mt-4">
            {enrolled ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[color:var(--ink-soft)]">Seu progresso</span>
                  <span className="text-[color:var(--muted)]">
                    {progress.completed}/{progress.total} ({progress.percent}%)
                  </span>
                </div>
                <ProgressBar percent={progress.percent} />
              </div>
            ) : (
              <EnrollButton courseId={course.id} slug={course.slug} />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {course.modules.map((m) => (
          <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-800">
              {m.order + 1}. {m.title}
            </h2>
            <ul className="space-y-2">
              {m.lessons.map((l) => {
                const isDone = completedSet.has(l.id);
                const isLocked = locks.get(l.id) === true;
                const badge = (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                    {l.contentType}
                  </span>
                );

                if (enrolled && !isLocked) {
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/learn/${l.id}`}
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                      >
                        {badge}
                        {l.title}
                        {isDone && <span className="text-emerald-600">✓</span>}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={l.id}>
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      {badge}
                      {l.title}
                      {enrolled && isLocked && <span title="Conclua a aula anterior">🔒</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {enrolled && assessments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Avaliacoes</h2>
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {assessments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/assessments/${a.id}`}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-indigo-600">{a.title}</span>
                  <span className="text-xs text-slate-500">
                    {a._count.questions} questao(oes) · corte {a.passingScore}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
