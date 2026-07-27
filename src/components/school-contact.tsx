import { ESCOLA } from "@/lib/contact";

function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        d="M5 3h3l1.2 3.2-1.7 1.3a10 10 0 0 0 4 4l1.3-1.7L15 13.9V17a1 1 0 0 1-1.1 1A12.5 12.5 0 0 1 2 6.1 1 1 0 0 1 3 5h2z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M2.5 10h15M10 2.5c2.5 2.4 2.5 12.6 0 15M10 2.5c-2.5 2.4-2.5 12.6 0 15" />
    </svg>
  );
}

/**
 * Bloco de contato da escola. `card` para o painel (usa os tokens do tema);
 * `inline` para o rodapé do login (fundo escuro).
 */
export function SchoolContact({ variant = "card" }: { variant?: "card" | "inline" }) {
  if (variant === "inline") {
    return (
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/40">
        <a href={ESCOLA.telefoneHref} className="inline-flex items-center gap-1.5 transition hover:text-white/80">
          <PhoneIcon className="h-[13px] w-[13px]" />
          {ESCOLA.telefone}
        </a>
        <a
          href={ESCOLA.siteHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 transition hover:text-white/80"
        >
          <GlobeIcon className="h-[13px] w-[13px]" />
          {ESCOLA.site}
        </a>
      </div>
    );
  }

  const botao =
    "inline-flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)]/40 hover:bg-[color:var(--canvas)]";

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
      <h2 className="font-bold text-[color:var(--ink)]">Fale com a Lito Aviation Academy</h2>
      <p className="mt-0.5 text-sm text-[color:var(--muted)]">
        Precisa de ajuda ou quer conhecer outros cursos? A gente te atende.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={ESCOLA.telefoneHref} className={botao}>
          <PhoneIcon className="h-4 w-4 text-[color:var(--accent-ink)]" />
          {ESCOLA.telefone}
        </a>
        <a href={ESCOLA.siteHref} target="_blank" rel="noopener noreferrer" className={botao}>
          <GlobeIcon className="h-4 w-4 text-[color:var(--accent-ink)]" />
          {ESCOLA.site}
        </a>
      </div>
    </section>
  );
}
