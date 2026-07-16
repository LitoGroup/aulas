import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { SignOutButton } from "@/components/sign-out-button";
import { NavLinks } from "@/components/nav-links";
import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const name = session.user.name ?? "Aluno";
  const isTeacher = role === "TEACHER" || role === "ADMIN";

  const links = [
    { href: "/dashboard", label: "Painel" },
    { href: "/courses", label: "Cursos" },
    { href: "/assessments", label: "Avaliações" },
    ...(isTeacher ? [{ href: "/manage", label: "Gerenciar" }] : []),
    ...(role === "ADMIN" ? [{ href: "/manage/users", label: "Alunos" }] : []),
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa (desktop) */}
      <AppSidebar name={name} role={role} isTeacher={isTeacher} />

      <div className="min-w-0 flex-1">
        {/* Topo compacto (mobile/tablet) */}
        <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[var(--surface)]/85 backdrop-blur lg:hidden">
          <div className="flex w-full items-center gap-4 px-4 py-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
                S
              </span>
              <span className="font-display text-lg font-bold text-[color:var(--ink)]">School</span>
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-2 text-sm text-[color:var(--ink-soft)] sm:flex">
                {name}
                <Badge tone="brand">{role}</Badge>
              </span>
              <SignOutButton />
            </div>
          </div>
          <div className="border-t border-[color:var(--border)] px-4 py-2">
            <NavLinks items={links} />
          </div>
        </header>

        <main className="w-full px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
