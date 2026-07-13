"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "@/server/actions/auth";
import { Input, Label, Button, Alert } from "@/components/ui";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    resetPasswordAction,
    null,
  );

  if (!token) {
    return <Alert kind="error">Link invalido. Solicite uma nova redefinicao.</Alert>;
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">Nova senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirmar nova senha</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Redefinir senha"}
      </Button>
    </form>
  );
}
