import Link from "next/link";
import { ProgressRing } from "@/components/progress-ring";

type Lesson = { id: string; title: string; contentType: string };
type ModuleOutline = { id: string; title: string; order: number; lessons: Lesson[] };

const typeIcon: Record<string, string> = { VIDEO: "▶", TEXT: "¶", FILE: "PDF" };

export function LessonSidebar({
  courseTitle,
  modules,
  currentId,
  completed,
  locks,
  percent,
}: {
  courseTitle: string;
  modules: ModuleOutline[];
  currentId: string;
  completed: Set<string>;
  locks: Map<string, boolean>;
  percent: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[color:var(--border)] p-4">
        <ProgressRing percent={percent} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[color:var(--ink)]">{courseTitle}</p>
          <p className="text-xs text-[color:var(--muted)]">Conteúdo do curso</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {modules.map((m) => (
          <div key={m.id} className="mb-2">
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              {m.order + 1}. {m.title}
            </p>
            <ul className="space-y-0.5">
              {m.lessons.map((l) => {
                const isCurrent = l.id === currentId;
                const isDone = completed.has(l.id);
                const isLocked = locks.get(l.id) === true;

                const marker = isDone ? (
                  <span className="text-[color:var(--success)]">✓</span>
                ) : isLocked ? (
                  <span className="text-[color:var(--muted)]">🔒</span>
                ) : (
                  <span className="text-[10px] font-semibold text-[color:var(--brand-ink)]">
                    {typeIcon[l.contentType] ?? "•"}
                  </span>
                );

                const inner = (
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-5 w-6 shrink-0 items-center justify-center">{marker}</span>
                    <span className="truncate">{l.title}</span>
                  </span>
                );

                const base = "block rounded-lg px-2 py-2 text-sm transition";
                if (isLocked) {
                  return (
                    <li key={l.id}>
                      <span className={`${base} cursor-not-allowed text-[color:var(--muted)]`}>
                        {inner}
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${l.id}`}
                      className={`${base} ${
                        isCurrent
                          ? "bg-[color:var(--brand)]/10 font-semibold text-[color:var(--brand-ink)]"
                          : "text-[color:var(--ink-soft)] hover:bg-[color:var(--canvas)]"
                      }`}
                    >
                      {inner}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
