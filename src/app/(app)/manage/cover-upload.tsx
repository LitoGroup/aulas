"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCoverUploadUrlAction, setCourseCoverAction } from "@/server/actions/cover";
import { Label } from "@/components/ui";

type Alvo = "thumb" | "banner";

const TEXTOS: Record<Alvo, { rotulo: string; dica: string; vazio: string; proporcao: string }> = {
  thumb: {
    rotulo: "Thumb do curso",
    dica: "Aparece nos cartões do painel e do catálogo · ideal 1280×720 (16:9)",
    vazio: "Sem thumb",
    proporcao: "aspect-[16/9]",
  },
  banner: {
    rotulo: "Banner do curso",
    dica: "Faixa larga no topo da página do curso · ideal 1920×1080 (16:9), com o conteúdo no centro",
    vazio: "Usa a thumb",
    proporcao: "aspect-[16/9]",
  },
};

export function CoverUpload({
  courseId,
  currentUrl,
  alvo = "thumb",
}: {
  courseId: string;
  currentUrl: string | null;
  alvo?: Alvo;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const t = TEXTOS[alvo];

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

    const saved = await setCourseCoverAction({ courseId, storageKey: signed.storageKey, alvo });
    if ("error" in saved) {
      setStatus(saved.error);
    } else {
      setPreview(saved.url);
      setStatus(alvo === "banner" ? "Banner atualizado" : "Thumb atualizada");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div>
      <Label>{t.rotulo}</Label>
      {/* flex-wrap: com a miniatura de 144px fixa, o seletor de arquivo não
          cabia na mesma linha em 375px e estourava o card. */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--canvas)]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={t.rotulo} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center px-2 text-center text-xs text-[color:var(--muted)]">
              {t.vazio}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 basis-56">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onChange}
            disabled={busy}
            className="block w-full text-sm text-[color:var(--ink-soft)] file:mr-3 file:rounded-lg file:border-0 file:bg-[color:var(--navy-fill)] file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
          />
          <p className="mt-1 text-xs text-[color:var(--muted)]">JPG, PNG ou WebP · até 5 MB</p>
          <p className="mt-0.5 text-xs text-[color:var(--muted)]">{t.dica}</p>
          {status && <p className="mt-1 text-xs text-[color:var(--muted)]">{status}</p>}
        </div>
      </div>
    </div>
  );
}
