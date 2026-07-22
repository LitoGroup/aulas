import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import {
  createCourse,
  updateCourse,
  listCoursesByOwner,
  NotOwnerError,
} from "./course";
import { slugify } from "@/lib/validation/course";

const marker = `course_${Date.now()}`;
let teacherId: string;
let otherTeacherId: string;
let adminId: string;

beforeAll(async () => {
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  const o = await createUser({ name: "Outro", email: `${marker}_o@e.com`, password: "senha1234" });
  const a = await createUser({ name: "Admin", email: `${marker}_a@e.com`, password: "senha1234" });
  await prisma.user.update({ where: { id: a.id }, data: { role: "ADMIN" } });
  teacherId = t.id;
  otherTeacherId = o.id;
  adminId = a.id;
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("slugify", () => {
  it("gera slug limpo removendo acentos e espacos", () => {
    expect(slugify("Introdução à Programação")).toBe("introducao-a-programacao");
  });
});

describe("course service", () => {
  it("cria curso com slug gerado", async () => {
    const c = await createCourse(teacherId, { title: `${marker} Curso A`, description: "d" });
    expect(c.ownerId).toBe(teacherId);
    expect(c.slug).toContain("curso-a");
    expect(c.isPublished).toBe(false);
  });

  it("gera slugs unicos para titulos iguais", async () => {
    const c1 = await createCourse(teacherId, { title: `${marker} Repetido` });
    const c2 = await createCourse(teacherId, { title: `${marker} Repetido` });
    expect(c1.slug).not.toBe(c2.slug);
  });

  it("impede update por quem nao e dono", async () => {
    const c = await createCourse(teacherId, { title: `${marker} Protegido` });
    await expect(
      updateCourse({ id: otherTeacherId, role: "TEACHER" }, c.id, { title: `${marker} Hack` }),
    ).rejects.toBeInstanceOf(NotOwnerError);
  });

  it("permite ADMIN editar curso de outro", async () => {
    const c = await createCourse(teacherId, { title: `${marker} AdminEdita` });
    const updated = await updateCourse({ id: adminId, role: "ADMIN" }, c.id, {
      title: `${marker} Editado`,
    });
    expect(updated.title).toBe(`${marker} Editado`);
  });

  it("lista cursos do dono", async () => {
    const list = await listCoursesByOwner(teacherId);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((c) => c.ownerId === teacherId)).toBe(true);
  });

  it("marca publishedAt na 1a publicacao e mantem ao despublicar", async () => {
    const c = await createCourse(teacherId, { title: `${marker} Publicacao` });
    expect(c.publishedAt).toBeNull();
    const owner = { id: teacherId, role: "TEACHER" as const };

    const publicado = await updateCourse(owner, c.id, { isPublished: true });
    expect(publicado.isPublished).toBe(true);
    expect(publicado.publishedAt).toBeInstanceOf(Date);
    const marcadoEm = publicado.publishedAt!.getTime();

    // Despublicar preserva publishedAt: é o sinal de "já esteve no ar".
    const despublicado = await updateCourse(owner, c.id, { isPublished: false });
    expect(despublicado.isPublished).toBe(false);
    expect(despublicado.publishedAt).not.toBeNull();

    // Republicar não reescreve a data da primeira vez.
    const republicado = await updateCourse(owner, c.id, { isPublished: true });
    expect(republicado.publishedAt!.getTime()).toBe(marcadoEm);
  });

  it("rascunho nunca publicado fica com publishedAt nulo", async () => {
    const c = await createCourse(teacherId, { title: `${marker} SoRascunho` });
    const editado = await updateCourse(
      { id: teacherId, role: "TEACHER" },
      c.id,
      { title: `${marker} SoRascunhoEditado` },
    );
    expect(editado.publishedAt).toBeNull();
  });
});
