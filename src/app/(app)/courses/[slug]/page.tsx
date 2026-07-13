import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/rbac";
import { getCourseBySlug } from "@/server/services/course";
import { isEnrolled } from "@/server/services/enrollment";
import { EnrollButton } from "../enroll-button";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const actor = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  const course = await getCourseBySlug(slug);

  if (!course || !course.isPublished) notFound();

  const enrolled = await isEnrolled(actor.id, course.id);

  return (
    <div className="space-y-6">
      <Link href="/courses" className="text-sm text-indigo-600 hover:underline">
        &larr; Catalogo
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{course.description}</p>
        <div className="mt-4">
          {enrolled ? (
            <span className="rounded bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              Voce esta matriculado
            </span>
          ) : (
            <EnrollButton courseId={course.id} slug={course.slug} />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {course.modules.map((m) => (
          <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-800">
              {m.order + 1}. {m.title}
            </h2>
            <ul className="space-y-2">
              {m.lessons.map((l) => (
                <li key={l.id}>
                  {enrolled ? (
                    <Link
                      href={`/learn/${l.id}`}
                      className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                    >
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        {l.contentType}
                      </span>
                      {l.title}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                        {l.contentType}
                      </span>
                      {l.title}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
