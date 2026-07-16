import Link from "next/link";
import { LoginForm } from "./login-form";
import { Alert } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; reset?: string; callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl = sp.callbackUrl || "/dashboard";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-[color:var(--ink)]">Entrar</h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">Acesse sua conta para continuar.</p>
      </div>

      {sp.registered && <Alert kind="success">Conta criada! Faca login para continuar.</Alert>}
      {sp.reset && <Alert kind="success">Senha redefinida! Faca login com a nova senha.</Alert>}

      <LoginForm callbackUrl={callbackUrl} />

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-[color:var(--brand-ink)] hover:underline">
          Esqueci minha senha
        </Link>
        <Link href="/register" className="font-medium text-[color:var(--brand-ink)] hover:underline">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
