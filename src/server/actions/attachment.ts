"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/rbac";
import {
  addAttachment,
  assertCanUpload,
  buildStorageKey,
} from "@/server/services/attachment";
import { createUploadUrl } from "@/server/storage";

const TEACHER = ["TEACHER", "ADMIN"] as const;

/** Passo 1: valida permissao e devolve URL assinada + storageKey. */
export async function getUploadUrlAction(input: {
  lessonId: string;
  fileName: string;
}): Promise<{ signedUrl: string; storageKey: string } | { error: string }> {
  try {
    const actor = await requireRole([...TEACHER]);
    await assertCanUpload(actor, input.lessonId);
    const storageKey = buildStorageKey(input.lessonId, input.fileName);
    const { signedUrl } = await createUploadUrl(storageKey);
    return { signedUrl, storageKey };
  } catch {
    return { error: "Nao foi possivel iniciar o upload" };
  }
}

/** Passo 2: apos o upload, persiste os metadados. */
export async function addAttachmentAction(input: {
  courseId: string;
  lessonId: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<{ ok: true } | { error: string }> {
  try {
    const actor = await requireRole([...TEACHER]);
    await addAttachment(actor, input.lessonId, {
      fileName: input.fileName,
      storageKey: input.storageKey,
      mimeType: input.mimeType || "application/octet-stream",
      sizeBytes: input.sizeBytes,
    });
    revalidatePath(`/manage/courses/${input.courseId}`);
    return { ok: true };
  } catch {
    return { error: "Nao foi possivel salvar a apostila" };
  }
}
