import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "../db";
import { hashPassword } from "../auth/password";
import { sendMail } from "../email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export class InvalidTokenError extends Error {
  constructor() {
    super("Token invalido ou expirado");
    this.name = "InvalidTokenError";
  }
}

const newPasswordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres")
  .max(128);

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Gera um token de reset, guarda apenas o hash e envia o e-mail.
 * Retorna o token em claro (usado no e-mail); null se o e-mail nao existe
 * (nao revelamos a existencia da conta).
 */
export async function requestReset(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true },
  });
  if (!user) return null;

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const link = `${base}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: "Redefinicao de senha",
    html: `<p>Voce solicitou a redefinicao de senha.</p>
           <p><a href="${link}">Clique aqui para criar uma nova senha</a> (valido por 1 hora).</p>
           <p>Se nao foi voce, ignore este e-mail.</p>`,
  });

  return token;
}

/**
 * Valida o token (existe, nao usado, nao expirado) e troca a senha.
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const password = newPasswordSchema.parse(newPassword);
  const tokenHash = sha256(token);

  const record = await prisma.passwordResetToken.findFirst({
    where: { tokenHash },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new InvalidTokenError();
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
