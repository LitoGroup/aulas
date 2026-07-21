import type { ReviewSummary } from "@/server/services/review";

interface Resposta {
  id: string;
  rating: number;
  comment: string | null;
  updatedAt: Date;
  aluno: string;
}

function Estrelas({ nota, tamanho = "h-4 w-4" }: { nota: number; tamanho?: string }) {
  return (
    <span className="flex text-[color:var(--accent-ink)]" aria-label={`${nota} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={tamanho}
          fill={n <= nota ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

const dataCurta = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d);

/** Resultado da pesquisa de satisfação, para o professor. */
export function ReviewSummaryPanel({
  resumo,
  respostas,
}: {
  resumo: ReviewSummary;
  respostas: Resposta[];
}) {
  if (resumo.total === 0) {
    return (
      <p className="text-sm text-[color:var(--muted)]">
        Nenhuma resposta ainda. A pesquisa aparece para o aluno quando ele conclui todas as aulas.
      </p>
    );
  }

  const comentarios = respostas.filter((r) => r.comment);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
        <div>
          <p className="text-3xl font-bold text-[color:var(--ink)]">
            {resumo.media.toFixed(1).replace(".", ",")}
          </p>
          <Estrelas nota={Math.round(resumo.media)} />
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            {resumo.total} {resumo.total === 1 ? "resposta" : "respostas"}
          </p>
        </div>

        <div className="min-w-48 flex-1 space-y-1">
          {([5, 4, 3, 2, 1] as const).map((n) => {
            const qtd = resumo.distribuicao[n];
            const pct = Math.round((qtd / resumo.total) * 100);
            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right text-[color:var(--muted)]">{n}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--canvas)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--accent)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-[color:var(--muted)]">{qtd}</span>
              </div>
            );
          })}
        </div>
      </div>

      {comentarios.length > 0 && (
        <ul className="space-y-2">
          {comentarios.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Estrelas nota={r.rating} tamanho="h-3.5 w-3.5" />
                <span className="text-sm font-semibold text-[color:var(--ink)]">{r.aluno}</span>
                <span className="text-xs text-[color:var(--muted)]">{dataCurta(r.updatedAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--ink-soft)]">
                {r.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
