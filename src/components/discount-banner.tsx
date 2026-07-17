"use client";

import { useState } from "react";

const COUPON = "MMA10";

export function DiscountBanner({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(COUPON).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-6 py-5 shadow-[var(--shadow-sm)] ${className}`}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent)]/12 text-[color:var(--accent-ink)]">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 8h.01M16 16h.01M16 8L8 16" strokeLinecap="round" />
            <rect x="3" y="3" width="18" height="18" rx="4" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
            Oferta por tempo limitado
          </p>
          <p className="mt-0.5 text-lg font-bold text-[color:var(--ink)]">
            10% de desconto em todos os cursos
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-[color:var(--muted)]">Cupom</span>
        <div className="flex items-center overflow-hidden rounded-xl border border-[color:var(--border-strong)]">
          <span className="px-3.5 py-2 text-sm font-bold tracking-wider text-[color:var(--ink)]">
            {COUPON}
          </span>
          <button
            onClick={copy}
            className="border-l border-[color:var(--border-strong)] bg-[color:var(--canvas)] px-3.5 py-2 text-xs font-semibold text-[color:var(--ink-soft)] transition hover:bg-[color:var(--ink)]/[0.06]"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}
