import type { Assessment, Role } from "@prisma/client";
import { prisma } from "../db";
import {
  assessmentInputSchema,
  questionInputSchema,
  type AssessmentInput,
  type QuestionInput,
} from "@/lib/validation/assessment";

export class AssessmentForbiddenError extends Error {
  constructor() {
    super("Sem permissao sobre esta avaliacao");
    this.name = "AssessmentForbiddenError";
  }
}

export class InvalidQuestionError extends Error {
  constructor(message = "Questao invalida") {
    super(message);
    this.name = "InvalidQuestionError";
  }
}

export interface Actor {
  id: string;
  role: Role;
}

function canEdit(actor: Actor, ownerId: string): boolean {
  return actor.role === "ADMIN" || actor.id === ownerId;
}

async function assertCanEditCourse(actor: Actor, courseId: string): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { ownerId: true },
  });
  if (!course || !canEdit(actor, course.ownerId)) throw new AssessmentForbiddenError();
}

async function assertCanEditAssessment(actor: Actor, assessmentId: string): Promise<void> {
  const a = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { course: { select: { ownerId: true } } },
  });
  if (!a || !canEdit(actor, a.course.ownerId)) throw new AssessmentForbiddenError();
}

export async function createAssessment(
  actor: Actor,
  courseId: string,
  input: AssessmentInput,
): Promise<Assessment> {
  await assertCanEditCourse(actor, courseId);
  const data = assessmentInputSchema.parse(input);
  return prisma.assessment.create({
    data: {
      courseId,
      title: data.title,
      passingScore: data.passingScore,
      moduleId: data.moduleId ?? null,
    },
  });
}

async function nextQuestionOrder(assessmentId: string): Promise<number> {
  const last = await prisma.question.findFirst({
    where: { assessmentId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return last ? last.order + 1 : 0;
}

export async function addQuestion(
  actor: Actor,
  assessmentId: string,
  input: QuestionInput,
) {
  await assertCanEditAssessment(actor, assessmentId);

  const parsed = questionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new InvalidQuestionError(parsed.error.issues[0]?.message);
  }
  const data = parsed.data;

  return prisma.question.create({
    data: {
      assessmentId,
      statement: data.statement,
      type: data.type,
      order: await nextQuestionOrder(assessmentId),
      options: {
        create: data.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
      },
    },
    include: { options: true },
  });
}

export async function getAssessmentForEditing(actor: Actor, assessmentId: string) {
  await assertCanEditAssessment(actor, assessmentId);
  return prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: { orderBy: { order: "asc" }, include: { options: true } },
    },
  });
}

export async function deleteQuestion(actor: Actor, questionId: string): Promise<void> {
  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: { assessmentId: true },
  });
  if (!q) return;
  await assertCanEditAssessment(actor, q.assessmentId);
  await prisma.question.delete({ where: { id: questionId } });
}

export function listAssessmentsByCourse(courseId: string) {
  return prisma.assessment.findMany({
    where: { courseId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { questions: true } } },
  });
}

export { assertCanEditCourse };
