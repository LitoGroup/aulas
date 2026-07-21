import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../db";
import { createUser } from "./user";
import { createCourse } from "./course";
import { createModule } from "./module";
import { createLesson } from "./lesson";
import { enroll } from "./enrollment";
import { markLessonComplete } from "./progress";
import {
  submitReview,
  getOwnReview,
  listCourseReviews,
  NotEnrolledError,
  CourseNotFinishedError,
} from "./review";

const marker = `rev_${Date.now()}`;
let alunoA: string;
let alunoB: string;
let deFora: string;
let courseId: string;
let aula1: string;
let aula2: string;

beforeAll(async () => {
  const a = await createUser({ name: "Aluno A", email: `${marker}_a@e.com`, password: "senha1234" });
  const b = await createUser({ name: "Aluno B", email: `${marker}_b@e.com`, password: "senha1234" });
  const f = await createUser({ name: "De Fora", email: `${marker}_f@e.com`, password: "senha1234" });
  const t = await createUser({ name: "Prof", email: `${marker}_t@e.com`, password: "senha1234" });
  alunoA = a.id;
  alunoB = b.id;
  deFora = f.id;

  const actor = { id: t.id, role: "TEACHER" as const };
  const c = await createCourse(t.id, { title: `${marker} Curso` });
  courseId = c.id;
  const m = await createModule(actor, c.id, { title: "Mod" });
  const l1 = await createLesson(actor, m.id, { title: "Aula 1", contentType: "TEXT", textBody: "x" });
  const l2 = await createLesson(actor, m.id, { title: "Aula 2", contentType: "TEXT", textBody: "y" });
  aula1 = l1.id;
  aula2 = l2.id;

  await enroll(alunoA, courseId);
  await enroll(alunoB, courseId);
});

afterAll(async () => {
  await prisma.course.deleteMany({ where: { title: { contains: marker } } });
  await prisma.user.deleteMany({ where: { email: { contains: marker } } });
  await prisma.$disconnect();
});

describe("quem pode responder", () => {
  it("barra quem nao esta matriculado", async () => {
    await expect(submitReview(deFora, courseId, { rating: 5 })).rejects.toBeInstanceOf(
      NotEnrolledError,
    );
  });

  it("barra quem ainda nao concluiu o curso", async () => {
    // A regra vale no servidor: esconder o formulario nao impede um envio direto.
    await expect(submitReview(alunoA, courseId, { rating: 5 })).rejects.toBeInstanceOf(
      CourseNotFinishedError,
    );
  });

  it("continua barrando com o curso pela metade", async () => {
    await markLessonComplete(alunoA, aula1);
    await expect(submitReview(alunoA, courseId, { rating: 5 })).rejects.toBeInstanceOf(
      CourseNotFinishedError,
    );
  });
});

describe("resposta do aluno", () => {
  it("grava depois de concluir todas as aulas", async () => {
    await markLessonComplete(alunoA, aula2);
    await submitReview(alunoA, courseId, { rating: 5, comment: "Curso excelente" });

    const r = await getOwnReview(alunoA, courseId);
    expect(r?.rating).toBe(5);
    expect(r?.comment).toBe("Curso excelente");
  });

  it("responder de novo atualiza em vez de duplicar", async () => {
    await submitReview(alunoA, courseId, { rating: 4, comment: "Revisei minha nota" });

    const r = await getOwnReview(alunoA, courseId);
    expect(r?.rating).toBe(4);
    expect(r?.comment).toBe("Revisei minha nota");

    const { resumo } = await listCourseReviews(courseId);
    expect(resumo.total).toBe(1);
  });

  it("aceita nota sem comentario", async () => {
    await markLessonComplete(alunoB, aula1);
    await markLessonComplete(alunoB, aula2);
    await submitReview(alunoB, courseId, { rating: 3 });

    const r = await getOwnReview(alunoB, courseId);
    expect(r?.rating).toBe(3);
    expect(r?.comment).toBeNull();
  });

  it("recusa nota fora da escala", async () => {
    await expect(submitReview(alunoA, courseId, { rating: 9 })).rejects.toThrow();
    // A resposta anterior permanece intacta.
    expect((await getOwnReview(alunoA, courseId))?.rating).toBe(4);
  });

  it("quem nao respondeu nao tem resposta", async () => {
    expect(await getOwnReview(deFora, courseId)).toBeNull();
  });
});

describe("resultado para o professor", () => {
  it("traz media, contagem e os comentarios com o nome do aluno", async () => {
    const { resumo, respostas } = await listCourseReviews(courseId);
    // Aluno A deu 4, aluno B deu 3 => media 3,5
    expect(resumo.total).toBe(2);
    expect(resumo.media).toBe(3.5);
    expect(resumo.distribuicao[4]).toBe(1);
    expect(resumo.distribuicao[3]).toBe(1);

    expect(respostas).toHaveLength(2);
    const doA = respostas.find((r) => r.rating === 4);
    expect(doA?.aluno).toBe("Aluno A");
    expect(doA?.comment).toBe("Revisei minha nota");
  });
});

describe("privacidade", () => {
  it("apagar a matricula leva a resposta junto", async () => {
    const matricula = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: alunoB, courseId } },
      select: { id: true },
    });
    await prisma.enrollment.delete({ where: { id: matricula!.id } });

    const sobrou = await prisma.courseReview.findUnique({
      where: { enrollmentId: matricula!.id },
    });
    expect(sobrou).toBeNull();

    const { resumo } = await listCourseReviews(courseId);
    expect(resumo.total).toBe(1);
  });
});
