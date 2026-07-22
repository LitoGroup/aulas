"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCourseAction } from "@/server/actions/course";

/**
 * Exclui um curso da lista de gestão. É irreversível e leva junto módulos,
 * aulas, materiais, matrículas, progresso e avaliações (cascata no banco), por
 * isso pede confirmação com o nome do curso.
 */
export function DeleteCourseButton({ courseId, title }: { courseId: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function excluir() {
    const ok = window.confirm(
      `Excluir o curso "${title}"?\n\n` +
        "Esta ação é permanente e remove todas as aulas, materiais, matrículas, " +
        "progresso dos alunos e avaliações. Não pode ser desfeita.",
    );
    if (!ok) return;
    setErro(null);
    start(async () => {
      const res = await deleteCourseAction(courseId);
      if ("error" in res) setErro(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end">
      <button
        type="button"
        onClick={excluir}
        disabled={pending}
        aria-label={`Excluir o curso ${title}`}
        title="Excluir curso"
        className="grid h-9 w-9 place-items-center rounded-lg text-[color:var(--muted)] transition hover:bg-[color:var(--danger)]/10 hover:text-[color:var(--danger)] disabled:opacity-50"
      >
        {pending ? (
          <span className="text-[11px] font-semibold">...</span>
        ) : (
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path
              d="M4 6h12M8 6V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6m2 0v9a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 15V6m3 3v5m4-5v5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {erro && <span className="mt-0.5 text-[11px] text-[color:var(--danger)]">{erro}</span>}
    </div>
  );
}
