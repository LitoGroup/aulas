"use client";

import { useActionState } from "react";
import { markCompleteAction, type ActionState } from "@/server/actions/progress";
import { Button, Alert } from "@/components/ui";

export function CompleteButton({
  lessonId,
  slug,
  done,
}: {
  lessonId: string;
  slug: string;
  done: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    markCompleteAction,
    null,
  );

  if (done) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
        ✓ Aula concluida
      </span>
    );
  }

  return (
    <form action={action} className="space-y-2">
      {state?.success && <Alert kind="success">{state.success}</Alert>}
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="slug" value={slug} />
      <Button type="submit" disabled={pending} className="w-auto px-6">
        {pending ? "Salvando..." : "Marcar como concluida"}
      </Button>
    </form>
  );
}
