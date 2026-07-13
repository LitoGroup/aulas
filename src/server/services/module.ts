import type { Module } from "@prisma/client";
import { prisma } from "../db";
import { assertCanEdit, type Actor } from "./course";
import { moduleInputSchema, type ModuleInput } from "@/lib/validation/content";

async function nextOrder(courseId: string): Promise<number> {
  const last = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return last ? last.order + 1 : 0;
}

export async function createModule(
  actor: Actor,
  courseId: string,
  input: ModuleInput,
): Promise<Module> {
  await assertCanEdit(actor, courseId); // valida ownership do curso
  const data = moduleInputSchema.parse(input);
  return prisma.module.create({
    data: { courseId, title: data.title, order: await nextOrder(courseId) },
  });
}

export async function deleteModule(actor: Actor, moduleId: string): Promise<void> {
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
  if (!mod) return;
  await assertCanEdit(actor, mod.courseId);
  await prisma.module.delete({ where: { id: moduleId } });
}
