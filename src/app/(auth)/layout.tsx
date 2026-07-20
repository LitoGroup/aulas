import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";
import { ChromaVideo } from "@/components/chroma-video";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-dark relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070d17] px-4 py-10">
      {/* halo ambiente do fundo */}
      <div
        aria-hidden
        className="auth-glow pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#123a6b]/35 blur-3xl"
      />

      {/* Card flutuante */}
      <div className="auth-up relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-[#0b1522]/85 shadow-[0_40px_100px_-25px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-xl lg:grid-cols-2">
        {/* ------------------------- Formulário ------------------------- */}
        <div className="order-2 flex flex-col justify-center p-8 sm:p-10 lg:order-1">
          <Link href="/" className="auth-up auth-d1 mb-8 flex items-center gap-2.5">
            <BrandMark size={38} variant="white" />
            <span className="font-display text-xl font-bold text-white">Lito School</span>
          </Link>

          <div className="auth-up auth-d2">{children}</div>

          <p className="auth-up auth-d4 mt-8 text-[11px] text-white/35">
            © {new Date().getFullYear()} Lito School · Lito Aviation Academy
          </p>
        </div>

        {/* ------------------- Painel do avatar (marca) ------------------- */}
        <div className="relative order-1 min-h-[260px] overflow-hidden bg-gradient-to-br from-[#0a1f3c] via-[#0d2b52] to-[#123a6b] lg:order-2 lg:min-h-[560px]">
          {/* halo atrás do personagem */}
          <div
            aria-hidden
            className="auth-glow pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 translate-y-1/4 rounded-full bg-[color:var(--accent)]/20 blur-3xl"
          />

          <div className="relative flex h-full flex-col items-center justify-between gap-4 p-8 text-center">
            <div>
              <p className="auth-up auth-d3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7ed957]">
                Lito Aviation Academy
              </p>
              <p className="auth-up auth-d4 mt-2 font-display text-2xl font-bold leading-tight text-white">
                Sua carreira na aviação decola aqui.
              </p>
            </div>

            {/* Avatar da plataforma recebendo o aluno */}
            <ChromaVideo
              src="/brand/promo-avatar.mp4"
              className="avatar-pop h-48 w-auto object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)] lg:h-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
