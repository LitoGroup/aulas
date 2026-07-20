import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import { NotOwnerError } from "./course";
import { createModule } from "./module";
import { createLesson } from "./lesson";

const marker = `mod_${Date.now()}`;
let teacher: { id: string; role: "TEACHER" };
let other: { id: string; role: "TEACHER" };
let courseId: string;

beforeAll(async () => {
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  const o = await createUser({ name: "Outro", email: `${marker}_o@e.com`, password: "senha1234" });
  teacher = { id: t.id, role: "TEACHER" };
  other = { id: o.id, role: "TEACHER" };
  const c = await createCourse(teacher.id, { title: `${marker} Curso` });
  courseId = c.id;
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("module & lesson service", () => {
  it("cria modulo em curso proprio com order incremental", async () => {
    const m1 = await createModule(teacher, courseId, { title: "Modulo 1" });
    const m2 = await createModule(teacher, courseId, { title: "Modulo 2" });
    expect(m1.order).toBe(0);
    expect(m2.order).toBe(1);
  });

  it("barra criacao de modulo por nao-dono", async () => {
    await expect(
      createModule(other, courseId, { title: "Invasor" }),
    ).rejects.toBeInstanceOf(NotOwnerError);
  });

  it("cria aula de VIDEO com provider e ref", async () => {
    const m = await createModule(teacher, courseId, { title: "Mod video" });
    const lesson = await createLesson(teacher, m.id, {
      title: "Aula 1",
      contentType: "VIDEO",
      videoProvider: "YOUTUBE",
      videoRef: "QW9JnB0GX1I",
    });
    expect(lesson.contentType).toBe("VIDEO");
    expect(lesson.videoRef).toBe("QW9JnB0GX1I");
    expect(lesson.order).toBe(0);
  });

  it("guarda so o ID quando o professor cola o link inteiro", async () => {
    const m = await createModule(teacher, courseId, { title: "Mod link" });
    const lesson = await createLesson(teacher, m.id, {
      title: "Aula com link",
      contentType: "VIDEO",
      videoProvider: "YOUTUBE",
      videoRef: "https://youtu.be/QW9JnB0GX1I?si=K8HyWa4_feITzxb7",
    });
    expect(lesson.videoRef).toBe("QW9JnB0GX1I");
  });

  it("recusa link de video que nao da para tocar", async () => {
    const m = await createModule(teacher, courseId, { title: "Mod ruim" });
    await expect(
      createLesson(teacher, m.id, {
        title: "Aula quebrada",
        contentType: "VIDEO",
        videoProvider: "YOUTUBE",
        videoRef: "https://exemplo.com/nao-e-video",
      }),
    ).rejects.toThrow();
  });

  it("rejeita aula VIDEO sem ref", async () => {
    const m = await createModule(teacher, courseId, { title: "Mod invalido" });
    await expect(
      createLesson(teacher, m.id, { title: "X", contentType: "VIDEO" } as never),
    ).rejects.toThrow();
  });
});
