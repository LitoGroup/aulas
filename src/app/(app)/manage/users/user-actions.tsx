"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adminSetRoleAction,
  adminDeleteUserAction,
} from "@/server/actions/admin-users";
import { PasswordForm } from "./password-form";

type Role = "STUDENT" | "TEACHER" | "ADMIN";

export function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState<Role>(role);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function onChange(next: Role) {
    const prev = value;
    setValue(next);
    setErr(null);
    start(async () => {
      const res = await adminSetRoleAction(userId, next);
      if ("error" in res) {
        setValue(prev);
        setErr(res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        disabled={disabled || pending}
        onChange={(e) => onChange(e.target.value as Role)}
        className="rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[color:var(--ink)] disabled:opacity-50"
      >
        <option value="STUDENT">STUDENT</option>
        <option value="TEACHER">TEACHER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      {err && <span className="text-[11px] text-[color:var(--danger)]">{err}</span>}
    </div>
  );
}

export function DeleteUserButton({
  userId,
  name,
  disabled,
}: {
  userId: string;
  name: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  if (disabled) {
    return <span className="text-xs text-[color:var(--muted)]">—</span>;
  }

  function onDelete() {
    if (!confirm(`Excluir o usuário "${name}"? Esta ação é permanente.`)) return;
    setErr(null);
    start(async () => {
      const res = await adminDeleteUserAction(userId);
      if ("error" in res) setErr(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onDelete}
        disabled={pending}
        className="rounded-lg border border-[color:var(--danger)]/40 px-2.5 py-1.5 text-xs font-medium text-[color:var(--danger)] transition hover:bg-[color:var(--danger)]/8 disabled:opacity-50"
      >
        {pending ? "..." : "Excluir"}
      </button>
      {err && <span className="text-[11px] text-[color:var(--danger)]">{err}</span>}
    </div>
  );
}

export { PasswordForm };

export function ExportEmails({
  rows,
  fileName,
  label,
}: {
  rows: { name: string; email: string; role: string }[];
  fileName: string;
  label: string;
}) {
  function onExport() {
    const header = "Nome,Email,Papel\n";
    const body = rows
      .map((r) => `"${r.name.replace(/"/g, '""')}","${r.email}","${r.role}"`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={onExport}
      className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--canvas)]"
    >
      {label}
    </button>
  );
}
