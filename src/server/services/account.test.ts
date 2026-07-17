import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import { enroll } from "./enrollment";
import {
  updateOwnProfile,
  changeOwnPassword,
  exportUserData,
  deleteOwnAccount,
  WrongPasswordError,
} from "./account";
import { verifyPassword } from "../auth/password";

const marker = `acc_${Date.now()}`;
let userId: string;
let courseId: string;

beforeAll(async () => {
  const u = await createUser({ name: "Fulano", email: `${marker}_u@e.com`, password: "senha1234" });
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  userId = u.id;
  const c = await createCourse(t.id, { title: `${marker} Curso` });
  courseId = c.id;
  await enroll(userId, courseId);
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("account service", () => {
  it("atualiza o nome", async () => {
    const u = await updateOwnProfile(userId, { name: "Fulano Editado" });
    expect(u.name).toBe("Fulano Editado");
  });

  it("troca a senha exigindo a atual correta", async () => {
    await expect(
      changeOwnPassword(userId, "errada", "novaSenha123"),
    ).rejects.toBeInstanceOf(WrongPasswordError);

    await changeOwnPassword(userId, "senha1234", "novaSenha123");
    const u = await prisma.user.findUnique({ where: { id: userId } });
    expect(await verifyPassword(u!.passwordHash, "novaSenha123")).toBe(true);
  });

  it("exporta os dados do titular (sem hash de senha)", async () => {
    const data = await exportUserData(userId);
    expect(data.perfil.email).toBe(`${marker}_u@e.com`);
    expect(JSON.stringify(data)).not.toContain("passwordHash");
    expect(data.matriculas.length).toBeGreaterThan(0);
  });

  it("exclui a conta apos validar a senha (e some do banco)", async () => {
    await expect(
      deleteOwnAccount(userId, "senhaErrada"),
    ).rejects.toBeInstanceOf(WrongPasswordError);

    await deleteOwnAccount(userId, "novaSenha123");
    const u = await prisma.user.findUnique({ where: { id: userId } });
    expect(u).toBeNull();
  });
});
