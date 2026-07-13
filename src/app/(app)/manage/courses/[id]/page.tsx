import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getManageCourse, NotOwnerError } from "@/server/services/course";
import { listAssessmentsByCourse } from "@/server/services/assessment";
import { CourseEditForm, ModuleForm, LessonForm } from "../../course-forms";
import { AttachmentUpload } from "../../attachment-upload";

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
      <Link href="/manage" className="text-sm text-indigo-600 hover:underline">
        &larr; Meus cursos
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">Dados do curso</h1>
        <CourseEditForm
          course={{
            id: course.id,
            title: course.title,
            description: course.description,
            isPublished: course.isPublished,
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Conteudo</h2>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <ModuleForm courseId={course.id} />
        </div>

        {course.modules.length === 0 && (
          <p className="text-sm text-slate-500">Nenhum modulo ainda.</p>
        )}

        {course.modules.map((m) => (
          <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 font-medium text-slate-800">
              {m.order + 1}. {m.title}
            </h3>
            {m.lessons.length > 0 && (
              <ul className="mb-3 space-y-1 text-sm text-slate-600">
                {m.lessons.map((l) => (
                  <li key={l.id} className="border-b border-slate-100 pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                        {l.contentType}
                      </span>
                      {l.title}
                    </div>
                    {l.attachments.length > 0 && (
                      <ul className="ml-6 mt-1 list-disc text-xs text-slate-500">
                        {l.attachments.map((a) => (
                          <li key={a.id}>{a.fileName}</li>
                        ))}
                      </ul>
                    )}
                    <AttachmentUpload courseId={course.id} lessonId={l.id} />
                  </li>
                ))}
              </ul>
            )}
            <LessonForm courseId={course.id} moduleId={m.id} />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Avaliacoes</h2>
          <Link
            href={`/manage/courses/${course.id}/assessments/new`}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Nova avaliacao
          </Link>
        </div>
        {assessments.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma avaliacao ainda.</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {assessments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/manage/courses/${course.id}/assessments/${a.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">{a.title}</span>
                  <span className="text-xs text-slate-500">
                    {a._count.questions} questao(oes) · corte {a.passingScore}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
