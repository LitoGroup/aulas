import { describe, it, expect } from "vitest";
import { KNOWLEDGE_BASE } from "./knowledge";
import { ESCOLA } from "@/lib/contact";

describe("KNOWLEDGE_BASE", () => {
  it("cita a escola, o contato e o desconto/cupons", () => {
    expect(KNOWLEDGE_BASE).toContain("Lito Aviation Academy");
    expect(KNOWLEDGE_BASE).toContain(ESCOLA.telefone);
    expect(KNOWLEDGE_BASE).toContain(ESCOLA.site);
    expect(KNOWLEDGE_BASE).toMatch(/17%/);
    expect(KNOWLEDGE_BASE).toContain("AGORAOUNUNCA");
    expect(KNOWLEDGE_BASE).toContain("AGORAOUNUNCA2");
  });

  it("lista cursos reais da escola", () => {
    expect(KNOWLEDGE_BASE).toMatch(/Mec[aâ]nico de Aeronaves/i);
  });

  it("explica como a plataforma funciona (concluir aula, materiais)", () => {
    expect(KNOWLEDGE_BASE).toMatch(/conclu[íi]da/i);
    expect(KNOWLEDGE_BASE).toMatch(/baix/i);
  });
});
