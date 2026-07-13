import type { Course, Role } from "@prisma/client";
import { prisma } from "../db";
import { courseInputSchema, slugify, type CourseInput } from "@/lib/validation/course";

export class NotOwnerError extends Error {
  constructor() {
    super("Voce nao tem permissao sobre este curso");
    this.name = "NotOwnerError";
  }
}

export class CourseNotFoundError extends Error {
  constructor() {
    super("Curso nao encontrado");
    this.name = "CourseNotFoundError";
  }
}

export interface Actor {
  id: string;
  role: Role;
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "curso";
  let slug = root;
  let i = 1;
  // Colisao -> sufixo incremental.
  while (await prisma.course.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${root}-${i++}`;
  }
  return slug;
}

export async function createCourse(
  ownerId: string,
  input: CourseInput,
): Promise<Course> {
  const data = courseInputSchema.parse(input);
  const slug = await uniqueSlug(slugify(data.title));
  return prisma.course.create({
    data: {
      title: data.title,
      description: data.description || null,
      slug,
      ownerId,
    },
  });
}

async function assertCanEdit(actor: Actor, courseId: string): Promise<Course> {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new CourseNotFoundError();
  if (actor.role !== "ADMIN" && course.ownerId !== actor.id) {
    throw new NotOwnerError();
  }
  return course;
}

export async function updateCourse(
  actor: Actor,
  courseId: string,
  input: Partial<CourseInput> & { isPublished?: boolean },
): Promise<Course> {
  await assertCanEdit(actor, courseId);
  const parsed = courseInputSchema.partial().parse({
    title: input.title,
    description: input.description,
  });
  return prisma.course.update({
    where: { id: courseId },
    data: {
      ...(parsed.title !== undefined ? { title: parsed.title } : {}),
      ...(parsed.description !== undefined
        ? { description: parsed.description || null }
        : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
    },
  });
}

export async function deleteCourse(actor: Actor, courseId: string): Promise<void> {
  await assertCanEdit(actor, courseId);
  await prisma.course.delete({ where: { id: courseId } });
}

export function listCoursesByOwner(ownerId: string): Promise<Course[]> {
  return prisma.course.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
}

export function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
    },
  });
}

/** Carrega curso com modulos/aulas para a area de gestao, validando permissao. */
export async function getManageCourse(actor: Actor, courseId: string) {
  await assertCanEdit(actor, courseId);
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { attachments: true },
          },
        },
      },
    },
  });
}

/** Estrutura enxuta do curso para o player (sidebar de aulas). */
export function getCourseOutline(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      slug: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true, contentType: true, requiresPrevious: true },
          },
        },
      },
    },
  });
}

export function listPublishedCourses() {
  return prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true } } },
  });
}

export { assertCanEdit };
