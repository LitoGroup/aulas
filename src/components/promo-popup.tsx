"use client";

import { useEffect, useState } from "react";

const COMPLETE_COURSE_URL =
  "https://litoaviationacademy.com.br/formacoes-e-cursos/mecanico-de-aeronaves-basico-celula-avionica-gmp/";

const FIRST_DELAY_MS = 15_000; // primeira aparição após 15s
const INTERVAL_MS = 120_000; // reaparece a cada 2 minutos

export function PromoPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const first = setTimeout(() => setShow(true), FIRST_DELAY_MS);
    const interval = setInterval(() => setShow(true), INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="promo-pop fixed bottom-4 right-4 z-50 w-[19rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[color:var(--accent)]/40 bg-[var(--surface)] shadow-[var(--shadow-lg)]">
      {/* faixa superior de destaque */}
      <div className="brand-gradient relative px-4 py-3">
        <button
          onClick={() => setShow(false)}
          aria-label="Fechar"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          ✕
        </button>
        <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">
          Oferta Lito Academy
        </p>
        <p className="mt-0.5 pr-6 font-display text-base font-bold text-white">
          Gostando do conteúdo? ✈️
        </p>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-sm text-[color:var(--ink-soft)]">
          Desbloqueie a <strong className="text-[color:var(--ink)]">formação completa de Mecânico
          de Aeronaves</strong> (Célula + Aviônica + GMP) e saia pronto para o mercado.
        </p>
        <a
          href={COMPLETE_COURSE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="promo-cta flex items-center justify-center gap-1.5 rounded-xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-bold text-[#0a1f3c] transition hover:brightness-105"
        >
          Adquirir curso completo →
        </a>
        <button
          onClick={() => setShow(false)}
          className="block w-full text-center text-xs text-[color:var(--muted)] hover:text-[color:var(--ink)]"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
