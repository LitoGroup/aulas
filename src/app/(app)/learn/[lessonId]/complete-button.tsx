"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markCompleteAction } from "@/server/actions/progress";
import { Button, Alert } from "@/components/ui";

export function CompleteButton({
  lessonId,
  slug,
  done,
  nextHref,
  podeConcluir,
}: {
  lessonId: string;
  slug: string;
  done: boolean;
  nextHref: string | null;
  /** Só há progresso a registrar para quem tem matrícula no curso. */
  podeConcluir: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Deixa a próxima aula pronta antes do clique. Sem isso a navegação após
  // concluir espera uma ida ao servidor e o botão parece travado.
  useEffect(() => {
    if (nextHref) router.prefetch(nextHref);
  }, [router, nextHref]);

  function complete(advance: boolean) {
    setError(null);
    const fd = new FormData();
    fd.set("lessonId", lessonId);
    fd.set("slug", slug);

    // A action revalida a rota atual, o que dispara um refresh. Fora de uma
    // transition esse refresh corria junto com o router.push e descartava a
    // navegação: a aula era marcada, mas o aluno continuava na mesma tela e
    // precisava clicar de novo. Dentro da transition as duas atualizações são
    // sequenciadas.
    startTransition(async () => {
      const res = await markCompleteAction(null, fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      if (advance && nextHref) router.push(nextHref);
    });
  }

  const primaria =
    "inline-flex w-auto items-center justify-center gap-2 rounded-xl brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)] transition hover:-translate-y-px hover:brightness-108";

  // Sem matrícula não existe progresso para gravar (a ação recusaria), mas
  // navegar entre as aulas continua útil para quem está conferindo o curso.
  if (!podeConcluir) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-[color:var(--muted)]">
          Visualizando sem matrícula: seu progresso não é registrado.
        </span>
        {nextHref && (
          <Link href={nextHref} prefetch className={primaria}>
            Próxima aula
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && <Alert kind="error">{error}</Alert>}
      <div className="flex flex-wrap items-center gap-3">
        {done ? (
          <span className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--success)]/12 px-4 py-2.5 text-sm font-semibold text-[color:var(--success)]">
            Aula concluída
          </span>
        ) : (
          <Button
            type="button"
            onClick={() => complete(false)}
            disabled={pending}
            variant="ghost"
            className="w-auto px-5"
          >
            {pending ? "Salvando..." : "Marcar como concluída"}
          </Button>
        )}

        {nextHref &&
          (done ? (
            // Aula já concluída: só navegar. Chamar a action de novo aqui
            // custava uma ida ao servidor inteira antes de sair da página.
            <Link href={nextHref} prefetch className={primaria}>
              Próxima aula
            </Link>
          ) : (
            <Button
              type="button"
              onClick={() => complete(true)}
              disabled={pending}
              className="w-auto px-5"
            >
              {pending ? "Salvando..." : "Concluir e avançar"}
            </Button>
          ))}
      </div>
    </div>
  );
}
