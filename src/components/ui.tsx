import type { ComponentProps, ReactNode } from "react";

const fieldBase =
  "w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[color:var(--ink)] shadow-[var(--shadow-sm)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)] focus:ring-4 focus:ring-[color:var(--brand)]/12 disabled:cursor-not-allowed disabled:opacity-60";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${fieldBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${fieldBase} resize-y ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`${fieldBase} cursor-pointer appearance-none pr-10 ${props.className ?? ""}`}
      />
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Label(props: ComponentProps<"label">) {
  return (
    <label
      {...props}
      className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[color:var(--ink-soft)] ${props.className ?? ""}`}
    />
  );
}

export function Button({
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" }) {
  const styles =
    variant === "primary"
      ? "brand-gradient text-white shadow-[var(--shadow-md)] hover:brightness-108 hover:-translate-y-px active:translate-y-0"
      : "border border-[color:var(--border)] bg-[var(--surface)] text-[color:var(--ink)] hover:bg-[color:var(--canvas)]";
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${props.className ?? ""}`}
    />
  );
}

export function Alert({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  const styles =
    kind === "error"
      ? "border-[color:var(--danger)]/25 bg-[color:var(--danger)]/8 text-[color:var(--danger)]"
      : "border-[color:var(--success)]/25 bg-[color:var(--success)]/8 text-[color:var(--success)]";
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  return (
    <Tag
      className={`rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning";
}) {
  const tones = {
    neutral: "bg-[color:var(--canvas)] text-[color:var(--muted)]",
    brand: "bg-[color:var(--brand)]/10 text-[color:var(--brand-ink)]",
    success: "bg-[color:var(--success)]/12 text-[color:var(--success)]",
    warning: "bg-[color:var(--accent)]/18 text-[#9a5b00]",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--ink)]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[color:var(--muted)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Barra de progresso reutilizável (âmbar → transição para verde no fim). */
export function ProgressBar({ percent }: { percent: number }) {
  const done = percent >= 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--canvas)]">
      <div
        className={`h-full rounded-full transition-all ${done ? "bg-[color:var(--success)]" : "bg-[color:var(--ink)]"}`}
        style={{ width: `${Math.max(percent, 3)}%` }}
      />
    </div>
  );
}
