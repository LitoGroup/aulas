import Link from "next/link";

/**
 * Tela mostrada quando um aluno abre um curso que já esteve publicado e foi
 * despublicado. Diferente de um rascunho nunca publicado (esse continua
 * escondido, com 404).
 */
export function CourseComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-lg py-10 text-center sm:py-16">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--accent)]/12 text-[color:var(--accent-ink)]">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 2M9 3h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {title}
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-[color:var(--ink)] sm:text-3xl">
        Será liberado em breve
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[color:var(--ink-soft)]">
        Este curso está passando por ajustes e ficará disponível novamente em breve. Seu progresso
        fica guardado e volta com ele.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition hover:-translate-y-px"
        >
          Voltar ao painel
        </Link>
        <Link
          href="/courses"
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--canvas)]"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
