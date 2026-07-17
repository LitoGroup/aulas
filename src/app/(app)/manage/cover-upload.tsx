"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCoverUploadUrlAction, setCourseCoverAction } from "@/server/actions/cover";
import { Label } from "@/components/ui";

export function CoverUpload({
  courseId,
  currentUrl,
}: {
  courseId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("Enviando...");

    const signed = await getCoverUploadUrlAction({
      courseId,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });
    if ("error" in signed) {
      setStatus(signed.error);
      setBusy(false);
      return;
    }

    const put = await fetch(signed.signedUrl, {
      method: "PUT",
      headers: { "content-type": file.type },
      body: file,
    });
    if (!put.ok) {
      setStatus("Falha no envio da imagem");
      setBusy(false);
      return;
    }

    const saved = await setCourseCoverAction({ courseId, storageKey: signed.storageKey });
    if ("error" in saved) {
      setStatus(saved.error);
    } else {
      setPreview(saved.url);
      setStatus("Capa atualizada");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div>
      <Label>Thumb do curso</Label>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--canvas)]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Capa do curso" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-[color:var(--muted)]">
              Sem capa
            </span>
          )}
        </div>
        <div className="min-w-0">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onChange}
            disabled={busy}
            className="block w-full text-sm text-[color:var(--ink-soft)] file:mr-3 file:rounded-lg file:border-0 file:bg-[color:var(--navy-fill)] file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
          />
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            JPG, PNG ou WebP · até 5 MB · ideal 1280×720 (16:9)
          </p>
          {status && <p className="mt-1 text-xs text-[color:var(--muted)]">{status}</p>}
        </div>
      </div>
    </div>
  );
}
