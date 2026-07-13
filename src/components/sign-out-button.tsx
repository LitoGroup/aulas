"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/login" })}
      className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-sm font-medium text-[color:var(--ink-soft)] transition hover:bg-[color:var(--canvas)] hover:text-[color:var(--ink)]"
    >
      Sair
    </button>
  );
}
