import type { Session } from "next-auth";
import type { Role } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor() {
    super("Nao autenticado");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Acesso negado");
    this.name = "ForbiddenError";
  }
}

export interface SessionUser {
  id: string;
  role: Role;
}

/**
 * Verificacao pura (testavel): valida sessao e papel, retorna o usuario.
 */
export function assertRole(
  session: Session | null,
  allowed: Role[],
): SessionUser {
  if (!session?.user) throw new UnauthorizedError();
  const user = session.user as unknown as SessionUser;
  if (!allowed.includes(user.role)) throw new ForbiddenError();
  return user;
}

/**
 * Guard para Server Components / Route Handlers: le a sessao real.
 */
export async function requireRole(allowed: Role[]): Promise<SessionUser> {
  // Import tardio evita carregar next-auth (e Prisma) em contextos que so
  // precisam da verificacao pura assertRole (ex.: testes unitarios).
  const { auth } = await import("./config");
  const session = await auth();
  return assertRole(session, allowed);
}
