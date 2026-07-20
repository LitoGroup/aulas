"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    // No celular sobe acima da barra de abas para não cobrir a navegação.
    <div className="fixed inset-x-0 bottom-[3.75rem] z-50 p-4 pb-safe lg:bottom-0">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)] sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-[color:var(--ink-soft)]">
          Usamos cookies essenciais para manter você conectado e melhorar sua experiência. Ao
          continuar, você concorda com a nossa{" "}
          <Link href="/privacidade" className="font-medium text-[color:var(--brand-ink)] underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)]"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
