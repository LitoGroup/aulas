"use client";

import { useState } from "react";

const COUPON = "MMA10";

export function DiscountBanner() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(COUPON).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl brand-gradient px-5 py-4 shadow-[var(--shadow-md)] sm:px-6">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[color:var(--accent)]/20 blur-2xl"
      />
      <div className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent)] text-[#0a1f3c]">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 9V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z" strokeLinejoin="round" />
            <path d="M9 8v.01M15 16v.01M15 8l-6 8" strokeLinecap="round" />
          </svg>
        </span>
        <div className="leading-tight text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--accent)]">
            Oferta por tempo limitado
          </p>
          <p className="text-base font-bold sm:text-lg">
            10% de desconto em todos os cursos abaixo!
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-2">
        <span className="text-sm text-white/80">Use o cupom:</span>
        <button
          onClick={copy}
          className="promo-cta inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[color:var(--accent)] bg-[color:var(--accent)]/15 px-4 py-2 text-base font-extrabold tracking-widest text-white transition hover:bg-[color:var(--accent)]/25"
          title="Clique para copiar"
        >
          {COUPON}
          <span className="text-xs font-semibold text-[color:var(--accent)]">
            {copied ? "COPIADO!" : "COPIAR"}
          </span>
        </button>
      </div>
    </div>
  );
}
