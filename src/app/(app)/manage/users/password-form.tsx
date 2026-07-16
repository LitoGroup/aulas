"use client";

import { useActionState, useState } from "react";
import { adminSetPasswordAction, type ActionState } from "@/server/actions/admin-users";
import { Input, Button } from "@/components/ui";

export function PasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    adminSetPasswordAction,
    null,
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs font-medium text-[color:var(--ink-soft)] transition hover:bg-[color:var(--canvas)]"
      >
        Alterar senha
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <Input
        name="password"
        type="text"
        placeholder="Nova senha (mín. 8)"
        minLength={8}
        required
        className="h-8 w-44 py-1 text-xs"
      />
      <Button type="submit" disabled={pending} className="h-8 w-auto px-3 py-1 text-xs">
        {pending ? "..." : "Salvar"}
      </Button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-[color:var(--muted)] hover:text-[color:var(--ink)]"
      >
        Cancelar
      </button>
      {state?.success && <span className="text-xs font-medium text-[color:var(--success)]">✓ {state.success}</span>}
      {state?.error && <span className="text-xs text-[color:var(--danger)]">{state.error}</span>}
    </form>
  );
}
