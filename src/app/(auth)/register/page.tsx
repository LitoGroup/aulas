"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type ActionState } from "@/server/actions/auth";
import { Alert } from "@/components/ui";
import { AuthField, AuthButton, MailIcon, LockIcon, UserIcon } from "@/components/auth-ui";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    registerAction,
    null,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[1.7rem] font-bold leading-tight text-white">
          Criar conta
        </h1>
        <p className="mt-1.5 text-sm text-white/45">Cadastre-se para acessar os cursos.</p>
      </div>

      {state?.error && <Alert kind="error">{state.error}</Alert>}

      <form action={action} className="space-y-4">
        <AuthField
          id="name"
          name="name"
          type="text"
          label="Nome"
          icon={<UserIcon />}
          placeholder="Seu nome completo"
          autoComplete="name"
          required
        />
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
        <AuthField
          id="password"
          name="password"
          type="password"
          label="Senha"
          icon={<LockIcon />}
          placeholder="••••••••"
          autoComplete="new-password"
          minLength={8}
          hint="Mínimo de 8 caracteres."
          required
        />

        <label className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs leading-relaxed text-white/55">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-0.5 h-3.5 w-3.5 accent-[color:var(--accent)]"
          />
          <span>
            Li e aceito a{" "}
            <Link
              href="/privacidade"
              target="_blank"
              className="font-medium text-white/85 underline underline-offset-2"
            >
              Política de Privacidade
            </Link>{" "}
            e os{" "}
            <Link
              href="/termos"
              target="_blank"
              className="font-medium text-white/85 underline underline-offset-2"
            >
              Termos de Uso
            </Link>
            , e concordo com o tratamento dos meus dados conforme a LGPD.
          </span>
        </label>

        <AuthButton type="submit" disabled={pending}>
          {pending ? "Criando..." : "Criar conta"}
        </AuthButton>
      </form>

      <p className="text-center text-sm text-white/45">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-white/85 transition hover:text-white">
          Entrar
        </Link>
      </p>
    </div>
  );
}
