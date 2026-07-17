import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <header className="border-b border-[color:var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-4 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--accent)] text-sm font-extrabold text-[#0a1f3c]">
              LS
            </span>
            <span className="font-display text-lg font-bold text-[color:var(--ink)]">Lito School</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <article className="prose-legal space-y-4 text-sm leading-relaxed text-[color:var(--ink-soft)]">
          {children}
        </article>
      </main>
    </div>
  );
}
