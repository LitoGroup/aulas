"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/rbac";
import { adminSetPassword } from "@/server/services/admin-users";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function adminSetPasswordAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireRole(["ADMIN"]);
  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await adminSetPassword(actor, userId, password);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("8 caracteres")) return { error: "A senha deve ter ao menos 8 caracteres" };
    return { error: "Não foi possível alterar a senha" };
  }
  revalidatePath("/manage/users");
  return { success: "Senha alterada" };
}
