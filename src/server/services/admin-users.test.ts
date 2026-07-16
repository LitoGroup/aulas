import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse, updateCourse } from "./course";
import { adminSetPassword, AdminForbiddenError } from "./admin-users";
import { autoEnrollAll, listEnrollments } from "./enrollment";
import { verifyPassword } from "../auth/password";

const marker = `adm_${Date.now()}`;
let admin: { id: string; role: "ADMIN" };
let teacher: { id: string; role: "TEACHER" };
let studentId: string;

beforeAll(async () => {
  const a = await createUser({ name: "Admin", email: `${marker}_a@e.com`, password: "senha1234" });
  await prisma.user.update({ where: { id: a.id }, data: { role: "ADMIN" } });
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  const s = await createUser({ name: "Aluno", email: `${marker}_s@e.com`, password: "senha1234" });
  admin = { id: a.id, role: "ADMIN" };
  teacher = { id: t.id, role: "TEACHER" };
  studentId = s.id;

  // um curso publicado e um rascunho (para o auto-enroll)
  const pub = await createCourse(t.id, { title: `${marker} Publicado` });
  await updateCourse(teacher, pub.id, { isPublished: true });
  await createCourse(t.id, { title: `${marker} Rascunho` });
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("adminSetPassword", () => {
  it("ADMIN troca a senha de um usuario", async () => {
    await adminSetPassword(admin, studentId, "novaSenha123");
    const u = await prisma.user.findUnique({ where: { id: studentId } });
    expect(await verifyPassword(u!.passwordHash, "novaSenha123")).toBe(true);
  });

  it("nao-ADMIN e barrado", async () => {
    await expect(
      adminSetPassword(teacher, studentId, "hackSenha123"),
    ).rejects.toBeInstanceOf(AdminForbiddenError);
  });

  it("rejeita senha curta", async () => {
    await expect(adminSetPassword(admin, studentId, "123")).rejects.toThrow();
  });
});

describe("autoEnrollAll", () => {
  it("matricula o usuario em todos os cursos publicados (e so neles)", async () => {
    await autoEnrollAll(studentId);
    const list = await listEnrollments(studentId);
    const titles = list.map((e) => e.course.title);
    expect(titles).toContain(`${marker} Publicado`);
    expect(titles).not.toContain(`${marker} Rascunho`);
  });

  it("e idempotente", async () => {
    await autoEnrollAll(studentId);
    await autoEnrollAll(studentId);
    const list = await listEnrollments(studentId);
    const count = list.filter((e) => e.course.title === `${marker} Publicado`).length;
    expect(count).toBe(1);
  });
});
