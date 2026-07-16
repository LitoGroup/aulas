"use server";

import { randomUUID } from "node:crypto";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/auth/rbac";
import { assertCanEdit } from "@/server/services/course";
import { createVideoUploadUrl } from "@/server/storage";

// Teto atual da instância Supabase (FILE_SIZE_LIMIT global = 50 MB).
// Se o servidor for reconfigurado, basta subir este valor via env.
const MAX_VIDEO_BYTES = Number(process.env.VIDEO_MAX_BYTES ?? 52_428_800);
const ALLOWED_MIMES = new Set(["video/mp4", "video/webm"]);

export async function getVideoUploadUrlAction(input: {
  moduleId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<{ signedUrl: string; storageKey: string } | { error: string }> {
  try {
    const actor = await requireRole(["TEACHER", "ADMIN"]);

    const mod = await prisma.module.findUnique({
      where: { id: input.moduleId },
      select: { courseId: true },
    });
    if (!mod) return { error: "Módulo não encontrado" };
    await assertCanEdit(actor, mod.courseId); // ownership

    if (!ALLOWED_MIMES.has(input.mimeType)) {
      return { error: "Formato não suportado. Envie MP4 ou WebM." };
    }
    if (input.sizeBytes > MAX_VIDEO_BYTES) {
      const mb = Math.round(MAX_VIDEO_BYTES / 1024 / 1024);
      return { error: `Vídeo muito grande. O limite atual é ${mb} MB.` };
    }

    const safe = input.fileName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
    const storageKey = `videos/${input.moduleId}/${randomUUID()}-${safe}`;
    const { signedUrl } = await createVideoUploadUrl(storageKey);
    return { signedUrl, storageKey };
  } catch {
    return { error: "Não foi possível iniciar o upload do vídeo" };
  }
}
