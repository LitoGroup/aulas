"use server";

import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/rbac";
import {
  adminSetPassword,
  adminSetRole,
  adminDeleteUser,
  LastAdminError,
  SelfActionError,
} from "@/server/services/admin-users";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function adminSetRoleAction(
  userId: string,
  role: Role,
): Promise<{ ok: true } | { error: string }> {
  const actor = await requireRole(["ADMIN"]);
  try {
    await adminSetRole(actor, userId, role);
  } catch (e) {
    if (e instanceof LastAdminError) return { error: "Não é possível remover o último administrador." };
    return { error: "Não foi possível alterar o papel" };
  }
  revalidatePath("/manage/users");
  return { ok: true };
}

export async function adminDeleteUserAction(
  userId: string,
): Promise<{ ok: true } | { error: string }> {
  const actor = await requireRole(["ADMIN"]);
  try {
    await adminDeleteUser(actor, userId);
  } catch (e) {
    if (e instanceof SelfActionError) return { error: "Você não pode excluir a própria conta aqui." };
    if (e instanceof LastAdminError) return { error: "Não é possível excluir o último administrador." };
    return { error: "Não foi possível excluir o usuário" };
  }
  revalidatePath("/manage/users");
  return { ok: true };
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
