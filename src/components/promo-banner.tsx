import { BrandMark } from "@/components/brand-logo";
import { ChromaVideo } from "@/components/chroma-video";

const COMPLETE_COURSE_URL =
  "https://litoaviationacademy.com.br/formacoes-e-cursos/mecanico-de-aeronaves-basico-celula-avionica-gmp/";

/** Banner promocional fixo no topo da aula (CTA para o curso completo). */
export function PromoBanner() {
  return (
    <a
      href={COMPLETE_COURSE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl brand-gradient px-5 py-3.5 shadow-[var(--shadow-md)]"
    >
      {/* brilho decorativo */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color:var(--accent)]/20 blur-2xl"
      />
      <div className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <BrandMark size={30} variant="white" />
        </span>
        <div className="leading-tight text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--accent)]">
            Lito Aviation Academy
          </p>
          <p className="text-sm font-bold sm:text-base">
            Está gostando? Garanta a formação completa de Mecânico de Aeronaves.
          </p>
        </div>
      </div>
      <div className="relative ml-auto flex shrink-0 items-center gap-4">
        {/* Avatar da plataforma: fundo removido, com entrada, flutuação e fala */}
        <div className="relative hidden sm:block">
          <span className="avatar-bubble absolute -top-1 right-full mr-2 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1f3c] shadow-[var(--shadow-md)]">
            Bora decolar na carreira?
            <span className="absolute right-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-white" />
          </span>
          <ChromaVideo
            src="/brand/promo-avatar.mp4"
            className="avatar-pop h-28 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
          />
        </div>
        <span className="promo-cta rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-[#0a1f3c] transition group-hover:brightness-105">
          Adquirir agora
        </span>
      </div>
    </a>
  );
}
