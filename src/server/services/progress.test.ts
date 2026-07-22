import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import { createModule } from "./module";
import { createLesson } from "./lesson";
import { enroll } from "./enrollment";
import { markLessonComplete, getCourseProgress } from "./progress";

const marker = `prog_${Date.now()}`;
let studentId: string;
let outsiderId: string;
let courseId: string;
let lessonA: string;
let lessonB: string;

beforeAll(async () => {
  const s = await createUser({ name: "Aluno", email: `${marker}_s@e.com`, password: "senha1234" });
  const o = await createUser({ name: "Fora", email: `${marker}_o@e.com`, password: "senha1234" });
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  studentId = s.id;
  outsiderId = o.id;
  const actor = { id: t.id, role: "TEACHER" as const };
  const c = await createCourse(t.id, { title: `${marker} Curso` });
  courseId = c.id;
  const m = await createModule(actor, c.id, { title: "Mod" });
  const a = await createLesson(actor, m.id, { title: "Aula A", contentType: "TEXT", textBody: "aa" });
  const b = await createLesson(actor, m.id, { title: "Aula B", contentType: "TEXT", textBody: "bb" });
  lessonA = a.id;
  lessonB = b.id;
  await enroll(studentId, courseId);
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("progress service", () => {
  it("aluno sem matricula previa conclui e e matriculado na hora", async () => {
    // Sem portao de matricula: concluir uma aula matricula o aluno de forma
    // invisivel, para ancorar o progresso.
    await markLessonComplete(outsiderId, lessonA);
    const p = await getCourseProgress(outsiderId, courseId);
    expect(p.completed).toBe(1);
    expect(p.completedLessonIds).toContain(lessonA);
  });

  it("marca 1 de 2 aulas => 50%", async () => {
    await markLessonComplete(studentId, lessonA);
    const p = await getCourseProgress(studentId, courseId);
    expect(p.total).toBe(2);
    expect(p.completed).toBe(1);
    expect(p.percent).toBe(50);
    expect(p.completedLessonIds).toContain(lessonA);
    expect(p.completedLessonIds).not.toContain(lessonB);
  });

  it("marcar de novo e idempotente", async () => {
    await markLessonComplete(studentId, lessonA);
    const p = await getCourseProgress(studentId, courseId);
    expect(p.completed).toBe(1);
  });

  it("100% ao concluir todas", async () => {
    await markLessonComplete(studentId, lessonB);
    const p = await getCourseProgress(studentId, courseId);
    expect(p.percent).toBe(100);
  });
});
