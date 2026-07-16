export type LessonState = "done" | "locked" | "pending" | "current";

/** Círculo de status de aula (linguagem visual da lista de conteúdo). */
export function StatusCircle({ state }: { state: LessonState }) {
  if (state === "done") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--success)]">
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="white" strokeWidth="2">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (state === "locked") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--canvas)]">
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="var(--muted)" strokeWidth="1.4">
          <rect x="2.5" y="5" width="7" height="5" rx="1" />
          <path d="M4 5V3.8a2 2 0 0 1 4 0V5" />
        </svg>
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--ink)]">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="white">
          <path d="M4 2.5v7l5.5-3.5z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[color:var(--border-strong)]" />
  );
}

/** Rótulo curto do tipo de conteúdo da aula. */
export function typeLabel(contentType: string): string {
  if (contentType === "VIDEO") return "Aula";
  if (contentType === "FILE") return "Apostila";
  return "Leitura";
}
