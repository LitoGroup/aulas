import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, _resetRateLimit } from "./rate-limit";

beforeEach(() => _resetRateLimit());

describe("checkRateLimit", () => {
  it("permite ate o limite e bloqueia depois", async () => {
    const key = "login:teste@example.com";
    for (let i = 0; i < 5; i++) {
      expect(await checkRateLimit(key, { max: 5 })).toBe(true);
    }
    // 6a tentativa estoura
    expect(await checkRateLimit(key, { max: 5 })).toBe(false);
  });

  it("chaves diferentes tem contadores independentes", async () => {
    expect(await checkRateLimit("a", { max: 1 })).toBe(true);
    expect(await checkRateLimit("a", { max: 1 })).toBe(false);
    expect(await checkRateLimit("b", { max: 1 })).toBe(true);
  });
});
