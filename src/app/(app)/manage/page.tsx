import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { listCoursesByOwner } from "@/server/services/course";
import { resumirCursos } from "@/server/services/review";
import { DeleteCourseButton } from "./delete-course-button";

export default async function ManagePage() {
  const actor = await requireRole(["TEACHER", "ADMIN"]);
  const courses = await listCoursesByOwner(actor.id);
  const satisfacao = await resumirCursos(courses.map((c) => c.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[color:var(--ink)] sm:text-2xl">Meus cursos</h1>
        <Link
          href="/manage/courses/new"
          className="shrink-0 rounded-lg brand-gradient px-4 py-2.5 text-sm font-semibold text-white"
        >
          Novo curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">Voce ainda nao criou cursos.</p>
      ) : (
        <ul className="divide-y divide-[color:var(--border)] rounded-xl border border-[color:var(--border)] bg-[var(--surface)]">
          {courses.map((c) => {
            const nota = satisfacao.get(c.id);
            return (
              <li key={c.id} className="flex items-center gap-1 pr-2">
                <Link
                  href={`/manage/courses/${c.id}`}
                  className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 hover:bg-[color:var(--canvas)]"
                >
                  <span className="min-w-0 font-medium text-[color:var(--ink)]">{c.title}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {/* Satisfação aparece aqui para não ficar escondida no pé
                        da página do curso. */}
                    {nota && nota.total > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--accent-ink)]"
                        title={`${nota.total} ${nota.total === 1 ? "resposta" : "respostas"} na pesquisa de satisfação`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
                        </svg>
                        {nota.media.toFixed(1).replace(".", ",")}
                        <span className="font-normal text-[color:var(--muted)]">
                          ({nota.total})
                        </span>
                      </span>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        c.isPublished
                          ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                          : "bg-[color:var(--canvas)] text-[color:var(--muted)]"
                      }`}
                    >
                      {c.isPublished ? "Publicado" : "Rascunho"}
                    </span>
                  </span>
                </Link>
                <DeleteCourseButton courseId={c.id} title={c.title} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
