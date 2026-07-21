import { createClient } from "@supabase/supabase-js";

export const ATTACHMENTS_BUCKET = "school-attachments";
export const VIDEOS_BUCKET = "school-videos";
export const COVERS_BUCKET = "school-covers";

/**
 * Cliente admin (service_role) - SOMENTE server-side. Bypassa RLS, entao
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
 *
 * `downloadName` define com que nome o arquivo e salvo. Sem ele o Supabase usa
 * a chave do storage, e o aluno receberia algo como
 * "3f2a...-Introdu_o.pdf" em vez de "Introdução.pdf".
 */
export async function createSignedFileUrl(
  storageKey: string,
  {
    expiresIn = 60,
    inline = false,
    downloadName,
  }: { expiresIn?: number; inline?: boolean; downloadName?: string } = {},
): Promise<string> {
  const s = admin();
  const { data, error } = await s.storage
    .from(ATTACHMENTS_BUCKET)
    .createSignedUrl(storageKey, expiresIn, {
      download: inline ? false : (downloadName ?? true),
    });
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
 * instância Supabase (hoje 50 MB nesta infra) - não definimos limite aqui
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

// ---------------------------- Capas (thumbs) ----------------------------

/**
 * Bucket PUBLICO de capas de curso: thumbs nao sao conteudo sensivel e a
 * URL publica permite <img> direto e cache no navegador/CDN.
 */
export async function ensureCoversBucket(): Promise<void> {
  const s = admin();
  const { data } = await s.storage.getBucket(COVERS_BUCKET);
  if (!data) {
    await s.storage.createBucket(COVERS_BUCKET, {
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
  }
}

export async function createCoverUploadUrl(storageKey: string) {
  const s = admin();
  const { data, error } = await s.storage
    .from(COVERS_BUCKET)
    .createSignedUploadUrl(storageKey);
  if (error || !data) throw new Error(error?.message ?? "Falha ao gerar URL de upload da capa");
  return { signedUrl: data.signedUrl };
}

/** URL publica permanente de um objeto do bucket de capas. */
export function coverPublicUrl(storageKey: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${COVERS_BUCKET}/${storageKey}`;
}
