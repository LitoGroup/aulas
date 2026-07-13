import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getManageCourse, NotOwnerError } from "@/server/services/course";
import { listAssessmentsByCourse } from "@/server/services/assessment";
import { CourseEditForm, ModuleForm, LessonForm } from "../../course-forms";
import { AttachmentUpload } from "../../attachment-upload";
import { ModuleControls, LessonControls } from "../../content-edit-forms";
import { Card, Badge } from "@/components/ui";

export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await requireRole(["TEACHER", "ADMIN"]);

  let course;
  try {
    course = await getManageCourse(actor, id);
  } catch (e) {
    if (e instanceof NotOwnerError) notFound();
    throw e;
  }
  if (!course) notFound();

  const assessments = await listAssessmentsByCourse(course.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/manage" className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]">
          ← Meus cursos
        </Link>
        <Link
          href={`/manage/courses/${course.id}/students`}
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--canvas)]"
        >
          Alunos e notas
        </Link>
      </div>

      <Card as="section" className="p-6">
        <h1 className="mb-4 text-lg font-bold text-[color:var(--ink)]">Dados do curso</h1>
        <CourseEditForm
          course={{
            id: course.id,
            title: course.title,
            description: course.description,
            isPublished: course.isPublished,
          }}
        />
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[color:var(--ink)]">Conteúdo</h2>

        <Card className="p-4">
          <ModuleForm courseId={course.id} />
        </Card>

        {course.modules.length === 0 && (
          <p className="text-sm text-[color:var(--muted)]">Nenhum módulo ainda.</p>
        )}

        {course.modules.map((m) => (
          <Card key={m.id} className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-[color:var(--ink)]">
                {m.order + 1}. {m.title}
              </h3>
              <ModuleControls courseId={course.id} moduleId={m.id} title={m.title} />
            </div>

            {m.lessons.length > 0 && (
              <ul className="mb-4 space-y-2">
                {m.lessons.map((l) => (
                  <li
                    key={l.id}
                    className="rounded-xl border border-[color:var(--border)] p-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-[color:var(--ink)]">
                      <Badge>{l.contentType}</Badge>
                      {l.title}
                    </div>
                    {l.attachments.length > 0 && (
                      <ul className="ml-1 mt-1.5 list-inside list-disc text-xs text-[color:var(--muted)]">
                        {l.attachments.map((a) => (
                          <li key={a.id}>{a.fileName}</li>
                        ))}
                      </ul>
                    )}
                    <AttachmentUpload courseId={course.id} lessonId={l.id} />
                    <LessonControls
                      courseId={course.id}
                      lesson={{
                        id: l.id,
                        title: l.title,
                        contentType: l.contentType,
                        videoProvider: l.videoProvider,
                        videoRef: l.videoRef,
                        textBody: l.textBody,
                        requiresPrevious: l.requiresPrevious,
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
            <LessonForm courseId={course.id} moduleId={m.id} />
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[color:var(--ink)]">Avaliações</h2>
          <Link
            href={`/manage/courses/${course.id}/assessments/new`}
            className="rounded-xl brand-gradient px-3.5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-md)]"
          >
            Nova avaliação
          </Link>
        </div>
        {assessments.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">Nenhuma avaliação ainda.</p>
        ) : (
          <Card>
            <ul className="divide-y divide-[color:var(--border)]">
              {assessments.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/manage/courses/${course.id}/assessments/${a.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[color:var(--canvas)]"
                  >
                    <span className="font-medium text-[color:var(--ink)]">{a.title}</span>
                    <span className="text-xs text-[color:var(--muted)]">
                      {a._count.questions} questão(ões) · corte {a.passingScore}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
