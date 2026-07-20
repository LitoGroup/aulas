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
      className={`relative flex min-h-[15rem] flex-col justify-between overflow-hidden rounded-2xl shadow-[var(--shadow-md)] sm:min-h-[22rem] ${className}`}
    >
      {/* Foto de fundo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/hero-mma.jpeg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[70%_15%]"
      />
      {/* Filtro escuro para legibilidade (mais forte à esquerda) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f3c]/95 via-[#0a1f3c]/75 to-[#0a1f3c]/25" />

      <div className="relative flex flex-1 flex-col justify-between gap-6 p-7">
        <div>
          <span className="inline-block rounded-full bg-[color:var(--accent)]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)] ring-1 ring-[color:var(--accent)]/40">
            Oferta por tempo limitado
          </span>
          <p className="mt-3 max-w-md font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
            10% de desconto em todos os cursos
          </p>
          <p className="mt-1 text-sm text-white/70">
            Válido nas formações e cursos de manutenção da Lito Aviation Academy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-white/70">Use o cupom:</span>
          <div className="flex items-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/25 backdrop-blur">
            <span className="px-4 py-2.5 text-base font-bold tracking-widest text-white">
              {COUPON}
            </span>
            <button
              onClick={copy}
              className="border-l border-white/20 bg-[color:var(--accent)] px-4 py-2.5 text-sm font-bold text-[#0a1f3c] transition hover:brightness-105"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
