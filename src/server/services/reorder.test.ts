import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import { createModule, updateModule, moveModule } from "./module";
import { createLesson, moveLesson } from "./lesson";

const marker = `reord_${Date.now()}`;
let teacher: { id: string; role: "TEACHER" };
let courseId: string;
let modA: string;
let modB: string;

beforeAll(async () => {
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  teacher = { id: t.id, role: "TEACHER" };
  const c = await createCourse(t.id, { title: `${marker} Curso` });
  courseId = c.id;
  const a = await createModule(teacher, courseId, { title: "Modulo A" });
  const b = await createModule(teacher, courseId, { title: "Modulo B" });
  modA = a.id;
  modB = b.id;
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("reorder", () => {
  it("updateModule renomeia", async () => {
    const m = await updateModule(teacher, modA, { title: "Modulo A editado" });
    expect(m.title).toBe("Modulo A editado");
  });

  it("moveModule troca a ordem com o vizinho", async () => {
    // inicialmente A(0), B(1). Mover B para cima => B(0), A(1)
    await moveModule(teacher, modB, "up");
    const a = await prisma.module.findUnique({ where: { id: modA } });
    const b = await prisma.module.findUnique({ where: { id: modB } });
    expect(b!.order).toBeLessThan(a!.order);
  });

  it("moveModule no extremo e no-op", async () => {
    const before = await prisma.module.findUnique({ where: { id: modB } });
    await moveModule(teacher, modB, "up"); // ja esta no topo
    const after = await prisma.module.findUnique({ where: { id: modB } });
    expect(after!.order).toBe(before!.order);
  });

  it("moveLesson troca a ordem dentro do modulo", async () => {
    const l1 = await createLesson(teacher, modA, { title: "Aula 1", contentType: "TEXT", textBody: "x" });
    const l2 = await createLesson(teacher, modA, { title: "Aula 2", contentType: "TEXT", textBody: "y" });
    await moveLesson(teacher, l2.id, "up");
    const a1 = await prisma.lesson.findUnique({ where: { id: l1.id } });
    const a2 = await prisma.lesson.findUnique({ where: { id: l2.id } });
    expect(a2!.order).toBeLessThan(a1!.order);
  });
});
