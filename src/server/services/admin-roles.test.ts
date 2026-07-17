import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import {
  adminSetRole,
  adminDeleteUser,
  SelfActionError,
  AdminForbiddenError,
} from "./admin-users";

const marker = `role_${Date.now()}`;
let admin: { id: string; role: "ADMIN" };
let admin2Id: string;
let studentId: string;

beforeAll(async () => {
  const a = await createUser({ name: "Admin Um", email: `${marker}_a@e.com`, password: "senha1234" });
  await prisma.user.update({ where: { id: a.id }, data: { role: "ADMIN" } });
  const a2 = await createUser({ name: "Admin Dois", email: `${marker}_a2@e.com`, password: "senha1234" });
  await prisma.user.update({ where: { id: a2.id }, data: { role: "ADMIN" } });
  const s = await createUser({ name: "Aluno", email: `${marker}_s@e.com`, password: "senha1234" });
  admin = { id: a.id, role: "ADMIN" };
  admin2Id = a2.id;
  studentId = s.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("adminSetRole", () => {
  it("promove aluno para ADMIN", async () => {
    const u = await adminSetRole(admin, studentId, "ADMIN");
    expect(u.role).toBe("ADMIN");
    // volta para STUDENT (ainda ha outros admins)
    await adminSetRole(admin, studentId, "STUDENT");
  });

  it("barra quem nao e admin", async () => {
    await expect(
      adminSetRole({ id: studentId, role: "STUDENT" }, admin2Id, "STUDENT"),
    ).rejects.toBeInstanceOf(AdminForbiddenError);
  });
});

describe("adminDeleteUser", () => {
  it("nao permite excluir a si mesmo", async () => {
    await expect(adminDeleteUser(admin, admin.id)).rejects.toBeInstanceOf(SelfActionError);
  });

  it("exclui um aluno", async () => {
    const tmp = await createUser({ name: "Tmp", email: `${marker}_tmp@e.com`, password: "senha1234" });
    await adminDeleteUser(admin, tmp.id);
    const gone = await prisma.user.findUnique({ where: { id: tmp.id } });
    expect(gone).toBeNull();
  });

  it("promove e rebaixa TEACHER livremente", async () => {
    await adminSetRole(admin, admin2Id, "TEACHER");
    const u = await prisma.user.findUnique({ where: { id: admin2Id } });
    expect(u!.role).toBe("TEACHER");
  });
});
