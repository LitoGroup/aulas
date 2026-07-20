"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "@/server/actions/auth";
import { Alert } from "@/components/ui";
import { AuthField, AuthButton, LockIcon } from "@/components/auth-ui";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    resetPasswordAction,
    null,
  );

  if (!token) {
    return <Alert kind="error">Link inválido. Solicite uma nova redefinição.</Alert>;
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="token" value={token} />
      <AuthField
        id="password"
        name="password"
        type="password"
        label="Nova senha"
        icon={<LockIcon />}
        placeholder="••••••••"
        autoComplete="new-password"
        minLength={8}
        hint="Mínimo de 8 caracteres."
        required
      />
      <AuthField
        id="confirm"
        name="confirm"
        type="password"
        label="Confirmar nova senha"
        icon={<LockIcon />}
        placeholder="••••••••"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <AuthButton type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Redefinir senha"}
      </AuthButton>
    </form>
  );
}
