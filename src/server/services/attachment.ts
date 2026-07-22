import { randomUUID } from "node:crypto";
import type { Attachment, Role } from "@prisma/client";
import { prisma } from "../db";

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
): Promise<{ storageKey: string; fileName: string; mimeType: string }> {
  const att = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: {
      storageKey: true,
      fileName: true,
      mimeType: true,
      lesson: {
        select: {
          module: {
            select: { course: { select: { ownerId: true, isPublished: true } } },
          },
        },
      },
    },
  });
  if (!att) throw new AttachmentForbiddenError();

  // Todo aluno logado baixa o material de um curso publicado; não há mais
  // portão de matrícula. Rascunho segue restrito ao dono/admin.
  const course = att.lesson.module.course;
  const allowed = canEdit(actor, course.ownerId) || course.isPublished;
  if (!allowed) throw new AttachmentForbiddenError();

  return { storageKey: att.storageKey, fileName: att.fileName, mimeType: att.mimeType };
}

/** Tipos que o navegador consegue exibir inline (abrir em nova guia). */
export function isInlineViewable(mimeType: string, fileName: string): boolean {
  const mt = (mimeType || "").toLowerCase();
  if (mt === "application/pdf" || mt.startsWith("image/")) return true;
  return /\.(pdf|png|jpe?g|gif|webp|svg)$/i.test(fileName);
}

export type ModoDeAcesso = "abrir" | "baixar";

/**
 * Decide se o arquivo abre no navegador ou baixa.
 *
 * "baixar" é sempre respeitado — é escolha explícita do aluno. Já "abrir" só
 * vale para o que o navegador exibe: mandar um DOCX inline abriria uma guia em
 * branco que baixa sozinha.
 */
export function resolverModoDeAcesso(
  pedido: string | null | undefined,
  mimeType: string,
  fileName: string,
): ModoDeAcesso {
  if (pedido === "baixar") return "baixar";
  return isInlineViewable(mimeType, fileName) ? "abrir" : "baixar";
}

/** Tamanho legível para mostrar ao lado do arquivo. */
export function formatarTamanho(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}
