"use server";

import { redirect } from "next/navigation";
import { registerFormSchema } from "@/lib/validation/auth";
import { createUser, EmailAlreadyInUseError } from "@/server/services/user";
import { autoEnrollAll } from "@/server/services/enrollment";
import { requestReset, resetPassword, InvalidTokenError } from "@/server/services/password-reset";
import { LEGAL_VERSION } from "@/lib/legal";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function registerAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados invalidos" };
  }
  try {
    const { consent, ...data } = parsed.data;
    void consent;
    const user = await createUser(data, { consentVersion: LEGAL_VERSION });
    // Todo aluno novo ja entra matriculado nos cursos publicados.
    await autoEnrollAll(user.id);
  } catch (e) {
    if (e instanceof EmailAlreadyInUseError) {
      return { error: "Este e-mail ja esta cadastrado" };
    }
    return { error: "Nao foi possivel concluir o cadastro" };
  }
  redirect("/login?registered=1");
}

export async function requestResetAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  await requestReset(email);
  // Resposta neutra: nao revela se o e-mail existe.
  return {
    success:
      "Se o e-mail estiver cadastrado, enviamos um link para redefinir a senha.",
  };
}

export async function resetPasswordAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password !== confirm) {
    return { error: "As senhas nao coincidem" };
  }
  try {
    await resetPassword(token, password);
  } catch (e) {
    if (e instanceof InvalidTokenError) {
      return { error: "Link invalido ou expirado. Solicite um novo." };
    }
    return { error: "Nao foi possivel redefinir a senha" };
  }
  redirect("/login?reset=1");
}
