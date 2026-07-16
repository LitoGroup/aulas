"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAttemptAction } from "@/server/actions/assessment";
import type { AttemptResult } from "@/server/services/grading";
import { Button, Alert } from "@/components/ui";

interface Question {
  id: string;
  statement: string;
  type: string;
  options: { id: string; text: string }[];
}

export function TakeForm({
  assessmentId,
  questions,
}: {
  assessmentId: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (Object.keys(answers).length < questions.length) {
      setError("Responda todas as questões antes de enviar.");
      return;
    }
    setPending(true);
    const payload = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
    const res = await submitAttemptAction(assessmentId, payload);
    setPending(false);
    if ("error" in res) setError(res.error);
    else {
      setResult(res.result);
      router.refresh(); // atualiza as estatísticas da página
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div
          className={`rounded-2xl border p-8 text-center shadow-[var(--shadow-sm)] ${
            result.passed
              ? "border-[color:var(--success)]/30 bg-[color:var(--success)]/5"
              : "border-[color:var(--danger)]/30 bg-[color:var(--danger)]/5"
          }`}
        >
          <p className="text-5xl font-bold text-[color:var(--ink)]">{result.score}%</p>
          <p
            className={`mt-2 text-lg font-bold ${
              result.passed ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"
            }`}
          >
            {result.passed ? "Aprovado!" : "Reprovado"}
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Você acertou {result.correct} de {result.total} questões
          </p>
          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
              setStarted(false);
            }}
            className="mt-5 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--canvas)]"
          >
            {result.passed ? "Voltar às estatísticas" : "Tentar novamente"}
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex justify-center">
        <Button onClick={() => setStarted(true)} className="w-auto px-8 py-3">
          Iniciar Nova Tentativa
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && <Alert kind="error">{error}</Alert>}
      {questions.map((q, i) => (
        <div
          key={q.id}
          className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
        >
          <p className="mb-3 font-semibold text-[color:var(--ink)]">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[color:var(--ink)] text-xs font-bold text-white">
              {i + 1}
            </span>
            {q.statement}
          </p>
          <div className="space-y-1.5">
            {q.options.map((o) => (
              <label
                key={o.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition ${
                  answers[q.id] === o.id
                    ? "border-[color:var(--ink)] bg-[color:var(--ink)]/5 font-medium text-[color:var(--ink)]"
                    : "border-[color:var(--border)] text-[color:var(--ink-soft)] hover:bg-[color:var(--canvas)]"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={o.id}
                  checked={answers[q.id] === o.id}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                  className="accent-[#18181b]"
                />
                {o.text}
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[color:var(--muted)]">
          {Object.keys(answers).length}/{questions.length} respondidas
        </span>
        <Button type="submit" disabled={pending} className="w-auto px-8">
          {pending ? "Enviando..." : "Enviar respostas"}
        </Button>
      </div>
    </form>
  );
}
