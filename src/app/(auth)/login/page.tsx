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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[1.7rem] font-bold leading-tight text-white">
          Bem-vindo de volta
        </h1>
        <p className="mt-1.5 text-sm text-white/45">Entre para continuar seus estudos.</p>
      </div>

      {sp.registered && <Alert kind="success">Conta criada! Faça login para continuar.</Alert>}
      {sp.reset && <Alert kind="success">Senha redefinida! Faça login com a nova senha.</Alert>}

      <LoginForm callbackUrl={callbackUrl} />

      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-[13px] text-white/45 transition hover:text-white/80"
        >
          Esqueci minha senha
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-[11px] uppercase tracking-[0.16em] text-white/25">
          Primeira vez aqui
        </span>
        <span className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <Link
        href="/register"
        className="inline-flex w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
      >
        Criar minha conta
      </Link>
    </div>
  );
}
