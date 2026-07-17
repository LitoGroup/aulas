"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/rbac";
import {
  updateOwnProfile,
  changeOwnPassword,
  exportUserData,
  deleteOwnAccount,
  WrongPasswordError,
} from "@/server/services/account";

export interface ActionState {
  error?: string;
  success?: string;
}

async function me() {
  return requireRole(["STUDENT", "TEACHER", "ADMIN"]);
}

export async function updateProfileAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await me();
  try {
    await updateOwnProfile(actor.id, { name: String(formData.get("name") ?? "") });
  } catch {
    return { error: "Não foi possível salvar o nome" };
  }
  revalidatePath("/conta");
  return { success: "Nome atualizado" };
}

export async function changePasswordAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const actor = await me();
  try {
    await changeOwnPassword(
      actor.id,
      String(formData.get("current") ?? ""),
      String(formData.get("password") ?? ""),
    );
  } catch (e) {
    if (e instanceof WrongPasswordError) return { error: "Senha atual incorreta" };
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("8 caracteres")) return { error: "A nova senha deve ter ao menos 8 caracteres" };
    return { error: "Não foi possível alterar a senha" };
  }
  return { success: "Senha alterada com sucesso" };
}

export async function exportDataAction(): Promise<
  { data: unknown } | { error: string }
> {
  const actor = await me();
  try {
    const data = await exportUserData(actor.id);
    return { data };
  } catch {
    return { error: "Não foi possível exportar os dados" };
  }
}

export async function deleteAccountAction(
  password: string,
): Promise<{ ok: true } | { error: string }> {
  const actor = await me();
  try {
    await deleteOwnAccount(actor.id, password);
    return { ok: true };
  } catch (e) {
    if (e instanceof WrongPasswordError) return { error: "Senha incorreta" };
    return { error: "Não foi possível excluir a conta" };
  }
}
