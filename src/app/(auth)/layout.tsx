import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";
import { ShieldIcon, LockIcon } from "@/components/auth-ui";
import { AuthShowcase } from "./showcase";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-dark relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060b14] px-4 py-8">
      {/* ----------------------- Ambiente do fundo ------------------------ */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="auth-grid absolute inset-0" />
        <div className="auth-glow absolute -left-40 -top-24 h-[38rem] w-[38rem] rounded-full bg-[#12447e]/30 blur-3xl" />
        <div
          className="auth-glow absolute -bottom-40 -right-28 h-[34rem] w-[34rem] rounded-full bg-[color:var(--accent)]/10 blur-3xl"
          style={{ animationDelay: "4s" }}
        />
        <div className="horizon-glow absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0d2b52]/55 to-transparent" />
      </div>

      {/* ------------------------- Card flutuante ------------------------- */}
      <div className="auth-up relative grid w-full max-w-6xl overflow-hidden rounded-[28px] bg-[#0a1523]/85 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95)] ring-1 ring-white/10 backdrop-blur-2xl lg:grid-cols-[1.04fr_1fr]">
        {/* ---------------------------- Formulário ---------------------------- */}
        <div className="order-2 flex flex-col justify-center p-8 sm:p-11 lg:order-1">
          <Link href="/" className="auth-up auth-d1 mb-9 inline-flex items-center gap-2.5 self-start">
            <BrandMark size={40} variant="white" />
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Lito School
            </span>
          </Link>

          <div className="auth-up auth-d2">{children}</div>

          <div className="auth-up auth-d4 mt-10 border-t border-white/[0.07] pt-5">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/40">
              <li className="inline-flex items-center gap-1.5">
                <LockIcon className="h-[13px] w-[13px]" />
                Conexão protegida
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldIcon />
                Dados tratados conforme a LGPD
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-white/25">
              © {new Date().getFullYear()} Lito School · Lito Aviation Academy
            </p>
          </div>
        </div>

        {/* ------------------------ Painel de marca ------------------------ */}
        <AuthShowcase />
      </div>
    </div>
  );
}
