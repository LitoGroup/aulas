import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getLessonForViewer } from "@/server/services/lesson";
import { isEnrolled } from "@/server/services/enrollment";
import { VideoEmbed } from "@/components/video-embed";

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

  // Guard: so matriculados (ou dono/admin) acessam a aula.
  if (!enrolled) redirect(`/courses/${course.slug}`);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/courses/${course.slug}`} className="text-sm text-indigo-600 hover:underline">
        &larr; {course.title}
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900">{lesson.title}</h1>

      {lesson.contentType === "VIDEO" && (
        <VideoEmbed provider={lesson.videoProvider} videoRef={lesson.videoRef} title={lesson.title} />
      )}

      {lesson.textBody && (
        <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700">
          {lesson.textBody}
        </div>
      )}

      {lesson.attachments.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-medium text-slate-800">Apostilas</h2>
          <ul className="space-y-2 text-sm">
            {lesson.attachments.map((a) => (
              <li key={a.id}>
                <a
                  href={`/api/attachments/${a.id}/download`}
                  className="text-indigo-600 hover:underline"
                >
                  {a.fileName}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
