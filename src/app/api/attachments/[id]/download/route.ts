import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import {
  getAttachmentForDownload,
  isInlineViewable,
} from "@/server/services/attachment";
import { createSignedFileUrl } from "@/server/storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  try {
    const actor = { id: session.user.id, role: session.user.role };
    const { storageKey, fileName, mimeType } = await getAttachmentForDownload(actor, id);
    // PDFs/imagens abrem inline (nova guia); os demais forcam download.
    const inline = isInlineViewable(mimeType, fileName);
    const url = await createSignedFileUrl(storageKey, { expiresIn: 120, inline });
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
}
