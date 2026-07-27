import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "../services/user";
import { createCourse } from "../services/course";
import { createModule } from "../services/module";
import { createLesson } from "../services/lesson";
import { buildAssistantContext } from "./context";

const marker = `ctx_${Date.now()}`;
let courseId: string;
let lessonId: string;

beforeAll(async () => {
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  const actor = { id: t.id, role: "TEACHER" as const };
  const c = await createCourse(t.id, { title: `${marker} Curso Publicado`, description: "Curso de teste do contexto" });
  courseId = c.id;
  await prisma.course.update({ where: { id: courseId }, data: { isPublished: true } });
  const m = await createModule(actor, courseId, { title: "Mod" });
  const l = await createLesson(actor, m.id, {
    title: "Aula de Teste",
    contentType: "TEXT",
    textBody: "CONTEUDO_UNICO_DA_AULA_XYZ",
  });
  lessonId = l.id;
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("buildAssistantContext", () => {
  it("sempre inclui a base de conhecimento", async () => {
    const ctx = await buildAssistantContext();
    expect(ctx).toContain("Lito Aviation Academy");
  });

  it("inclui os cursos publicados", async () => {
    const ctx = await buildAssistantContext();
    expect(ctx).toContain(`${marker} Curso Publicado`);
  });

  it("inclui o conteúdo da aula quando passado o lessonId", async () => {
    const ctx = await buildAssistantContext({ lessonId });
    expect(ctx).toContain("Aula de Teste");
    expect(ctx).toContain("CONTEUDO_UNICO_DA_AULA_XYZ");
  });

  it("não inclui conteúdo de aula quando o lessonId não é passado", async () => {
    const ctx = await buildAssistantContext();
    expect(ctx).not.toContain("CONTEUDO_UNICO_DA_AULA_XYZ");
  });
});
