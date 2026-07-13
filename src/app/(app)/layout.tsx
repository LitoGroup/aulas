import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/config";
import { SignOutButton } from "@/components/sign-out-button";
import { NavLinks } from "@/components/nav-links";
import { Badge } from "@/components/ui";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const isTeacher = role === "TEACHER" || role === "ADMIN";

  const links = [
    { href: "/dashboard", label: "Painel" },
    { href: "/courses", label: "Cursos" },
    ...(isTeacher ? [{ href: "/manage", label: "Gerenciar" }] : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[var(--surface)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-[var(--shadow-md)]">
              S
            </span>
            <span className="font-display text-lg font-bold text-[color:var(--ink)]">
              School
            </span>
          </Link>

          <div className="ml-2 hidden sm:block">
            <NavLinks items={links} />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm text-[color:var(--ink-soft)] sm:flex">
              {session.user.name}
              <Badge tone="brand">{role}</Badge>
            </span>
            <SignOutButton />
          </div>
        </div>

        {/* Nav em telas pequenas */}
        <div className="border-t border-[color:var(--border)] px-4 py-2 sm:hidden">
          <NavLinks items={links} />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
