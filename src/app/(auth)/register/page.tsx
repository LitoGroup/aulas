"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type ActionState } from "@/server/actions/auth";
import { Input, Label, Button, Alert } from "@/components/ui";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    registerAction,
    null,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--ink)]">Criar conta</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">Cadastre-se para acessar os cursos.</p>
      </div>

      {state?.error && <Alert kind="error">{state.error}</Alert>}

      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" type="text" autoComplete="name" required />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <p className="mt-1 text-xs text-[color:var(--muted)]">Minimo de 8 caracteres.</p>
        </div>
        <label className="flex items-start gap-2 text-xs text-[color:var(--ink-soft)]">
          <input type="checkbox" name="consent" required className="mt-0.5" />
          <span>
            Li e aceito a{" "}
            <Link href="/privacidade" target="_blank" className="font-medium text-[color:var(--brand-ink)] underline">
              Política de Privacidade
            </Link>{" "}
            e os{" "}
            <Link href="/termos" target="_blank" className="font-medium text-[color:var(--brand-ink)] underline">
              Termos de Uso
            </Link>
            , e concordo com o tratamento dos meus dados conforme a LGPD.
          </span>
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Criando..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-[color:var(--muted)]">
        Ja tem conta?{" "}
        <Link href="/login" className="font-medium text-[color:var(--brand-ink)] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
