"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Input, Label, Button, Alert } from "@/components/ui";
import { WelcomeSplash } from "@/components/welcome-splash";

const WELCOME_MS = 4000;

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
          autoComplete="current-password"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
