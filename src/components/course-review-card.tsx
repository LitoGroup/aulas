"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, type ActionState } from "@/server/actions/review";
import { Alert, Textarea } from "@/components/ui";
import { COMENTARIO_MAXIMO } from "@/lib/validation/review";

const LEGENDAS: Record<number, string> = {
  1: "Muito ruim",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Excelente",
};

function Estrela({ preenchida }: { preenchida: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill={preenchida ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </svg>
  );
}

/**
 * Pesquisa de satisfação do curso concluído.
 *
 * As estrelas são um grupo de rádio de verdade (não botões), para funcionar
 * por teclado e ser anunciado corretamente por leitor de tela.
 */
export function CourseReviewCard({
  courseId,
  slug,
  notaAtual,
  comentarioAtual,
}: {
  courseId: string;
  slug: string;
  notaAtual: number | null;
  comentarioAtual: string | null;
}) {
  const jaRespondeu = notaAtual !== null;
  const [editando, setEditando] = useState(!jaRespondeu);
  const [nota, setNota] = useState(notaAtual ?? 0);
  const [passouOMouse, setPassouOMouse] = useState(0);
  const [comentario, setComentario] = useState(comentarioAtual ?? "");
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    submitReviewAction,
    null,
  );

  const emDestaque = passouOMouse || nota;

  if (jaRespondeu && !editando && !state?.error) {
    return (
      <div className="rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.06] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[color:var(--ink)]">
              Obrigado por avaliar este curso
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[color:var(--accent-ink)]">
              <span className="flex" aria-label={`Sua nota: ${nota} de 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="h-5 w-5">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill={n <= nota ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden
                    >
                      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
                    </svg>
                  </span>
                ))}
              </span>
              <span className="text-sm font-medium">{LEGENDAS[nota]}</span>
            </div>
            {comentario && (
              <p className="mt-2 text-sm text-[color:var(--ink-soft)]">“{comentario}”</p>
            )}
          </div>
          <button
            onClick={() => setEditando(true)}
            className="shrink-0 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--canvas)]"
          >
            Editar avaliação
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.06] p-5"
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={nota} />

      <p className="text-base font-bold text-[color:var(--ink)]">
        {jaRespondeu ? "Editar sua avaliação" : "Você concluiu o curso!"}
      </p>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        Como foi sua experiência? Sua resposta ajuda a melhorar as próximas turmas.
      </p>

      {state?.error && (
        <div className="mt-3">
          <Alert kind="error">{state.error}</Alert>
        </div>
      )}

      <fieldset
        className="mt-4"
        onMouseLeave={() => setPassouOMouse(0)}
      >
        <legend className="sr-only">Nota de 1 a 5</legend>
        <div className="flex items-center gap-1 text-[color:var(--accent-ink)]">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              onMouseEnter={() => setPassouOMouse(n)}
              className="cursor-pointer rounded-lg p-1 transition focus-within:ring-2 focus-within:ring-[color:var(--accent)] hover:scale-110"
            >
              <input
                type="radio"
                name="nota-visual"
                value={n}
                checked={nota === n}
                onChange={() => setNota(n)}
                className="sr-only"
              />
              <span className={n <= emDestaque ? "" : "text-[color:var(--border-strong)]"}>
                <Estrela preenchida={n <= emDestaque} />
              </span>
              <span className="sr-only">
                {n} {n === 1 ? "estrela" : "estrelas"} — {LEGENDAS[n]}
              </span>
            </label>
          ))}
          <span className="ml-2 text-sm font-medium text-[color:var(--ink-soft)]">
            {emDestaque ? LEGENDAS[emDestaque] : "Toque nas estrelas"}
          </span>
        </div>
      </fieldset>

      <div className="mt-4">
        <label
          htmlFor="comentario"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[color:var(--ink-soft)]"
        >
          Comentário (opcional)
        </label>
        <Textarea
          id="comentario"
          name="comment"
          rows={3}
          maxLength={COMENTARIO_MAXIMO}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="O que funcionou bem? O que dava para melhorar?"
        />
        <p className="mt-1 text-right text-[11px] text-[color:var(--muted)]">
          {comentario.length}/{COMENTARIO_MAXIMO}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || nota === 0}
          className="rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Enviando..." : jaRespondeu ? "Salvar alterações" : "Enviar avaliação"}
        </button>
        {jaRespondeu && (
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="min-h-[2.5rem] px-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
          >
            Cancelar
          </button>
        )}
        {nota === 0 && (
          <span className="text-xs text-[color:var(--muted)]">Escolha uma nota para enviar</span>
        )}
      </div>
    </form>
  );
}
