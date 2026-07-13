"use client";

import { useState } from "react";
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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (Object.keys(answers).length < questions.length) {
      setError("Responda todas as questoes antes de enviar.");
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
    else setResult(res.result);
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div
          className={`rounded-xl border p-6 text-center ${
            result.passed
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p className="text-4xl font-bold text-slate-900">{result.score}%</p>
          <p
            className={`mt-2 text-lg font-semibold ${
              result.passed ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {result.passed ? "Aprovado!" : "Reprovado"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {result.correct} de {result.total} corretas
          </p>
        </div>
        <button
          onClick={() => {
            setResult(null);
            setAnswers({});
          }}
          className="text-sm text-indigo-600 hover:underline"
        >
          Refazer a prova
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <Alert kind="error">{error}</Alert>}
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="mb-3 font-medium text-slate-800">
            {i + 1}. {q.statement}
          </p>
          <div className="space-y-2">
            {q.options.map((o) => (
              <label key={o.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name={q.id}
                  value={o.id}
                  checked={answers[q.id] === o.id}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                />
                {o.text}
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button type="submit" disabled={pending} className="w-auto px-6">
        {pending ? "Enviando..." : "Enviar respostas"}
      </Button>
    </form>
  );
}
