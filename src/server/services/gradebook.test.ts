import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import { enroll } from "./enrollment";
import { createAssessment, addQuestion } from "./assessment";
import { submitAttempt } from "./grading";
import { getCourseGradebook, GradebookForbiddenError } from "./gradebook";

const marker = `gb_${Date.now()}`;
let teacher: { id: string; role: "TEACHER" };
let outsider: { id: string; role: "TEACHER" };
let studentId: string;
let courseId: string;
let assessmentId: string;

beforeAll(async () => {
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  const o = await createUser({ name: "Outro", email: `${marker}_o@e.com`, password: "senha1234" });
  const s = await createUser({ name: "Aluno Um", email: `${marker}_s@e.com`, password: "senha1234" });
  teacher = { id: t.id, role: "TEACHER" };
  outsider = { id: o.id, role: "TEACHER" };
  studentId = s.id;
  const c = await createCourse(t.id, { title: `${marker} Curso` });
  courseId = c.id;
  await prisma.course.update({ where: { id: courseId }, data: { isPublished: true } });
  await enroll(studentId, courseId);

  const a = await createAssessment(teacher, courseId, { title: "Prova", passingScore: 70 });
  assessmentId = a.id;
  const q = await addQuestion(teacher, a.id, {
    statement: "2+2?",
    type: "MULTIPLE_CHOICE",
    options: [
      { text: "4", isCorrect: true },
      { text: "5", isCorrect: false },
    ],
  });
  const correct = q.options.find((o) => o.isCorrect)!.id;
  await submitAttempt({ id: studentId, role: "STUDENT" }, a.id, [
    { questionId: q.id, selectedOptionId: correct },
  ]);
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("gradebook", () => {
  it("barra quem nao e dono do curso", async () => {
    await expect(getCourseGradebook(outsider, courseId)).rejects.toBeInstanceOf(
      GradebookForbiddenError,
    );
  });

  it("lista alunos matriculados com melhor nota e status", async () => {
    const gb = await getCourseGradebook(teacher, courseId);
    expect(gb.assessments.some((a) => a.id === assessmentId)).toBe(true);

    const aluno = gb.students.find((s) => s.id === studentId);
    expect(aluno).toBeTruthy();
    expect(aluno!.name).toBe("Aluno Um");
    const score = aluno!.scores[assessmentId];
    expect(score.best).toBe(100);
    expect(score.passed).toBe(true);
  });
});
