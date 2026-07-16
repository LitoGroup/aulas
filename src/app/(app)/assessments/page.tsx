import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { listStudentAssessments } from "@/server/services/grading";
import { PageHeader, Badge, Card } from "@/components/ui";

export default async function MyAssessmentsPage() {
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const courses = (await listStudentAssessments(actor.id)).filter(
    (c) => c.assessments.length > 0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas avaliações"
        subtitle="Todas as provas dos cursos em que você está matriculado."
      />

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[color:var(--muted)]">
          Nenhuma avaliação disponível ainda.{" "}
          <Link href="/courses" className="font-medium text-[color:var(--ink)] underline">
            Explorar cursos
          </Link>
        </div>
      ) : (
        courses.map((c) => (
          <section key={c.courseId} className="space-y-3">
            <Link
              href={`/courses/${c.courseSlug}`}
              className="text-sm font-semibold text-[color:var(--ink)] hover:underline"
            >
              {c.courseTitle}
            </Link>
            <Card>
              <ul className="divide-y divide-[color:var(--border)]">
                {c.assessments.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/assessments/${a.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[color:var(--canvas)]"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[color:var(--ink)]">
                          {a.title}
                        </span>
                        <span className="text-xs text-[color:var(--muted)]">
                          {a.questionCount} questão(ões) · aprovação com {a.passingScore}% ·{" "}
                          {a.attempts} tentativa(s)
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        {a.best !== null && (
                          <span className="text-sm font-bold text-[color:var(--ink)]">{a.best}%</span>
                        )}
                        {a.attempts === 0 ? (
                          <Badge>Não realizada</Badge>
                        ) : a.passed ? (
                          <Badge tone="success">Aprovado</Badge>
                        ) : (
                          <Badge tone="warning">Reprovado</Badge>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ))
      )}
    </div>
  );
}
