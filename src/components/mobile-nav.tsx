"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NavIcon } from "@/components/nav-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { roleLabel } from "@/lib/roles";
import { bottomBarItems, learnItems, teachItems, activeHref, type NavItem } from "@/lib/nav";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Navegação do celular: barra de abas fixa embaixo (como app nativo) e uma
 * gaveta com o restante. A sidebar do desktop continua sendo a de sempre.
 */
export function MobileNav({ name, role }: { name: string; role: string }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const abas = bottomBarItems(role);
  const aprender = learnItems();
  const ensinar = teachItems(role);
  const todosHrefs = [...aprender, ...ensinar].map((i) => i.href);
  const ativo = activeHref(pathname, todosHrefs);

  // Trava o scroll do fundo e permite fechar no Esc enquanto a gaveta está aberta.
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", onKey);
    };
  }, [aberto]);

  function Aba({ item }: { item: NavItem }) {
    const on = item.href === ativo;
    return (
      <Link
        href={item.href}
        aria-current={on ? "page" : undefined}
        className={`relative flex min-h-[3.25rem] flex-col items-center justify-center gap-1 px-1 transition ${
          on ? "text-[color:var(--accent-ink)]" : "text-[color:var(--muted)]"
        }`}
      >
        {on && (
          <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[color:var(--accent)]" />
        )}
        <NavIcon name={item.icon} className="h-[18px] w-[18px]" />
        <span className={`text-[10px] leading-none ${on ? "font-bold" : "font-medium"}`}>
          {item.short}
        </span>
      </Link>
    );
  }

  function ItemDaGaveta({ item }: { item: NavItem }) {
    const on = item.href === ativo;
    return (
      <Link
        href={item.href}
        // Fecha aqui em vez de num efeito de rota: navegar para a página em
        // que já se está não muda o pathname e a gaveta ficaria aberta.
        onClick={() => setAberto(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
          on
            ? "bg-[color:var(--ink)]/[0.06] font-semibold text-[color:var(--ink)]"
            : "font-medium text-[color:var(--ink-soft)] active:bg-[color:var(--canvas)]"
        }`}
      >
        <span className={on ? "text-[color:var(--accent-ink)]" : "text-[color:var(--muted)]"}>
          <NavIcon name={item.icon} />
        </span>
        {item.label}
      </Link>
    );
  }

  const gaveta = (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        aria-label="Fechar menu"
        onClick={() => setAberto(false)}
        className="sheet-fade absolute inset-0 h-full w-full bg-black/50 backdrop-blur-[2px]"
      />
      <div className="sheet-up absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-[color:var(--border)] bg-[var(--surface)] pb-safe shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.45)]">
        {/* alça da gaveta */}
        <div className="sticky top-0 flex justify-center bg-[var(--surface)] pb-1 pt-3">
          <span className="h-1 w-10 rounded-full bg-[color:var(--border-strong)]" />
        </div>

        <div className="px-4 pb-5">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[color:var(--ink)]/[0.04] p-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--navy-fill)] text-sm font-bold text-white ring-2 ring-[color:var(--accent)]/40">
              {initials(name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[color:var(--ink)]">
                {name}
              </span>
              <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--accent-ink)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
                {roleLabel(role)}
              </span>
            </span>
          </div>

          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            Aprender
          </p>
          <div className="space-y-0.5">
            {aprender.map((i) => (
              <ItemDaGaveta key={i.href} item={i} />
            ))}
          </div>

          {ensinar.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                Professor
              </p>
              <div className="space-y-0.5">
                {ensinar.map((i) => (
                  <ItemDaGaveta key={i.href} item={i} />
                ))}
              </div>
            </>
          )}

          <div className="mt-4 space-y-1 border-t border-[color:var(--border)] pt-4">
            <ThemeToggle />
            <button
              onClick={() => signOut({ redirectTo: "/login" })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[color:var(--ink-soft)] transition active:bg-[color:var(--canvas)]"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden
              >
                <path
                  d="M6 2H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14H6M10.5 11.5L14 8l-3.5-3.5M14 8H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[var(--surface)]/95 pb-safe backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {abas.map((i) => (
            <Aba key={i.href} item={i} />
          ))}
          <button
            onClick={() => setAberto(true)}
            aria-expanded={aberto}
            className="flex min-h-[3.25rem] flex-col items-center justify-center gap-1 px-1 text-[color:var(--muted)]"
          >
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[color:var(--navy-fill)] text-[9px] font-bold text-white">
              {initials(name)}
            </span>
            <span className="text-[10px] font-medium leading-none">Menu</span>
          </button>
        </div>
      </nav>

      {aberto && typeof document !== "undefined" && createPortal(gaveta, document.body)}
    </>
  );
}
