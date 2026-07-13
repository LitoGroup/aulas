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

export async function updateModule(
  actor: Actor,
  moduleId: string,
  input: ModuleInput,
): Promise<Module> {
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
  if (!mod) throw new Error("Modulo nao encontrado");
  await assertCanEdit(actor, mod.courseId);
  const data = moduleInputSchema.parse(input);
  return prisma.module.update({ where: { id: moduleId }, data: { title: data.title } });
}

export async function moveModule(
  actor: Actor,
  moduleId: string,
  direction: "up" | "down",
): Promise<void> {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true, order: true },
  });
  if (!mod) return;
  await assertCanEdit(actor, mod.courseId);

  // Vizinho imediato na direcao pedida (ordens podem ter lacunas apos exclusoes).
  const neighbor = await prisma.module.findFirst({
    where:
      direction === "up"
        ? { courseId: mod.courseId, order: { lt: mod.order } }
        : { courseId: mod.courseId, order: { gt: mod.order } },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
    select: { id: true, order: true },
  });
  if (!neighbor) return; // ja esta no extremo

  await prisma.$transaction([
    prisma.module.update({ where: { id: moduleId }, data: { order: neighbor.order } }),
    prisma.module.update({ where: { id: neighbor.id }, data: { order: mod.order } }),
  ]);
}

export async function deleteModule(actor: Actor, moduleId: string): Promise<void> {
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
  if (!mod) return;
  await assertCanEdit(actor, mod.courseId);
  await prisma.module.delete({ where: { id: moduleId } });
}
