import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import { enroll } from "./enrollment";
import { createAssessment, addQuestion } from "./assessment";
import {
  getAssessmentForTaking,
  submitAttempt,
  NotEnrolledError,
} from "./grading";

const marker = `grad_${Date.now()}`;
let student: { id: string; role: "STUDENT" };
let outsider: { id: string; role: "STUDENT" };
let assessmentId: string;
let q1: { id: string; correct: string; wrong: string };
let q2: { id: string; correct: string; wrong: string };

beforeAll(async () => {
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  const s = await createUser({ name: "Aluno", email: `${marker}_s@e.com`, password: "senha1234" });
  const o = await createUser({ name: "Fora", email: `${marker}_o@e.com`, password: "senha1234" });
  student = { id: s.id, role: "STUDENT" };
  outsider = { id: o.id, role: "STUDENT" };
  const teacher = { id: t.id, role: "TEACHER" as const };
  const c = await createCourse(t.id, { title: `${marker} Curso` });
  await enroll(student.id, c.id);

  const a = await createAssessment(teacher, c.id, { title: "Prova", passingScore: 70 });
  assessmentId = a.id;
  const question1 = await addQuestion(teacher, a.id, {
    statement: "2+2?",
    type: "MULTIPLE_CHOICE",
    options: [
      { text: "4", isCorrect: true },
      { text: "5", isCorrect: false },
    ],
  });
  const question2 = await addQuestion(teacher, a.id, {
    statement: "Ceu e azul?",
    type: "TRUE_FALSE",
    options: [
      { text: "Verdadeiro", isCorrect: true },
      { text: "Falso", isCorrect: false },
    ],
  });
  q1 = {
    id: question1.id,
    correct: question1.options.find((o) => o.isCorrect)!.id,
    wrong: question1.options.find((o) => !o.isCorrect)!.id,
  };
  q2 = {
    id: question2.id,
    correct: question2.options.find((o) => o.isCorrect)!.id,
    wrong: question2.options.find((o) => !o.isCorrect)!.id,
  };
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("grading", () => {
  it("nao expoe isCorrect na tela de responder", async () => {
    const taking = await getAssessmentForTaking(student, assessmentId);
    const anyOption = taking!.questions[0].options[0] as Record<string, unknown>;
    expect("isCorrect" in anyOption).toBe(false);
  });

  it("barra quem nao esta matriculado", async () => {
    await expect(getAssessmentForTaking(outsider, assessmentId)).rejects.toBeInstanceOf(
      NotEnrolledError,
    );
  });

  it("2/2 corretas => 100% aprovado", async () => {
    const res = await submitAttempt(student, assessmentId, [
      { questionId: q1.id, selectedOptionId: q1.correct },
      { questionId: q2.id, selectedOptionId: q2.correct },
    ]);
    expect(res.score).toBe(100);
    expect(res.passed).toBe(true);
    expect(res.correct).toBe(2);
    expect(res.total).toBe(2);
  });

  it("1/2 corretas => 50% reprovado (corte 70)", async () => {
    const res = await submitAttempt(student, assessmentId, [
      { questionId: q1.id, selectedOptionId: q1.correct },
      { questionId: q2.id, selectedOptionId: q2.wrong },
    ]);
    expect(res.score).toBe(50);
    expect(res.passed).toBe(false);
  });

  it("grava a tentativa no banco", async () => {
    const attempts = await prisma.assessmentAttempt.count({
      where: { assessmentId, userId: student.id },
    });
    expect(attempts).toBeGreaterThanOrEqual(2);
  });
});
