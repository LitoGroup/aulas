import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import {
  getAssessmentForTaking,
  listAttempts,
  NotEnrolledError,
} from "@/server/services/grading";
import { TakeForm } from "./take-form";

function Stat({
  value,
  label,
  tone = "neutral",
}: {
  value: string | number;
  label: string;
  tone?: "neutral" | "bad" | "good";
}) {
  const ring =
    tone === "good"
      ? "bg-[color:var(--success)]/10 text-[color:var(--success)]"
      : tone === "bad"
        ? "bg-[color:var(--danger)]/10 text-[color:var(--danger)]"
        : "bg-[color:var(--canvas)] text-[color:var(--ink)]";
  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${ring}`}>
        {value}
      </span>
      <span className="text-center text-xs font-medium text-[color:var(--muted)]">{label}</span>
    </div>
  );
}

export default async function TakeAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);

  let assessment;
  try {
    assessment = await getAssessmentForTaking(actor, id);
  } catch (e) {
    if (e instanceof NotEnrolledError) redirect("/courses");
    throw e;
  }
  if (!assessment) notFound();

  const attempts = await listAttempts(actor.id, id);
  const scores = attempts.map((a) => a.score);
  const best = scores.length ? Math.max(...scores) : null;
  const worst = scores.length ? Math.min(...scores) : null;
  const approved = attempts.some((a) => a.passed);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard"
        className="-ml-2 inline-flex min-h-[2.5rem] items-center px-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
      >
        ← Painel
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[color:var(--ink)]">{assessment.title}</h1>
        {approved && (
          <p className="mt-1 text-sm font-medium text-[color:var(--success)]">
            Você já foi aprovado nesta avaliação
          </p>
        )}
      </div>

      {/* Instruções */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5 text-sm leading-relaxed text-[color:var(--ink-soft)] shadow-[var(--shadow-sm)]">
        <p className="font-semibold text-[color:var(--ink)]">Atenção</p>
        <p className="mt-1">
          Esta avaliação vale nota. Leia cada questão com cuidado antes de responder - o
          resultado é calculado automaticamente ao enviar.
        </p>
        <p className="mt-1">
          Para aprovação você precisa de <strong className="text-[color:var(--ink)]">{assessment.passingScore}%</strong> de acertos.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat value={assessment.questions.length} label="Questões" />
          <Stat value={attempts.length} label="Tentativas realizadas" />
          <Stat value={worst === null ? "-" : `${worst}%`} label="Menor nota" tone={worst !== null && worst < assessment.passingScore ? "bad" : "neutral"} />
          <Stat value={best === null ? "-" : `${best}%`} label="Maior nota" tone={best !== null && best >= assessment.passingScore ? "good" : "neutral"} />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 border-t border-[color:var(--border)] pt-4 text-sm text-[color:var(--muted)]">
          <span>Nota para aprovação:</span>
          <span className="font-bold text-[color:var(--ink)]">{assessment.passingScore}%</span>
        </div>
      </div>

      {assessment.questions.length === 0 ? (
        <p className="text-sm text-[color:var(--muted)]">Esta avaliação ainda não tem questões.</p>
      ) : (
        <TakeForm assessmentId={assessment.id} questions={assessment.questions} />
      )}
    </div>
  );
}
