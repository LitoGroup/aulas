"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestResetAction, type ActionState } from "@/server/actions/auth";
import { Input, Label, Button, Alert } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    requestResetAction,
    null,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--ink)]">Esqueci minha senha</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Informe seu e-mail e enviaremos um link de redefinicao.
        </p>
      </div>

      {state?.success && <Alert kind="success">{state.success}</Alert>}

      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar link"}
        </Button>
      </form>

      <p className="text-center text-sm text-[color:var(--muted)]">
        <Link href="/login" className="font-medium text-[color:var(--brand-ink)] hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
