"use client";

import { useEffect, useState } from "react";

/**
 * Conteúdo do curso: card fixo na lateral no desktop, gaveta no celular.
 *
 * A lista é renderizada uma única vez e só muda de apresentação por CSS. No
 * celular ela vinha sem contenção de altura — um curso de 40 aulas virava uma
 * cauda de rolagem embaixo do player.
 */
export function CourseContentPanel({
  concluidas,
  total,
  children,
}: {
  concluidas: number;
  total: number;
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", onKey);
    };
  }, [aberto]);

  return (
    <>
      {/* Gatilho: só no celular */}
      <button
        onClick={() => setAberto(true)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-4 py-3 text-left shadow-[var(--shadow-sm)] transition active:bg-[color:var(--canvas)] lg:hidden"
      >
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4 shrink-0 text-[color:var(--muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
        </svg>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[color:var(--ink)]">
            Conteúdo do curso
          </span>
          <span className="block text-xs text-[color:var(--muted)]">
            {concluidas} de {total} aulas concluídas
          </span>
        </span>
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4 shrink-0 text-[color:var(--muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M6 3.5L10.5 8L6 12.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {aberto && (
        <button
          aria-label="Fechar conteúdo do curso"
          onClick={() => setAberto(false)}
          className="sheet-fade fixed inset-0 z-[55] h-full w-full bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Mesma lista, duas apresentações: gaveta no celular, card no desktop. */}
      <div
        className={`overflow-hidden border-[color:var(--border)] bg-[var(--surface)] ${
          aberto
            ? "sheet-up fixed inset-x-0 bottom-0 z-[60] h-[76vh] rounded-t-3xl border-t pb-safe"
            : "hidden"
        } lg:static lg:z-auto lg:block lg:h-full lg:rounded-2xl lg:border lg:pb-0 lg:shadow-[var(--shadow-sm)]`}
      >
        {aberto && (
          <div className="flex justify-center pb-1 pt-3 lg:hidden">
            <span className="h-1 w-10 rounded-full bg-[color:var(--border-strong)]" />
          </div>
        )}
        <div className="h-full min-h-0">{children}</div>
      </div>
    </>
  );
}
