const COMPLETE_COURSE_URL =
  "https://litoaviationacademy.com.br/formacoes-e-cursos/mecanico-de-aeronaves-basico-celula-avionica-gmp/";

/** Banner promocional fixo no topo da aula (CTA para o curso completo). */
export function PromoBanner() {
  return (
    <a
      href={COMPLETE_COURSE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl brand-gradient px-5 py-3.5 shadow-[var(--shadow-md)]"
    >
      {/* brilho decorativo */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color:var(--accent)]/20 blur-2xl"
      />
      <div className="relative flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent)] text-[#0a1f3c]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L12 19v-5.5z" />
          </svg>
        </span>
        <div className="leading-tight text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--accent)]">
            Lito Aviation Academy
          </p>
          <p className="text-sm font-bold sm:text-base">
            Está gostando? Garanta a formação completa de Mecânico de Aeronaves.
          </p>
        </div>
      </div>
      <span className="promo-cta relative shrink-0 rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-[#0a1f3c] transition group-hover:brightness-105">
        Adquirir agora →
      </span>
    </a>
  );
}
