import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-logo";
import { isTeacherRole } from "@/lib/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const name = session.user.name ?? "Aluno";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa (desktop) */}
      <AppSidebar name={name} role={role} isTeacher={isTeacherRole(role)} />

      <div className="min-w-0 flex-1">
        {/* Topo do celular: uma linha só. A navegação mora na barra inferior. */}
        <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[var(--surface)]/85 pt-safe backdrop-blur lg:hidden">
          <div className="flex w-full items-center gap-3 px-4 py-2.5">
            <Link href="/dashboard" className="flex items-center gap-2 py-1">
              <BrandMark size={30} variant="adaptive" />
              <span className="font-display text-base font-bold text-[color:var(--ink)]">
                Lito School
              </span>
            </Link>
            <div className="ml-auto w-10">
              <ThemeToggle collapsed />
            </div>
          </div>
        </header>

        {/* pb-28 abre espaço para a barra de abas fixa do celular */}
        <main className="w-full px-4 pb-28 pt-5 sm:px-8 lg:pb-8 lg:pt-8">{children}</main>
      </div>

      <MobileNav name={name} role={role} />
    </div>
  );
}
