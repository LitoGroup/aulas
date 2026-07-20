"use client";

import { BrandMark } from "@/components/brand-logo";
import { ChromaVideo } from "@/components/chroma-video";

/**
 * Tela de boas-vindas exibida logo após o login, enquanto a área do aluno
 * é preparada. O avatar da plataforma recebe o aluno pelo nome.
 */
export function WelcomeSplash({ name }: { name?: string | null }) {
  const firstName = (name ?? "").trim().split(/\s+/)[0];

  return (
    <div className="welcome-fade fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1f3c] via-[#0d2b52] to-[#123a6b] px-6">
      {/* marca */}
      <div className="flex items-center gap-2.5">
        <BrandMark size={36} variant="white" />
        <span className="font-display text-xl font-bold text-white">Lito School</span>
      </div>

      {/* avatar recebendo o aluno */}
      <div className="mt-6">
        <ChromaVideo
          src="/brand/promo-avatar.mp4"
          className="avatar-pop h-56 w-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
        />
      </div>

      <p className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
        {firstName ? `Bem-vindo, ${firstName}!` : "Bem-vindo!"}
      </p>
      <p className="mt-2 text-sm text-white/70">Preparando sua área de estudos...</p>

      {/* barra de progresso de 4s */}
      <div className="mt-7 h-1.5 w-64 overflow-hidden rounded-full bg-white/15">
        <div className="welcome-bar h-full rounded-full bg-[color:var(--accent)]" />
      </div>
    </div>
  );
}
