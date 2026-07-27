import { describe, it, expect } from "vitest";
import { KNOWLEDGE_BASE } from "./knowledge";
import { ESCOLA } from "@/lib/contact";

describe("KNOWLEDGE_BASE (diretório)", () => {
  it("cita a escola, o contato e os cupons", () => {
    expect(KNOWLEDGE_BASE).toContain("Lito Aviation Academy");
    expect(KNOWLEDGE_BASE).toContain(ESCOLA.telefone);
    expect(KNOWLEDGE_BASE).toContain(ESCOLA.site);
    expect(KNOWLEDGE_BASE).toMatch(/17%/);
    expect(KNOWLEDGE_BASE).toContain("AGORAOUNUNCA");
    expect(KNOWLEDGE_BASE).toContain("AGORAOUNUNCA2");
  });

  it("lista os cursos com a URL oficial de cada um", () => {
    expect(KNOWLEDGE_BASE).toMatch(/Mec[aâ]nico de Aeronaves/);
    expect(KNOWLEDGE_BASE).toMatch(/Piloto/);
    expect(KNOWLEDGE_BASE).toMatch(/Comiss[áa]rio/);
    expect(KNOWLEDGE_BASE).toContain("litoaviationacademy.com.br/formacoes-e-cursos/");
  });

  it("orienta a consultar a página oficial ao vivo (não guarda preços fixos)", () => {
    expect(KNOWLEDGE_BASE).toMatch(/consulte a página oficial|ferramenta/i);
    // A base deixou de embutir preços; eles vêm da consulta ao vivo.
    expect(KNOWLEDGE_BASE).not.toMatch(/R\$\s?\d/);
  });

  it("explica como a plataforma funciona", () => {
    expect(KNOWLEDGE_BASE).toMatch(/conclu[íi]da/i);
    expect(KNOWLEDGE_BASE).toMatch(/baix/i);
  });
});
