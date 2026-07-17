import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getLessonForViewer } from "@/server/services/lesson";
import { getCourseOutline } from "@/server/services/course";
import { isInlineViewable } from "@/server/services/attachment";
import { isEnrolled } from "@/server/services/enrollment";
import { getCourseProgress } from "@/server/services/progress";
import { computeLessonLocks } from "@/server/services/lesson-access";
import { VideoEmbed } from "@/components/video-embed";
import { createVideoPlaybackUrl } from "@/server/storage";
import { typeLabel } from "@/components/status-circle";
import { PromoBanner } from "@/components/promo-banner";
import { CompleteButton } from "./complete-button";
import { LessonSidebar } from "./lesson-sidebar";

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
  const enrolled = isOwner || (await isEnrolled(actor.id, course.id));
  if (!enrolled) redirect(`/courses/${course.slug}`);

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
                const inline = isInlineViewable(a.mimeType, a.fileName);
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] px-3.5 py-2.5"
                  >
                    <span className="flex items-center gap-2 text-[color:var(--ink-soft)]">
                      <span className="text-[color:var(--brand-ink)]">▣</span>
                      {a.fileName}
                    </span>
                    <a
                      href={`/api/attachments/${a.id}/download`}
                      target={inline ? "_blank" : undefined}
                      rel={inline ? "noopener noreferrer" : undefined}
                      className="shrink-0 font-medium text-[color:var(--brand-ink)] hover:underline"
                    >
                      {inline ? "Abrir ↗" : "Baixar"}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!isOwner && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] pt-5">
            <CompleteButton
              lessonId={lessonId}
              slug={course.slug}
              done={done}
              nextHref={next ? `/learn/${next.id}` : null}
            />
            {prev && (
              <Link
                href={`/learn/${prev.id}`}
                className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
              >
                ← Aula anterior
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Sidebar do curso */}
      <aside className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
        <div className="h-full overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          <LessonSidebar
            courseTitle={outline.title}
            modules={outline.modules}
            currentId={lessonId}
            completed={completed}
            locks={locks}
            percent={progress.percent}
          />
        </div>
      </aside>
    </div>
  );
}
