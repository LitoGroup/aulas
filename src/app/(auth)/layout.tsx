import Link from "next/link";

const features = [
  "Cursos, aulas e apostilas num só lugar",
  "Avaliações com correção automática",
  "Acompanhe seu progresso em tempo real",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de marca (esquerda) */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f3c] via-[#0d2b52] to-[#123a6b]" />

        {/* Céu: horizonte + trajetória de voo */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.16]"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 600 800"
          fill="none"
        >
          <defs>
            <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M34 0H0V34" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="600" height="800" fill="url(#grid)" />
          <path d="M-40 640 Q 300 480 660 600" stroke="#7ed957" strokeWidth="2" strokeDasharray="6 10" />
          <circle cx="300" cy="527" r="4" fill="#7ed957" />
        </svg>

        {/* Avião estilizado */}
        <svg
          aria-hidden
          className="absolute right-[-40px] top-24 h-64 w-64 rotate-[18deg] text-[#7ed957] opacity-25"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5z" />
        </svg>

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold ring-1 ring-white/20 backdrop-blur">
              LS
            </span>
            <span className="font-display text-2xl font-bold">Lito School</span>
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7ed957]">
              Lito Aviation Academy
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight">
              Sua carreira na aviação decola aqui.
            </h2>
            <ul className="mt-8 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-white/85">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7ed957] text-[#0a1f3c]">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Lito School · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Formulário (direita) */}
      <div className="flex items-center justify-center bg-[var(--canvas)] px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Marca no topo (mobile) */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white">
              LS
            </span>
            <span className="font-display text-xl font-bold text-[color:var(--ink)]">Lito School</span>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
