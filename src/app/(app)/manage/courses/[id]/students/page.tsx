import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getCourseGradebook, GradebookForbiddenError } from "@/server/services/gradebook";
import { getManageCourse } from "@/server/services/course";
import { PageHeader, Badge } from "@/components/ui";

export default async function StudentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await requireRole(["TEACHER", "ADMIN"]);

  let gradebook;
  let course;
  try {
    [course, gradebook] = await Promise.all([
      getManageCourse(actor, id),
      getCourseGradebook(actor, id),
    ]);
  } catch (e) {
    if (e instanceof GradebookForbiddenError) notFound();
    throw e;
  }
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/manage/courses/${id}`}
        className="-ml-2 inline-flex min-h-[2.5rem] items-center px-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
      >
        ← Voltar ao curso
      </Link>
      <PageHeader
        title="Alunos e notas"
        subtitle={`${gradebook.students.length} aluno(s) matriculado(s) em “${course.title}”`}
      />

      {gradebook.students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[color:var(--muted)]">
          Nenhum aluno matriculado ainda.
        </div>
      ) : (
        <>
        {/* Celular: um cartão por aluno. A tabela cresce uma coluna por
            avaliação, então em 375px ela é impraticável. */}
        <div className="space-y-3 lg:hidden">
          {gradebook.students.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-[color:var(--ink)]">{s.name}</p>
                <p className="truncate text-xs text-[color:var(--muted)]">{s.email}</p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--canvas)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--accent)]"
                    style={{ width: `${Math.max(s.progressPercent, 3)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-[color:var(--ink-soft)]">
                  {s.progressPercent}%
                </span>
              </div>

              {gradebook.assessments.length > 0 && (
                <ul className="mt-3 space-y-2 border-t border-[color:var(--border)] pt-3">
                  {gradebook.assessments.map((a) => {
                    const score = s.scores[a.id];
                    return (
                      <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 flex-1 truncate text-[color:var(--ink-soft)]">
                          {a.title}
                        </span>
                        {score?.best === null ? (
                          <span className="shrink-0 text-[color:var(--muted)]">-</span>
                        ) : (
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="font-semibold text-[color:var(--ink)]">
                              {score.best}%
                            </span>
                            <Badge tone={score.passed ? "success" : "neutral"}>
                              {score.passed ? "Aprovado" : "Reprovado"}
                            </Badge>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Desktop: tabela */}
        <div className="hidden overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] lg:block">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)] text-left text-xs uppercase tracking-wide text-[color:var(--muted)]">
                <th className="px-4 py-3 font-semibold">Aluno</th>
                <th className="px-4 py-3 font-semibold">Progresso</th>
                {gradebook.assessments.map((a) => (
                  <th key={a.id} className="px-4 py-3 font-semibold">{a.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gradebook.students.map((s) => (
                <tr key={s.id} className="border-b border-[color:var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[color:var(--ink)]">{s.name}</div>
                    <div className="text-xs text-[color:var(--muted)]">{s.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[color:var(--canvas)]">
                        <div
                          className={`h-full rounded-full ${s.progressPercent >= 100 ? "bg-[color:var(--accent)]" : "bg-[color:var(--accent)]"}`}
                          style={{ width: `${Math.max(s.progressPercent, 3)}%` }}
                        />
                      </div>
                      <span className="text-xs text-[color:var(--muted)]">{s.progressPercent}%</span>
                    </div>
                  </td>
                  {gradebook.assessments.map((a) => {
                    const score = s.scores[a.id];
                    return (
                      <td key={a.id} className="px-4 py-3">
                        {score?.best === null ? (
                          <span className="text-[color:var(--muted)]">-</span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <span className="font-semibold text-[color:var(--ink)]">{score.best}%</span>
                            <Badge tone={score.passed ? "success" : "neutral"}>
                              {score.passed ? "Aprovado" : "Reprovado"}
                            </Badge>
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
