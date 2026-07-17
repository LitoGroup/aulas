"use client";

import { useState } from "react";
import { getVideoUploadUrlAction } from "@/server/actions/video";
import { Label } from "@/components/ui";

/**
 * Campo de upload de vídeo para a plataforma (bucket privado).
 * Faz o upload direto navegador para o storage com progresso e preenche o
 * hidden input `videoRef` com a storageKey para o submit do form.
 */
export function VideoUploadField({
  moduleId,
  defaultRef,
}: {
  moduleId: string;
  defaultRef?: string | null;
}) {
  const [storageKey, setStorageKey] = useState(defaultRef ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(
    defaultRef ? "Vídeo já enviado - envie outro para substituir." : null,
  );

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus(null);
    setProgress(0);

    const signed = await getVideoUploadUrlAction({
      moduleId,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });
    if ("error" in signed) {
      setStatus(signed.error);
      setProgress(null);
      return;
    }

    // XHR para ter progresso de upload (fetch não expõe).
    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signed.signedUrl);
      xhr.setRequestHeader("content-type", file.type);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setStorageKey(signed.storageKey);
          setStatus(`${file.name} enviado`);
        } else {
          setStatus("Falha no envio do vídeo");
        }
        setProgress(null);
        resolve();
      };
      xhr.onerror = () => {
        setStatus("Falha de rede no envio");
        setProgress(null);
        resolve();
      };
      xhr.send(file);
    });
  }

  return (
    <div>
      <Label>Arquivo de vídeo (MP4/WebM)</Label>
      <input type="hidden" name="videoRef" value={storageKey} />
      <input
        type="file"
        accept="video/mp4,video/webm"
        onChange={onChange}
        disabled={progress !== null}
        className="block w-full text-sm text-[color:var(--ink-soft)] file:mr-3 file:rounded-lg file:border-0 file:bg-[color:var(--navy-fill)] file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
      />
      {progress !== null && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--canvas)]">
            <div
              className="h-full rounded-full bg-[color:var(--navy-fill)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-[color:var(--muted)]">{progress}%</span>
        </div>
      )}
      {status && <p className="mt-1.5 text-xs text-[color:var(--muted)]">{status}</p>}
    </div>
  );
}
