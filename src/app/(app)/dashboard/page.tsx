import Link from "next/link";
import { requireRole } from "@/server/auth/rbac";
import { listEnrollments } from "@/server/services/enrollment";
import { getCourseProgress } from "@/server/services/progress";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Painel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bem-vindo(a) de volta. Voce esta logado como <strong>{user.role}</strong>.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">Meus cursos</h2>
          <Link href="/courses" className="text-sm text-indigo-600 hover:underline">
            Explorar catalogo
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
            Voce ainda nao esta matriculado em nenhum curso.{" "}
            <Link href="/courses" className="text-indigo-600 hover:underline">
              Ver cursos disponiveis
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map(({ course, progress }) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
              >
                <h3 className="font-semibold text-slate-900">{course.title}</h3>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {progress.completed}/{progress.total} aulas
                  </span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {isTeacher && (
        <section>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-medium text-slate-900">Gerenciar conteudo</h2>
            <p className="mt-1 text-sm text-slate-500">
              Crie e edite cursos, modulos, aulas e avaliacoes.
            </p>
            <Link
              href="/manage"
              className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Ir para Gerenciar
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
