import type { Role } from "@prisma/client";
import { prisma } from "../db";

export class NotEnrolledError extends Error {
  constructor() {
    super("Aluno nao esta matriculado neste curso");
    this.name = "NotEnrolledError";
  }
}

export interface Actor {
  id: string;
  role: Role;
}

async function assertEnrolled(actor: Actor, assessmentId: string): Promise<string> {
  const a = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { courseId: true, course: { select: { ownerId: true } } },
  });
  if (!a) throw new NotEnrolledError();
  // Dono/admin sempre acessam; aluno precisa de matricula.
  if (actor.role === "ADMIN" || a.course.ownerId === actor.id) return a.courseId;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: actor.id, courseId: a.courseId } },
    select: { id: true },
  });
  if (!enrollment) throw new NotEnrolledError();
  return a.courseId;
}

/**
 * Retorna a avaliacao para responder, SEM o gabarito (isCorrect nao e
 * selecionado) - evita cola no cliente.
 */
export async function getAssessmentForTaking(actor: Actor, assessmentId: string) {
  await assertEnrolled(actor, assessmentId);
  return prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      title: true,
      passingScore: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          statement: true,
          type: true,
          options: { select: { id: true, text: true } },
        },
      },
    },
  });
}

export interface AttemptResult {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
}

export async function submitAttempt(
  actor: Actor,
  assessmentId: string,
  answers: { questionId: string; selectedOptionId: string }[],
): Promise<AttemptResult> {
  await assertEnrolled(actor, assessmentId);

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      passingScore: true,
      questions: {
        select: { id: true, options: { select: { id: true, isCorrect: true } } },
      },
    },
  });
  if (!assessment) throw new NotEnrolledError();

  const total = assessment.questions.length;
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedOptionId]));

  // Gabarito calculado server-side.
  const correctOptionByQuestion = new Map(
    assessment.questions.map((q) => [q.id, q.options.find((o) => o.isCorrect)?.id]),
  );

  let correct = 0;
  for (const q of assessment.questions) {
    const selected = answerByQuestion.get(q.id);
    if (selected && selected === correctOptionByQuestion.get(q.id)) correct++;
  }

  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  const passed = score >= assessment.passingScore;

  // Persiste a tentativa + respostas dadas (somente respostas validas).
  const validAnswers = answers.filter((a) =>
    assessment.questions.some((q) => q.id === a.questionId),
  );
  await prisma.assessmentAttempt.create({
    data: {
      assessmentId,
      userId: actor.id,
      score,
      passed,
      answers: {
        create: validAnswers.map((a) => ({
          questionId: a.questionId,
          selectedOptionId: a.selectedOptionId,
        })),
      },
    },
  });

  return { score, passed, correct, total };
}

export function listAttempts(userId: string, assessmentId: string) {
  return prisma.assessmentAttempt.findMany({
    where: { userId, assessmentId },
    orderBy: { submittedAt: "desc" },
  });
}

export interface StudentAssessmentRow {
  id: string;
  title: string;
  passingScore: number;
  questionCount: number;
  attempts: number;
  best: number | null;
  passed: boolean;
}

export interface StudentAssessmentsByCourse {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  assessments: StudentAssessmentRow[];
}

/** Todas as avaliacoes dos cursos em que o aluno esta matriculado, com o resumo dele. */
export async function listStudentAssessments(
  userId: string,
): Promise<StudentAssessmentsByCourse[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          assessments: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              title: true,
              passingScore: true,
              _count: { select: { questions: true } },
            },
          },
        },
      },
    },
  });

  const attempts = await prisma.assessmentAttempt.findMany({
    where: { userId },
    select: { assessmentId: true, score: true, passed: true },
  });
  const byAssessment = new Map<string, { attempts: number; best: number; passed: boolean }>();
  for (const a of attempts) {
    const cur = byAssessment.get(a.assessmentId);
    byAssessment.set(a.assessmentId, {
      attempts: (cur?.attempts ?? 0) + 1,
      best: Math.max(cur?.best ?? 0, a.score),
      passed: (cur?.passed ?? false) || a.passed,
    });
  }

  return enrollments.map((e) => ({
    courseId: e.course.id,
    courseTitle: e.course.title,
    courseSlug: e.course.slug,
    assessments: e.course.assessments.map((a) => {
      const s = byAssessment.get(a.id);
      return {
        id: a.id,
        title: a.title,
        passingScore: a.passingScore,
        questionCount: a._count.questions,
        attempts: s?.attempts ?? 0,
        best: s ? s.best : null,
        passed: s?.passed ?? false,
      };
    }),
  }));
}
