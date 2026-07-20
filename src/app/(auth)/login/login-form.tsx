"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Alert } from "@/components/ui";
import { AuthField, AuthButton, MailIcon, LockIcon } from "@/components/auth-ui";
import { WelcomeSplash } from "@/components/welcome-splash";

const WELCOME_MS = 3000;

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [welcome, setWelcome] = useState<{ name?: string | null } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });

    if (res?.error) {
      setPending(false);
      setError("E-mail ou senha inválidos");
      return;
    }

    // Boas-vindas com o avatar enquanto a área do aluno é preparada.
    const session = await getSession();
    setWelcome({ name: session?.user?.name });
    router.prefetch(callbackUrl);
    setTimeout(() => {
      router.push(callbackUrl);
      router.refresh();
    }, WELCOME_MS);
  }

  if (welcome) return <WelcomeSplash name={welcome.name} />;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}

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
        autoComplete="current-password"
        required
      />

      <AuthButton type="submit" disabled={pending}>
        {pending ? (
          "Entrando..."
        ) : (
          <>
            Entrar
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M4 10h11M11 6l4 4-4 4" />
            </svg>
          </>
        )}
      </AuthButton>
    </form>
  );
}
