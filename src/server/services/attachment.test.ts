import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import { createModule } from "./module";
import { createLesson } from "./lesson";
import { enroll } from "./enrollment";
import {
  addAttachment,
  getAttachmentForDownload,
  buildStorageKey,
  AttachmentForbiddenError,
} from "./attachment";

const marker = `att_${Date.now()}`;
let teacher: { id: string; role: "TEACHER" };
let student: { id: string; role: "STUDENT" };
let outsider: { id: string; role: "STUDENT" };
let lessonId: string;
let courseId: string;

beforeAll(async () => {
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  const s = await createUser({ name: "Aluno", email: `${marker}_s@e.com`, password: "senha1234" });
  const o = await createUser({ name: "Fora", email: `${marker}_o@e.com`, password: "senha1234" });
  teacher = { id: t.id, role: "TEACHER" };
  student = { id: s.id, role: "STUDENT" };
  outsider = { id: o.id, role: "STUDENT" };
  const c = await createCourse(teacher.id, { title: `${marker} Curso` });
  courseId = c.id;
  const m = await createModule(teacher, courseId, { title: "Mod" });
  const l = await createLesson(teacher, m.id, {
    title: "Aula",
    contentType: "VIDEO",
    videoProvider: "YOUTUBE",
    videoRef: "QW9JnB0GX1I",
  });
  lessonId = l.id;
  await enroll(student.id, courseId);
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("attachment authorization", () => {
  it("buildStorageKey higieniza o nome do arquivo", () => {
    const key = buildStorageKey(lessonId, "apostila final!.pdf");
    expect(key).toContain(`lessons/${lessonId}/`);
    expect(key).toMatch(/apostila_final_\.pdf$/);
  });

  it("dono anexa; nao-dono e barrado", async () => {
    const att = await addAttachment(teacher, lessonId, {
      fileName: "apostila.pdf",
      storageKey: buildStorageKey(lessonId, "apostila.pdf"),
      mimeType: "application/pdf",
      sizeBytes: 1234,
    });
    expect(att.lessonId).toBe(lessonId);

    await expect(
      addAttachment(outsider, lessonId, {
        fileName: "x.pdf",
        storageKey: "k",
        mimeType: "application/pdf",
        sizeBytes: 1,
      }),
    ).rejects.toBeInstanceOf(AttachmentForbiddenError);
  });

  it("aluno matriculado baixa; nao matriculado e barrado", async () => {
    const att = await prisma.attachment.findFirst({ where: { lessonId } });
    const ok = await getAttachmentForDownload(student, att!.id);
    expect(ok.fileName).toBe("apostila.pdf");

    await expect(
      getAttachmentForDownload(outsider, att!.id),
    ).rejects.toBeInstanceOf(AttachmentForbiddenError);
  });
});
