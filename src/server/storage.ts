import { createClient } from "@supabase/supabase-js";

export const ATTACHMENTS_BUCKET = "school-attachments";
export const VIDEOS_BUCKET = "school-videos";

/**
 * Cliente admin (service_role) — SOMENTE server-side. Bypassa RLS, entao
 * nunca deve ser importado em codigo de cliente.
 */
function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase Storage nao configurado");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Garante que o bucket privado exista (idempotente). */
export async function ensureAttachmentsBucket(): Promise<void> {
  const s = admin();
  const { data } = await s.storage.getBucket(ATTACHMENTS_BUCKET);
  if (!data) {
    await s.storage.createBucket(ATTACHMENTS_BUCKET, {
      public: false,
      fileSizeLimit: "52428800", // 50 MB
    });
  }
}

/** URL assinada para UPLOAD direto do cliente (nao expoe a service key). */
export async function createUploadUrl(storageKey: string) {
  const s = admin();
  const { data, error } = await s.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUploadUrl(storageKey);
  if (error || !data) throw new Error(error?.message ?? "Falha ao gerar URL de upload");
  return { path: data.path, token: data.token, signedUrl: data.signedUrl };
}

/**
 * URL assinada temporaria (padrao 60s).
 * inline=true -> abre no navegador (ex.: PDF em nova guia);
 * inline=false -> forca download (ex.: DOCX, ZIP).
 */
export async function createSignedFileUrl(
  storageKey: string,
  { expiresIn = 60, inline = false }: { expiresIn?: number; inline?: boolean } = {},
): Promise<string> {
  const s = admin();
  const { data, error } = await s.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(storageKey, expiresIn, { download: !inline });
  if (error || !data) throw new Error(error?.message ?? "Falha ao gerar URL do arquivo");
  return data.signedUrl;
}

export async function removeObject(storageKey: string): Promise<void> {
  const s = admin();
  await s.storage.from(ATTACHMENTS_BUCKET).remove([storageKey]);
}

// ------------------------------ Vídeos ------------------------------

/**
 * Garante o bucket privado de vídeos (apenas video/*).
 * O tamanho máximo por arquivo é limitado pelo FILE_SIZE_LIMIT global da
 * instância Supabase (hoje 50 MB nesta infra) — não definimos limite aqui
 * para herdar automaticamente qualquer aumento feito no servidor.
 */
export async function ensureVideosBucket(): Promise<void> {
  const s = admin();
  const { data } = await s.storage.getBucket(VIDEOS_BUCKET);
  if (!data) {
    await s.storage.createBucket(VIDEOS_BUCKET, {
      public: false,
      allowedMimeTypes: ["video/mp4", "video/webm"],
    });
  }
}

/** URL assinada para o professor enviar o vídeo direto ao storage. */
export async function createVideoUploadUrl(storageKey: string) {
  const s = admin();
  const { data, error } = await s.storage
    .from(VIDEOS_BUCKET)
    .createSignedUploadUrl(storageKey);
  if (error || !data) throw new Error(error?.message ?? "Falha ao gerar URL de upload de video");
  return { path: data.path, token: data.token, signedUrl: data.signedUrl };
}

/**
 * URL assinada temporaria de REPRODUCAO (inline; padrao 2h).
 * So deve ser chamada apos o guard de matricula/ownership.
 */
export async function createVideoPlaybackUrl(
  storageKey: string,
  expiresIn = 7200,
): Promise<string> {
  const s = admin();
  const { data, error } = await s.storage
    .from(VIDEOS_BUCKET)
    .createSignedUrl(storageKey, expiresIn);
  if (error || !data) throw new Error(error?.message ?? "Falha ao gerar URL de reproducao");
  return data.signedUrl;
}

export async function removeVideo(storageKey: string): Promise<void> {
  const s = admin();
  await s.storage.from(VIDEOS_BUCKET).remove([storageKey]);
}
