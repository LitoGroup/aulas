import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import {
  getAttachmentForDownload,
  resolverModoDeAcesso,
} from "@/server/services/attachment";
import { createSignedFileUrl } from "@/server/storage";

export async function GET(
  req: Request,
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
    // ?modo=baixar força o download; sem parâmetro, PDFs e imagens abrem
    // inline e o restante baixa.
    const pedido = new URL(req.url).searchParams.get("modo");
    const modo = resolverModoDeAcesso(pedido, mimeType, fileName);
    const url = await createSignedFileUrl(storageKey, {
      expiresIn: 120,
      inline: modo === "abrir",
      // Salva com o nome que o professor enviou, não com a chave do storage.
      downloadName: fileName,
    });
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
}
