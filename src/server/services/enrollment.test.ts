import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import { enroll, isEnrolled, listEnrollments } from "./enrollment";

const marker = `enr_${Date.now()}`;
let studentId: string;
let courseId: string;

beforeAll(async () => {
  const s = await createUser({ name: "Aluno", email: `${marker}_s@e.com`, password: "senha1234" });
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  studentId = s.id;
  const c = await createCourse(t.id, { title: `${marker} Curso` });
  courseId = c.id;
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("enrollment service", () => {
  it("matricula o aluno e nao duplica", async () => {
    const e1 = await enroll(studentId, courseId);
    const e2 = await enroll(studentId, courseId);
    expect(e1.id).toBe(e2.id); // idempotente
    expect(await isEnrolled(studentId, courseId)).toBe(true);
  });

  it("lista matriculas com o curso", async () => {
    const list = await listEnrollments(studentId);
    expect(list.some((e) => e.course.id === courseId)).toBe(true);
  });

  it("isEnrolled falso para curso nao matriculado", async () => {
    expect(await isEnrolled(studentId, "00000000-0000-0000-0000-000000000000")).toBe(false);
  });
});
