import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { listUsers, AdminForbiddenError } from "@/server/services/admin-users";
import { PageHeader, Badge, Card } from "@/components/ui";
import { PasswordForm } from "./password-form";

const roleTone = { ADMIN: "brand", TEACHER: "brand", STUDENT: "neutral" } as const;

export default async function UsersPage() {
  const actor = await requireRole(["ADMIN"]);

  let users;
  try {
    users = await listUsers(actor);
  } catch (e) {
    if (e instanceof AdminForbiddenError) notFound();
    throw e;
  }

  const students = users.filter((u) => u.role === "STUDENT").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos e usuários"
        subtitle={`${users.length} usuário(s) cadastrados · ${students} aluno(s)`}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)] text-left text-xs uppercase tracking-wide text-[color:var(--muted)]">
                <th className="px-5 py-3 font-semibold">Usuário</th>
                <th className="px-5 py-3 font-semibold">Papel</th>
                <th className="px-5 py-3 font-semibold">Cursos</th>
                <th className="px-5 py-3 font-semibold">Cadastro</th>
                <th className="px-5 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[color:var(--border)] last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--navy-fill)] text-xs font-bold text-white">
                        {u.name
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((w) => w[0]?.toUpperCase())
                          .join("")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-[color:var(--ink)]">{u.name}</span>
                        <span className="block truncate text-xs text-[color:var(--muted)]">{u.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={roleTone[u.role]}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-[color:var(--ink-soft)]">{u._count.enrollments}</td>
                  <td className="px-5 py-3 text-xs text-[color:var(--muted)]">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(u.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <PasswordForm userId={u.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
