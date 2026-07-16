"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/rbac";
import { assertCanEdit } from "@/server/services/course";
import { createCoverUploadUrl, coverPublicUrl } from "@/server/storage";

const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function getCoverUploadUrlAction(input: {
  courseId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<{ signedUrl: string; storageKey: string } | { error: string }> {
  try {
    const actor = await requireRole(["TEACHER", "ADMIN"]);
    await assertCanEdit(actor, input.courseId);

    if (!ALLOWED.has(input.mimeType)) {
      return { error: "Formato não suportado. Envie JPG, PNG ou WebP." };
    }
    if (input.sizeBytes > MAX_COVER_BYTES) {
      return { error: "Imagem muito grande. Limite: 5 MB." };
    }

    const safe = input.fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-60);
    const storageKey = `covers/${input.courseId}/${randomUUID()}-${safe}`;
    const { signedUrl } = await createCoverUploadUrl(storageKey);
    return { signedUrl, storageKey };
  } catch {
    return { error: "Não foi possível iniciar o upload da capa" };
  }
}

/** Persiste a capa no curso apos o upload concluir. */
export async function setCourseCoverAction(input: {
  courseId: string;
  storageKey: string;
}): Promise<{ ok: true; url: string } | { error: string }> {
  try {
    const actor = await requireRole(["TEACHER", "ADMIN"]);
    await assertCanEdit(actor, input.courseId);
    const url = coverPublicUrl(input.storageKey);
    await prisma.course.update({ where: { id: input.courseId }, data: { coverUrl: url } });
    revalidatePath(`/manage/courses/${input.courseId}`);
    revalidatePath("/courses");
    revalidatePath("/dashboard");
    return { ok: true, url };
  } catch {
    return { error: "Não foi possível salvar a capa" };
  }
}
