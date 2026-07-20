"use client";

import { createPortal } from "react-dom";
import { BrandMark } from "@/components/brand-logo";

/**
 * Tela de boas-vindas exibida logo após o login, enquanto a área do aluno é
 * preparada.
 *
 * Vai para o body via portal: o card do login usa backdrop-blur, e um elemento
 * com filtro vira o bloco de contenção dos filhos `fixed` — dentro dele a tela
 * ficaria presa à coluna do formulário em vez de cobrir a página.
 */
export function WelcomeSplash({ name }: { name?: string | null }) {
  const firstName = (name ?? "").trim().split(/\s+/)[0];

  const conteudo = (
    <div className="auth-dark welcome-fade fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#071628] px-6">
      {/* mesma ambientação da tela de login */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f3c] via-[#0c2a4e] to-[#07182c]" />
        <div className="auth-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="auth-ring absolute inset-0 rounded-full border border-[color:var(--accent)]/20"
              style={{ animationDelay: `${i * 0.9}s` }}
            />
          ))}
        </div>
        <div className="auth-glow absolute -bottom-32 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[color:var(--accent)]/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center">
        <div className="auth-up auth-d1 flex items-center gap-2.5">
          <BrandMark size={34} variant="white" />
          <span className="font-display text-lg font-bold text-white">Lito School</span>
        </div>

        {/* personagem sobre o palco de luz */}
        <div className="relative mt-7">
          <div
            aria-hidden
            className="auth-stage absolute -bottom-1 left-1/2 h-4 w-28 -translate-x-1/2 rounded-[50%] bg-[color:var(--accent)]/30 blur-lg"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/avatar-lito.png"
            alt=""
            aria-hidden
            className="avatar-pop relative h-52 w-auto object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,0.55)] sm:h-64"
          />
        </div>

        <p className="auth-up auth-d3 mt-7 font-display text-3xl font-bold text-white sm:text-4xl">
          {firstName ? `Bem-vindo, ${firstName}!` : "Bem-vindo!"}
        </p>
        <p className="auth-up auth-d4 mt-2 text-sm text-white/55">
          Preparando sua área de estudos...
        </p>

        <div className="auth-up auth-d4 mt-7 h-1.5 w-60 overflow-hidden rounded-full bg-white/10">
          <div className="welcome-bar h-full rounded-full bg-[color:var(--accent)]" />
        </div>
      </div>
    </div>
  );

  // Só é renderizada após o clique no login, nunca no servidor.
  if (typeof document === "undefined") return null;
  return createPortal(conteudo, document.body);
}
