"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markCompleteAction } from "@/server/actions/progress";
import { Button, Alert } from "@/components/ui";

export function CompleteButton({
  lessonId,
  slug,
  done,
  nextHref,
}: {
  lessonId: string;
  slug: string;
  done: boolean;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function complete(advance: boolean) {
    setError(null);
    setPending(true);
    const fd = new FormData();
    fd.set("lessonId", lessonId);
    fd.set("slug", slug);
    const res = await markCompleteAction(null, fd);
    setPending(false);
    if (res?.error) {
      setError(res.error);
      return;
    }
    if (advance && nextHref) router.push(nextHref);
    else router.refresh();
  }

  return (
    <div className="space-y-2">
      {error && <Alert kind="error">{error}</Alert>}
      <div className="flex flex-wrap items-center gap-3">
        {done ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--success)]/12 px-4 py-2.5 text-sm font-semibold text-[color:var(--success)]">
            ✓ Aula concluída
          </span>
        ) : (
          <Button
            onClick={() => complete(false)}
            disabled={pending}
            variant="ghost"
            className="w-auto px-5"
          >
            {pending ? "Salvando..." : "Marcar como concluída"}
          </Button>
        )}

        {nextHref && (
          <Button onClick={() => complete(true)} disabled={pending} className="w-auto px-5">
            {done ? "Próxima aula →" : "Concluir e avançar →"}
          </Button>
        )}
      </div>
    </div>
  );
}
