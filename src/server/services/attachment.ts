import { randomUUID } from "node:crypto";
import type { Attachment, Role } from "@prisma/client";
import { prisma } from "../db";
import { isEnrolled } from "./enrollment";

export interface Actor {
  id: string;
  role: Role;
}

export class AttachmentForbiddenError extends Error {
  constructor() {
    super("Sem permissao sobre esta apostila");
    this.name = "AttachmentForbiddenError";
  }
}

/** Carrega lesson -> module -> course (id + ownerId). */
async function lessonCourse(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { course: { select: { id: true, ownerId: true } } } } },
  });
  return lesson?.module.course ?? null;
}

function canEdit(actor: Actor, ownerId: string): boolean {
  return actor.role === "ADMIN" || actor.id === ownerId;
}

/** Gera a storageKey canonica para uma apostila. */
export function buildStorageKey(lessonId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
  return `lessons/${lessonId}/${randomUUID()}-${safe}`;
}

/** So o dono do curso (ou admin) pode anexar. Retorna a course pra gerar a key. */
export async function assertCanUpload(actor: Actor, lessonId: string): Promise<void> {
  const course = await lessonCourse(lessonId);
  if (!course) throw new AttachmentForbiddenError();
  if (!canEdit(actor, course.ownerId)) throw new AttachmentForbiddenError();
}

export async function addAttachment(
  actor: Actor,
  lessonId: string,
  meta: { fileName: string; storageKey: string; mimeType: string; sizeBytes: number },
): Promise<Attachment> {
  await assertCanUpload(actor, lessonId);
  return prisma.attachment.create({ data: { lessonId, ...meta } });
}

/**
 * Autoriza o download: dono/admin sempre; aluno apenas se matriculado no curso.
 * Retorna a storageKey/fileName para gerar a URL assinada.
 */
export async function getAttachmentForDownload(
  actor: Actor,
  attachmentId: string,
): Promise<{ storageKey: string; fileName: string }> {
  const att = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: {
      storageKey: true,
      fileName: true,
      lesson: { select: { module: { select: { course: { select: { id: true, ownerId: true } } } } } },
    },
  });
  if (!att) throw new AttachmentForbiddenError();

  const course = att.lesson.module.course;
  const allowed = canEdit(actor, course.ownerId) || (await isEnrolled(actor.id, course.id));
  if (!allowed) throw new AttachmentForbiddenError();

  return { storageKey: att.storageKey, fileName: att.fileName };
}
