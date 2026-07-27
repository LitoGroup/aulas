// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/auth/config", () => ({ auth: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

import { auth } from "@/server/auth/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { POST } from "./route";

const req = (body: unknown) =>
  new Request("http://x/api/assistant", { method: "POST", body: JSON.stringify(body) });

describe("POST /api/assistant", () => {
  beforeEach(() => vi.resetAllMocks());

  it("responde 401 sem sessão", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await POST(req({ messages: [] }));
    expect(res.status).toBe(401);
  });

  it("responde 429 quando estoura o limite diário", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(checkRateLimit).mockResolvedValue(false);
    const res = await POST(req({ messages: [] }));
    expect(res.status).toBe(429);
  });
});
