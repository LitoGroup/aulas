"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestResetAction, type ActionState } from "@/server/actions/auth";
import { Alert } from "@/components/ui";
import { AuthField, AuthButton, MailIcon } from "@/components/auth-ui";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    requestResetAction,
    null,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[1.7rem] font-bold leading-tight text-white">
          Esqueci minha senha
        </h1>
        <p className="mt-1.5 text-sm text-white/45">
          Informe seu e-mail e enviaremos um link de redefinição.
        </p>
      </div>

      {state?.success && <Alert kind="success">{state.success}</Alert>}

      <form action={action} className="space-y-4">
        <AuthField
          id="email"
          name="email"
          type="email"
          label="E-mail"
          icon={<MailIcon />}
          placeholder="voce@exemplo.com"
          autoComplete="email"
          required
        />
        <AuthButton type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar link"}
        </AuthButton>
      </form>

      <p className="text-center text-sm text-white/45">
        <Link href="/login" className="font-semibold text-white/85 transition hover:text-white">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
