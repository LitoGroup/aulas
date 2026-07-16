"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  getUploadUrlAction,
  addAttachmentAction,
} from "@/server/actions/attachment";

export function AttachmentUpload({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus("Enviando...");

    const signed = await getUploadUrlAction({ lessonId, fileName: file.name });
    if ("error" in signed) {
      setStatus(signed.error);
      setBusy(false);
      return;
    }

    const put = await fetch(signed.signedUrl, {
      method: "PUT",
      headers: { "content-type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!put.ok) {
      setStatus("Falha no upload do arquivo");
      setBusy(false);
      return;
    }

    const saved = await addAttachmentAction({
      courseId,
      lessonId,
      fileName: file.name,
      storageKey: signed.storageKey,
      mimeType: file.type,
      sizeBytes: file.size,
    });
    if ("error" in saved) {
      setStatus(saved.error);
    } else {
      setStatus("Apostila anexada!");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="mt-2 text-sm">
      <label className="inline-flex cursor-pointer items-center gap-2 text-[color:var(--brand-ink)] hover:underline">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          disabled={busy}
          onChange={onChange}
          accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.xls,.xlsx"
        />
        + Anexar apostila
      </label>
      {status && <span className="ml-2 text-xs text-[color:var(--muted)]">{status}</span>}
    </div>
  );
}
