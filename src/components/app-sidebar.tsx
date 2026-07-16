"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const icon = {
  panel: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
    </svg>
  ),
  catalog: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2H8v12H3.5A1.5 1.5 0 0 1 2 12.5v-9z" />
      <path d="M14 3.5A1.5 1.5 0 0 0 12.5 2H8v12h4.5a1.5 1.5 0 0 0 1.5-1.5v-9z" />
    </svg>
  ),
  assessments: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="2" width="10" height="12" rx="1.5" />
      <path d="M5.5 6l1.5 1.5L9.5 5M5.5 10.5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  manage: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M11.5 2.5l2 2L6 12l-2.8.8L4 10l7.5-7.5z" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1.5 13.5c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4M11 3.4a2.5 2.5 0 0 1 0 4.2M12.5 9.7c1.2.6 2 1.7 2 3" strokeLinecap="round" />
    </svg>
  ),
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppSidebar({
  name,
  role,
  isTeacher,
}: {
  name: string;
  role: string;
  isTeacher: boolean;
}) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  const learn: NavItem[] = [
    { href: "/dashboard", label: "Painel", icon: icon.panel },
    { href: "/courses", label: "Catálogo de cursos", icon: icon.catalog },
    { href: "/assessments", label: "Minhas avaliações", icon: icon.assessments },
  ];
  const teach: NavItem[] = [
    { href: "/manage", label: "Gerenciar conteúdo", icon: icon.manage },
    ...(isAdmin ? [{ href: "/manage/users", label: "Alunos", icon: icon.users }] : []),
  ];

  // Ativo = o href mais especifico que casa com a rota atual.
  const allHrefs = [...learn, ...teach].map((i) => i.href);
  const activeHref = allHrefs
    .filter((h) => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];

  function NavLink({ item }: { item: NavItem }) {
    const active = item.href === activeHref;
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          active
            ? "bg-[color:var(--ink)] text-white shadow-[var(--shadow-sm)]"
            : "text-[color:var(--ink-soft)] hover:bg-[color:var(--canvas)] hover:text-[color:var(--ink)]"
        }`}
      >
        {item.icon}
        {item.label}
      </Link>
    );
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[color:var(--border)] bg-[var(--surface)] lg:flex">
      {/* Marca */}
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
          S
        </span>
        <span className="font-display text-lg font-bold text-[color:var(--ink)]">School</span>
      </div>

      {/* Perfil */}
      <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--canvas)] p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--ink)] text-sm font-bold text-white">
          {initials(name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-[color:var(--ink)]">{name}</span>
          <Badge tone="brand">{role}</Badge>
        </span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4">
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            Aprender
          </p>
          {learn.map((i) => (
            <NavLink key={i.href} item={i} />
          ))}
        </div>

        {isTeacher && (
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
              Professor
            </p>
            {teach.map((i) => (
              <NavLink key={i.href} item={i} />
            ))}
          </div>
        )}
      </nav>

      {/* Rodapé */}
      <div className="border-t border-[color:var(--border)] p-4">
        <button
          onClick={() => signOut({ redirectTo: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[color:var(--ink-soft)] transition hover:bg-[color:var(--canvas)] hover:text-[color:var(--ink)]"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6 2H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14H6M10.5 11.5L14 8l-3.5-3.5M14 8H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
