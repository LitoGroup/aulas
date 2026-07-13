import { describe, it, expect } from "vitest";
import { assertRole, ForbiddenError, UnauthorizedError } from "./rbac";

const session = (role?: string) =>
  role ? ({ user: { id: "1", role } } as never) : null;

describe("assertRole", () => {
  it("lanca UnauthorizedError sem sessao", () => {
    expect(() => assertRole(null, ["TEACHER"])).toThrow(UnauthorizedError);
  });

  it("lanca ForbiddenError quando o papel nao esta autorizado", () => {
    expect(() => assertRole(session("STUDENT"), ["TEACHER", "ADMIN"])).toThrow(
      ForbiddenError,
    );
  });

  it("retorna o usuario quando o papel esta autorizado", () => {
    const user = assertRole(session("TEACHER"), ["TEACHER", "ADMIN"]);
    expect(user.role).toBe("TEACHER");
  });
});
