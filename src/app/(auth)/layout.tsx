import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";

// Estrelas com posições determinísticas (sem aleatoriedade em render).
const STARS = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 97) % 100;
  const y = (i * 61) % 62;
  const r = i % 7 === 0 ? 1.6 : i % 3 === 0 ? 1.1 : 0.7;
  return { x, y, r, delay: (i % 9) * 0.5 };
});

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

        {/* --------------------- Cena: céu noturno --------------------- */}
        <div className="relative order-1 min-h-[220px] overflow-hidden lg:order-2 lg:min-h-[560px]">
          {/* gradiente do céu */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050a14] via-[#0d1f38] to-[#1d3552]" />
          {/* brilho do horizonte */}
          <div
            aria-hidden
            className="horizon-glow absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#c9763f]/45 via-[#5b4a6b]/20 to-transparent"
          />

          {/* estrelas */}
          <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {STARS.map((s, i) => (
              <circle
                key={i}
                className="star"
                cx={s.x}
                cy={s.y}
                r={s.r / 6}
                fill="white"
                style={{ animationDelay: `${s.delay}s` }}
              />
            ))}
          </svg>

          {/* avião cruzando com rastro */}
          <div aria-hidden className="sky-plane absolute left-0 top-1/3">
            <div className="relative">
              <span className="absolute right-full top-1/2 h-px w-28 -translate-y-1/2 bg-gradient-to-l from-white/50 to-transparent" />
              <svg viewBox="0 0 24 24" className="h-7 w-7 -rotate-[18deg] text-white/90" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5z" />
              </svg>
            </div>
          </div>

          {/* silhueta de montanhas */}
          <svg
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/5 w-full"
            viewBox="0 0 600 200"
            preserveAspectRatio="none"
            fill="none"
          >
            <path d="M0 200V120l70-45 55 38 60-58 75 62 65-40 80 55 60-32 75 48v52z" fill="#050a12" opacity="0.95" />
            <path d="M0 200v-40l90-32 70 30 85-42 90 46 75-28 90 40 100-24v50z" fill="#020509" />
          </svg>

          {/* chamada sobre a cena */}
          <div className="absolute inset-x-0 bottom-0 p-8">
            <p className="auth-up auth-d3 text-xs font-semibold uppercase tracking-[0.2em] text-[#7ed957]">
              Lito Aviation Academy
            </p>
            <p className="auth-up auth-d4 mt-2 font-display text-2xl font-bold leading-tight text-white">
              Sua carreira na aviação
              <br />
              decola aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
