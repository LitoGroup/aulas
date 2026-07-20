"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

/* --------------------------------- Ícones -------------------------------- */

const iconProps = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function MailIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className} aria-hidden>
      <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" />
      <path d="M3 6.5l6.3 4.2a1.5 1.5 0 0 0 1.4 0L17 6.5" />
    </svg>
  );
}

export function LockIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className} aria-hidden>
      <rect x="4" y="8.5" width="12" height="8" rx="2.5" />
      <path d="M7 8.5V6.6a3 3 0 0 1 6 0v1.9" />
    </svg>
  );
}

export function UserIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className} aria-hidden>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 16.5c.7-3 3-4.5 6-4.5s5.3 1.5 6 4.5" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-[13px] w-[13px]" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className} aria-hidden>
      <path d="M10 2.6l5.5 2v4.6c0 3.4-2.2 6.4-5.5 7.4-3.3-1-5.5-4-5.5-7.4V4.6z" />
      <path d="M7.6 10l1.7 1.7 3.2-3.4" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg {...iconProps} className="h-[18px] w-[18px]" aria-hidden>
      <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" />
      <circle cx="10" cy="10" r="2.2" />
      {off && <path d="M4 16L16 4" />}
    </svg>
  );
}

/* ------------------------------ Campo de texto ---------------------------- */

type FieldProps = Omit<ComponentProps<"input">, "className"> & {
  label: string;
  icon: ReactNode;
  hint?: string;
};

/**
 * Campo do fluxo de autenticação: rótulo, ícone dentro do campo e, em campos
 * de senha, botão para revelar o que foi digitado.
 */
export function AuthField({ label, icon, hint, id, type = "text", ...props }: FieldProps) {
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 transition-colors">
          {icon}
        </span>
        <input
          {...props}
          id={id}
          type={isPassword && visible ? "text" : type}
          className={`w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-white/25 focus:border-[color:var(--accent)]/55 focus:bg-white/[0.07] focus:ring-4 focus:ring-[color:var(--accent)]/12 disabled:opacity-60 ${
            isPassword ? "pr-12" : "pr-3.5"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/35 transition hover:bg-white/10 hover:text-white/85"
          >
            <EyeIcon off={visible} />
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-white/35">{hint}</p>}
    </div>
  );
}

/* --------------------------------- Botões --------------------------------- */

/** Botão principal do login, com brilho percorrendo a superfície. */
export function AuthButton({ children, ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="auth-shine relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#155ea8] to-[#1f7fd4] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_-10px_rgba(31,127,212,0.85)] transition hover:-translate-y-px hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

/** Ação secundária (criar conta, voltar) em contorno discreto. */
export function AuthGhostLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
    >
      {children}
    </a>
  );
}
