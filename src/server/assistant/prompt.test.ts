import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./prompt";
import { ESCOLA } from "@/lib/contact";

describe("buildSystemPrompt", () => {
  const p = buildSystemPrompt("CTX_MARCADOR_123");

  it("injeta o contexto recebido", () => {
    expect(p).toContain("CTX_MARCADOR_123");
  });

  it("manda responder apenas com base no contexto e não inventar", () => {
    expect(p).toMatch(/apenas com base no CONTEXTO/i);
    expect(p).toMatch(/n[aã]o invente/i);
  });

  it("orienta o handoff para o WhatsApp da escola", () => {
    expect(p).toContain(ESCOLA.telefone);
  });

  it("proíbe inventar procedimentos técnicos de aviação", () => {
    expect(p).toMatch(/procedimentos t[ée]cnicos/i);
  });
});
