import { requireRole } from "@/server/auth/rbac";

export default async function DashboardPage() {
  const user = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);

  const isTeacher = user.role === "TEACHER" || user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Painel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bem-vindo(a) de volta. Voce esta logado como{" "}
          <strong>{user.role}</strong>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-medium text-slate-900">Meus cursos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Em breve: cursos em que voce esta matriculado e seu progresso.
          </p>
        </div>

        {isTeacher && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-medium text-slate-900">Gerenciar conteudo</h2>
            <p className="mt-1 text-sm text-slate-500">
              Em breve: criar cursos, modulos, aulas e avaliacoes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
