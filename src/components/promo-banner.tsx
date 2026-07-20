import { BrandMark } from "@/components/brand-logo";

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
        {/* Avatar circular (medalhão) com o boneco */}
        <span className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-[color:var(--accent)]/60 ring-offset-2 ring-offset-transparent sm:block">
          <video
            src="/brand/promo-avatar.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
            className="absolute inset-0 h-full w-full scale-125 object-cover object-[center_18%]"
          />
        </span>
        <span className="promo-cta rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-[#0a1f3c] transition group-hover:brightness-105">
          Adquirir agora
        </span>
      </div>
    </a>
  );
}
