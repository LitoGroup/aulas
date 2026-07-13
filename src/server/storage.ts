import { createClient } from "@supabase/supabase-js";

export const ATTACHMENTS_BUCKET = "school-attachments";

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
