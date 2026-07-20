/**
 * Painel de apresentação da tela de autenticação: cena de torre de controle
 * (radar varrendo, rota de voo com a aeronave percorrendo, palco de luz) com o
 * personagem da plataforma recebendo o aluno. Tudo decorativo — sem interação.
 */

// Arco que sobe pela esquerda, passa acima da cabeça do personagem e sai pelo
// canto superior direito. A rota antiga era uma diagonal que cruzava o corpo.
const ROTA = "M -20 200 C 60 175 140 140 230 128 C 320 116 400 80 460 20";

const RECURSOS = [
  { texto: "Aulas em vídeo", posicao: "left-2 top-[26%]", atraso: "0s" },
  { texto: "Apostilas para baixar", posicao: "right-1 top-[47%]", atraso: "1.1s" },
  { texto: "Avaliação com nota", posicao: "left-5 bottom-[27%]", atraso: "2.2s" },
];

const MENSAGENS = [
  "Conteúdo produzido pela equipe da Lito Aviation Academy.",
  "Assista às aulas, baixe o material e acompanhe seu progresso.",
  "Estude quando e onde quiser, no seu ritmo.",
];

export function AuthShowcase() {
  return (
    <div className="relative min-h-[260px] overflow-hidden bg-gradient-to-b from-[#0a1f3c] via-[#0c2a4e] to-[#07182c] lg:order-2 lg:min-h-[640px]">
      {/* -------------------------- Cena de fundo -------------------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* radar: anéis expandindo e feixe girando atrás do personagem */}
        <div className="absolute left-1/2 top-[54%] h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="auth-ring absolute inset-0 rounded-full border border-[color:var(--accent)]/20"
              style={{ animationDelay: `${i * 2}s` }}
            />
          ))}
          <div
            className="auth-sweep absolute inset-0 rounded-full opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(126,217,87,0.16), rgba(126,217,87,0) 24%)",
              maskImage: "radial-gradient(circle, #000 30%, transparent 72%)",
            }}
          />
        </div>

        {/* Rota de voo com a aeronave percorrendo o traçado. Só no desktop: no
            painel curto do celular o traçado cai sobre o título. */}
        <svg
          viewBox="0 0 420 560"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 hidden h-full w-full lg:block"
        >
          <defs>
            <linearGradient id="auth-rota-cor" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#7ed957" stopOpacity="0" />
              <stop offset="45%" stopColor="#7ed957" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7ed957" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={ROTA}
            fill="none"
            stroke="url(#auth-rota-cor)"
            strokeWidth="1.6"
            strokeDasharray="5 9"
            strokeLinecap="round"
          />
          <g className="auth-smil" fill="#e6f6d8" opacity="0.9">
            <path d="M 9 0 L -6 -5 L -2.5 0 L -6 5 Z" />
            <animateMotion dur="15s" repeatCount="indefinite" rotate="auto" path={ROTA} />
          </g>
        </svg>

        {/* facho de luz do palco, vindo de cima */}
        <div
          className="absolute left-1/2 top-0 h-[72%] w-[76%] -translate-x-1/2 opacity-45"
          style={{
            clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent 78%)",
          }}
        />
      </div>

      {/* --------------------------- Conteúdo ------------------------------ */}
      <div className="relative flex h-full flex-col items-center justify-between px-7 py-8 text-center sm:px-9">
        <div className="max-w-xs">
          <p className="auth-up auth-d3 inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)]/25 bg-[color:var(--accent)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9be36f]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9be36f]" />
            Lito Aviation Academy
          </p>
          <p className="auth-up auth-d4 mt-3 font-display text-[1.6rem] font-bold leading-[1.15] text-white">
            Sua carreira na aviação decola aqui.
          </p>
        </div>

        {/* personagem sobre o palco, cercado pelos recursos da plataforma */}
        <div className="relative flex w-full flex-1 items-end justify-center">
          <div
            aria-hidden
            className="auth-stage absolute bottom-3 left-1/2 h-5 w-36 -translate-x-1/2 rounded-[50%] bg-[color:var(--accent)]/30 blur-xl"
          />
          {RECURSOS.map((r) => (
            <div key={r.texto} className={`auth-up auth-d5 absolute hidden lg:block ${r.posicao}`}>
              <span
                className="auth-chip inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] py-1.5 pl-2 pr-3.5 text-[11px] font-medium text-white/85 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.9)] backdrop-blur-md"
                style={{ animationDelay: r.atraso }}
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-[color:var(--accent)]/25 text-[9px] text-[#b6ef8f]">
                  ✓
                </span>
                {r.texto}
              </span>
            </div>
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/avatar-lito.png"
            alt=""
            aria-hidden
            className="avatar-pop relative h-40 w-auto object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,0.55)] sm:h-52 lg:h-[26rem]"
          />
        </div>

        {/* frases que se revezam sobre a plataforma */}
        <div className="relative mt-5 h-11 w-full max-w-[19rem]">
          {MENSAGENS.map((m, i) => (
            <p
              key={m}
              className={`auth-msg absolute inset-0 flex items-center justify-center text-[13px] leading-snug text-white/55 ${
                i === 1 ? "auth-msg-2" : i === 2 ? "auth-msg-3" : ""
              }`}
            >
              {m}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
