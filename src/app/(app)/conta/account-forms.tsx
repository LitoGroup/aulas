"use client";

import { useActionState, useState } from "react";
import { signOut } from "next-auth/react";
import {
  updateProfileAction,
  changePasswordAction,
  exportDataAction,
  deleteAccountAction,
  type ActionState,
} from "@/server/actions/account";
import { Input, Label, Button, Alert } from "@/components/ui";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    updateProfileAction,
    null,
  );
  return (
    <form action={action} className="space-y-4">
      {state?.success && <Alert kind="success">{state.success}</Alert>}
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <div>
        <Label>E-mail</Label>
        <Input value={email} disabled />
        <p className="mt-1 text-xs text-[color:var(--muted)]">O e-mail não pode ser alterado.</p>
      </div>
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={name} required minLength={2} />
      </div>
      <Button type="submit" disabled={pending} className="w-auto px-5">
        {pending ? "Salvando..." : "Salvar nome"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    changePasswordAction,
    null,
  );
  return (
    <form action={action} className="space-y-4">
      {state?.success && <Alert kind="success">{state.success}</Alert>}
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <div>
        <Label htmlFor="current">Senha atual</Label>
        <Input id="current" name="current" type="password" required />
      </div>
      <div>
        <Label htmlFor="password">Nova senha</Label>
        <Input id="password" name="password" type="password" minLength={8} required />
      </div>
      <Button type="submit" disabled={pending} className="w-auto px-5">
        {pending ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}

export function ExportButton() {
  const [busy, setBusy] = useState(false);
  async function onExport() {
    setBusy(true);
    const res = await exportDataAction();
    setBusy(false);
    if ("error" in res) {
      alert(res.error);
      return;
    }
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-dados-lito-school.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Button variant="ghost" onClick={onExport} disabled={busy} className="w-auto px-5">
      {busy ? "Gerando..." : "Baixar meus dados (JSON)"}
    </Button>
  );
}

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    setError(null);
    setBusy(true);
    const res = await deleteAccountAction(password);
    if ("error" in res) {
      setError(res.error);
      setBusy(false);
      return;
    }
    // conta removida - encerra a sessão
    await signOut({ redirectTo: "/login" });
  }

  if (!open) {
    return (
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="w-auto border-[color:var(--danger)]/40 px-5 text-[color:var(--danger)] hover:bg-[color:var(--danger)]/8"
      >
        Excluir minha conta
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/5 p-4">
      <p className="text-sm text-[color:var(--ink-soft)]">
        Esta ação é <strong>permanente</strong>: seus dados, matrículas, progresso e notas
        serão apagados e não poderão ser recuperados. Digite sua senha para confirmar.
      </p>
      {error && <Alert kind="error">{error}</Alert>}
      <Input
        type="password"
        placeholder="Sua senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="max-w-xs"
      />
      <div className="flex gap-2">
        <button
          onClick={onDelete}
          disabled={busy || !password}
          className="inline-flex items-center justify-center rounded-xl bg-[color:var(--danger)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Excluindo..." : "Excluir definitivamente"}
        </button>
        <Button variant="ghost" onClick={() => setOpen(false)} className="w-auto px-5">
          Cancelar
        </Button>
      </div>
    </div>
  );
}
