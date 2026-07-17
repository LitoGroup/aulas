import Link from "next/link";
import { BrandMark } from "@/components/brand-logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--canvas)]">
      <header className="border-b border-[color:var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-4 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={36} variant="adaptive" />
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
