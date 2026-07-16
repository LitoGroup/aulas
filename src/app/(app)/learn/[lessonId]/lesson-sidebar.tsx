import Link from "next/link";
import { ProgressRing } from "@/components/progress-ring";
import { StatusCircle, typeLabel } from "@/components/status-circle";

type Lesson = { id: string; title: string; contentType: string };
type ModuleOutline = { id: string; title: string; order: number; lessons: Lesson[] };

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

      <div className="flex-1 overflow-y-auto">
        {modules.map((m) => {
          const hasCurrent = m.lessons.some((l) => l.id === currentId);
          const doneInModule = m.lessons.filter((l) => completed.has(l.id)).length;
          return (
            <details key={m.id} open={hasCurrent} className="group border-b border-[color:var(--border)] last:border-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 transition hover:bg-[color:var(--canvas)]">
                <span className="flex min-w-0 items-center gap-2">
                  <svg
                    viewBox="0 0 12 12"
                    className="h-2.5 w-2.5 shrink-0 text-[color:var(--muted)] transition-transform group-open:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 2.5L8 6l-4 3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="truncate text-sm font-semibold text-[color:var(--ink)]">
                    {m.order + 1}. {m.title}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-[color:var(--muted)]">
                  {doneInModule}/{m.lessons.length}
                </span>
              </summary>

              <ul className="pb-1">
                {m.lessons.map((l) => {
                  const isCurrent = l.id === currentId;
                  const isDone = completed.has(l.id);
                  const isLocked = locks.get(l.id) === true;
                  const state = isCurrent ? "current" : isDone ? "done" : isLocked ? "locked" : "pending";

                  const inner = (
                    <span className="flex items-center gap-2.5 px-4 py-2">
                      <StatusCircle state={state} />
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-sm ${
                            isCurrent
                              ? "font-semibold text-[color:var(--ink)]"
                              : isLocked
                                ? "text-[color:var(--muted)]"
                                : "text-[color:var(--ink-soft)]"
                          }`}
                        >
                          {l.title}
                        </span>
                        <span className="text-[11px] text-[color:var(--muted)]">
                          {typeLabel(l.contentType)}
                        </span>
                      </span>
                    </span>
                  );

                  if (isLocked) {
                    return (
                      <li key={l.id} className="cursor-not-allowed opacity-70">
                        {inner}
                      </li>
                    );
                  }
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/learn/${l.id}`}
                        className={`block transition ${
                          isCurrent
                            ? "bg-[color:var(--ink)]/5"
                            : "hover:bg-[color:var(--canvas)]"
                        }`}
                      >
                        {inner}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}
