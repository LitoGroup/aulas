import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getLessonForViewer } from "@/server/services/lesson";
import { getCourseOutline } from "@/server/services/course";
import { isInlineViewable, formatarTamanho } from "@/server/services/attachment";
import { isEnrolled } from "@/server/services/enrollment";
import { getCourseProgress } from "@/server/services/progress";
import { computeLessonLocks } from "@/server/services/lesson-access";
import { VideoEmbed } from "@/components/video-embed";
import { createVideoPlaybackUrl } from "@/server/storage";
import { typeLabel } from "@/components/status-circle";
import { PromoBanner } from "@/components/promo-banner";
import { CompleteButton } from "./complete-button";
import { LessonSidebar } from "./lesson-sidebar";
import { CourseContentPanel } from "./course-content-panel";

export default async function LessonViewerPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const lesson = await getLessonForViewer(lessonId);
  if (!lesson) notFound();

  const course = lesson.module.course;
  const isOwner = course.ownerId === actor.id || actor.role === "ADMIN";
  // Matrícula e permissão de ver são coisas diferentes: o professor abre a aula
  // para conferir, mas só quem tem matrícula tem progresso para registrar.
  const matriculado = await isEnrolled(actor.id, course.id);
  if (!isOwner && !matriculado) redirect(`/courses/${course.slug}`);

  const [outline, progress] = await Promise.all([
    getCourseOutline(course.id),
    getCourseProgress(actor.id, course.id),
  ]);
  if (!outline) notFound();

  const ordered = outline.modules.flatMap((m) =>
    m.lessons.map((l) => ({ id: l.id, requiresPrevious: l.requiresPrevious })),
  );
  const completed = new Set(progress.completedLessonIds);
  const locks = computeLessonLocks(ordered, completed);

  if (!isOwner && locks.get(lessonId) === true) redirect(`/courses/${course.slug}`);

  const index = ordered.findIndex((l) => l.id === lessonId);
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;
  const prev = index > 0 ? ordered[index - 1] : null;
  const done = completed.has(lessonId);
  const position = index + 1;

  // Vídeo hospedado na plataforma: URL assinada temporária (2h), gerada
  // somente após os guards de matrícula/cadeado acima.
  const playbackUrl =
    lesson.contentType === "VIDEO" && lesson.videoProvider === "S3" && lesson.videoRef
      ? await createVideoPlaybackUrl(lesson.videoRef)
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Player principal */}
      <div className="min-w-0 space-y-5">
        <PromoBanner />

        {/* Cabeçalho profissional da aula */}
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          <div className="brand-gradient h-1.5 w-full" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav className="flex items-center gap-2 text-xs font-medium text-[color:var(--muted)]">
                <Link href="/courses" className="hover:text-[color:var(--ink)]">
                  Cursos
                </Link>
                <span>/</span>
                <Link href={`/courses/${course.slug}`} className="hover:text-[color:var(--ink)]">
                  {course.title}
                </Link>
                <span>/</span>
                <span className="text-[color:var(--ink-soft)]">{lesson.module.title}</span>
              </nav>
              <span className="rounded-full bg-[color:var(--ink)]/[0.06] px-3 py-1 text-xs font-semibold text-[color:var(--ink-soft)]">
                Aula {position} de {ordered.length}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--navy-fill)] text-white">
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                  <path d="M6 4.5v11l9-5.5z" />
                </svg>
              </span>
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight text-[color:var(--ink)] sm:text-2xl">
                  {lesson.title}
                </h1>
                <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--muted)]">
                  <span className="rounded bg-[color:var(--canvas)] px-1.5 py-0.5 font-medium">
                    {typeLabel(lesson.contentType)}
                  </span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 font-medium text-[color:var(--success)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
                      Concluída
                    </span>
                  ) : (
                    <span>Em andamento</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {lesson.contentType === "VIDEO" && (
          <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-lg)]">
            {playbackUrl ? (
              <video
                controls
                controlsList="nodownload"
                preload="metadata"
                playsInline
                className="aspect-video w-full bg-black"
                src={playbackUrl}
                title={lesson.title}
              />
            ) : (
              <VideoEmbed provider={lesson.videoProvider} videoRef={lesson.videoRef} title={lesson.title} />
            )}
          </div>
        )}

        {lesson.textBody && (
          <div className="whitespace-pre-wrap rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-6 text-sm leading-relaxed text-[color:var(--ink-soft)]">
            {lesson.textBody}
          </div>
        )}

        {lesson.attachments.length > 0 && (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5">
            <h2 className="mb-3 text-sm font-semibold text-[color:var(--ink)]">
              Materiais desta aula
            </h2>
            <ul className="space-y-2 text-sm">
              {lesson.attachments.map((a) => {
                const podeAbrir = isInlineViewable(a.mimeType, a.fileName);
                const tamanho = formatarTamanho(a.sizeBytes);
                const acao =
                  "inline-flex min-h-[2.25rem] items-center gap-1 rounded-lg px-2.5 font-medium transition";
                return (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-[color:var(--border)] px-3.5 py-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-[color:var(--ink-soft)]">
                      <span className="shrink-0 text-[color:var(--brand-ink)]">▣</span>
                      <span className="truncate">{a.fileName}</span>
                      {tamanho && (
                        <span className="shrink-0 text-xs text-[color:var(--muted)]">
                          {tamanho}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {/* PDFs e imagens ganham as duas opções; o resto só baixa,
                          porque o navegador não exibe DOCX/ZIP inline. */}
                      {podeAbrir && (
                        <a
                          href={`/api/attachments/${a.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${acao} text-[color:var(--brand-ink)] hover:bg-[color:var(--canvas)]`}
                        >
                          Abrir
                          <span aria-hidden>↗</span>
                        </a>
                      )}
                      <a
                        href={`/api/attachments/${a.id}/download?modo=baixar`}
                        className={`${acao} border border-[color:var(--border)] text-[color:var(--ink-soft)] hover:bg-[color:var(--canvas)]`}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M8 2v8M4.5 7L8 10.5 11.5 7M2.5 13h11" />
                        </svg>
                        Baixar
                      </a>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Curso terminado: leva à pesquisa, senão o aluno conclui a última
            aula e nunca descobre que ela existe. */}
        {matriculado && progress.total > 0 && progress.percent >= 100 && (
          <Link
            href={`/courses/${course.slug}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.06] p-5 transition hover:bg-[color:var(--accent)]/10"
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold text-[color:var(--ink)]">
                Você concluiu o curso!
              </span>
              <span className="mt-0.5 block text-sm text-[color:var(--muted)]">
                Conte como foi sua experiência — leva menos de um minuto.
              </span>
            </span>
            <span className="shrink-0 rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-md)]">
              Avaliar o curso
            </span>
          </Link>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-5">
          <CompleteButton
            lessonId={lessonId}
            slug={course.slug}
            done={done}
            nextHref={next ? `/learn/${next.id}` : null}
            podeConcluir={matriculado}
          />
          {prev && (
            <Link
              href={`/learn/${prev.id}`}
              className="inline-flex min-h-[2.5rem] items-center px-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
            >
              ← Aula anterior
            </Link>
          )}
        </div>
      </div>

      {/* Conteúdo do curso. No celular vai para o topo como gaveta compacta;
          no desktop continua sendo a coluna fixa da direita. */}
      <aside className="order-first lg:order-none lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
        <CourseContentPanel concluidas={progress.completed} total={progress.total}>
          <LessonSidebar
            courseTitle={outline.title}
            modules={outline.modules}
            currentId={lessonId}
            completed={completed}
            locks={locks}
            percent={progress.percent}
          />
        </CourseContentPanel>
      </aside>
    </div>
  );
}
