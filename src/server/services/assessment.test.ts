import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import {
  createAssessment,
  addQuestion,
  AssessmentForbiddenError,
  InvalidQuestionError,
} from "./assessment";

const marker = `asmt_${Date.now()}`;
let teacher: { id: string; role: "TEACHER" };
let outsider: { id: string; role: "TEACHER" };
let courseId: string;

beforeAll(async () => {
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  const o = await createUser({ name: "Outro", email: `${marker}_o@e.com`, password: "senha1234" });
  teacher = { id: t.id, role: "TEACHER" };
  outsider = { id: o.id, role: "TEACHER" };
  const c = await createCourse(t.id, { title: `${marker} Curso` });
  courseId = c.id;
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("assessment authoring", () => {
  it("cria avaliacao em curso proprio; barra nao-dono", async () => {
    const a = await createAssessment(teacher, courseId, { title: "Prova 1", passingScore: 70 });
    expect(a.passingScore).toBe(70);

    await expect(
      createAssessment(outsider, courseId, { title: "Hack", passingScore: 70 }),
    ).rejects.toBeInstanceOf(AssessmentForbiddenError);
  });

  it("adiciona questao MC com 1 correta", async () => {
    const a = await createAssessment(teacher, courseId, { title: "Prova MC", passingScore: 70 });
    const q = await addQuestion(teacher, a.id, {
      statement: "Quanto e 2+2?",
      type: "MULTIPLE_CHOICE",
      options: [
        { text: "3", isCorrect: false },
        { text: "4", isCorrect: true },
        { text: "5", isCorrect: false },
      ],
    });
    expect(q.options.length).toBe(3);
    expect(q.options.filter((o) => o.isCorrect).length).toBe(1);
  });

  it("rejeita questao sem opcao correta", async () => {
    const a = await createAssessment(teacher, courseId, { title: "Prova ruim", passingScore: 70 });
    await expect(
      addQuestion(teacher, a.id, {
        statement: "Sem gabarito",
        type: "MULTIPLE_CHOICE",
        options: [
          { text: "a", isCorrect: false },
          { text: "b", isCorrect: false },
        ],
      }),
    ).rejects.toBeInstanceOf(InvalidQuestionError);
  });

  it("rejeita V/F com numero errado de opcoes", async () => {
    const a = await createAssessment(teacher, courseId, { title: "Prova VF", passingScore: 70 });
    await expect(
      addQuestion(teacher, a.id, {
        statement: "Ceu e azul?",
        type: "TRUE_FALSE",
        options: [
          { text: "Verdadeiro", isCorrect: true },
          { text: "Falso", isCorrect: false },
          { text: "Talvez", isCorrect: false },
        ],
      }),
    ).rejects.toBeInstanceOf(InvalidQuestionError);
  });
});
