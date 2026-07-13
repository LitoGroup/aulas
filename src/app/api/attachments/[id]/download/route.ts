import { NextResponse } from "next/server";
import { auth } from "@/server/auth/config";
import { getAttachmentForDownload } from "@/server/services/attachment";
import { createDownloadUrl } from "@/server/storage";

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
    const { storageKey } = await getAttachmentForDownload(actor, id);
    const url = await createDownloadUrl(storageKey, 60);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
}
