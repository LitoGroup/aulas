"use client";

import { useActionState } from "react";
import { enrollAction, type ActionState } from "@/server/actions/enrollment";
import { Button, Alert } from "@/components/ui";

export function EnrollButton({ courseId, slug }: { courseId: string; slug: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    enrollAction,
    null,
  );
  return (
    <form action={action} className="space-y-2">
      {state?.success && <Alert kind="success">{state.success}</Alert>}
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="slug" value={slug} />
      <Button type="submit" disabled={pending} className="w-auto px-6">
        {pending ? "Matriculando..." : "Matricular-me"}
      </Button>
    </form>
  );
}
