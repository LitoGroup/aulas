import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { listUsers, AdminForbiddenError } from "@/server/services/admin-users";
import { PageHeader, Badge, Card } from "@/components/ui";
import {
  RoleSelect,
  DeleteUserButton,
  PasswordForm,
  ExportEmails,
} from "./user-actions";

type UserRow = Awaited<ReturnType<typeof listUsers>>[number];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function UsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
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
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="border-b border-[color:var(--border)] last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--navy-fill)] text-xs font-bold text-white">
                        {initials(u.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-[color:var(--ink)]">
                          {u.name}
                          {isSelf && (
                            <span className="ml-2 text-[11px] font-normal text-[color:var(--muted)]">(você)</span>
                          )}
                        </span>
                        <span className="block truncate text-xs text-[color:var(--muted)]">{u.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <RoleSelect userId={u.id} role={u.role} disabled={isSelf} />
                  </td>
                  <td className="px-5 py-3 text-[color:var(--ink-soft)]">{u._count.enrollments}</td>
                  <td className="px-5 py-3 text-xs text-[color:var(--muted)]">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(u.createdAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-start gap-2">
                      <PasswordForm userId={u.id} />
                      <DeleteUserButton userId={u.id} name={u.name} disabled={isSelf} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default async function UsersPage() {
  const actor = await requireRole(["ADMIN"]);

  let users;
  try {
    users = await listUsers(actor);
  } catch (e) {
    if (e instanceof AdminForbiddenError) notFound();
    throw e;
  }

  const team = users.filter((u) => u.role === "ADMIN" || u.role === "TEACHER");
  const students = users.filter((u) => u.role === "STUDENT");
  const csvRows = (list: UserRow[]) => list.map((u) => ({ name: u.name, email: u.email, role: u.role }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Usuários"
        subtitle={`${users.length} no total · ${students.length} aluno(s) · ${team.length} interno(s)`}
        action={
          <ExportEmails
            rows={csvRows(users)}
            fileName="usuarios-lito-school.csv"
            label="Exportar todos (CSV)"
          />
        }
      />

      {/* Equipe interna */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[color:var(--ink)]">
            Equipe interna <Badge tone="brand">{team.length}</Badge>
          </h2>
          <ExportEmails rows={csvRows(team)} fileName="equipe-lito-school.csv" label="Exportar equipe" />
        </div>
        {team.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">Nenhum usuário interno.</p>
        ) : (
          <UsersTable users={team} currentUserId={actor.id} />
        )}
      </section>

      {/* Alunos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[color:var(--ink)]">
            Alunos <Badge tone="success">{students.length}</Badge>
          </h2>
          <ExportEmails rows={csvRows(students)} fileName="alunos-lito-school.csv" label="Exportar e-mails dos alunos" />
        </div>
        {students.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">Nenhum aluno cadastrado ainda.</p>
        ) : (
          <UsersTable users={students} currentUserId={actor.id} />
        )}
      </section>
    </div>
  );
}
