import { describe, it, expect } from "vitest";
import { resumirNotas } from "./review";
import { reviewInputSchema } from "@/lib/validation/review";

describe("resumirNotas", () => {
  it("sem respostas nao divide por zero", () => {
    const r = resumirNotas([]);
    expect(r.total).toBe(0);
    expect(r.media).toBe(0);
    expect(r.distribuicao).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it("calcula media com uma casa decimal", () => {
    // (5+4+5) / 3 = 4,666... -> 4,7
    expect(resumirNotas([5, 4, 5]).media).toBe(4.7);
    // (4+5) / 2 = 4,5 exato
    expect(resumirNotas([4, 5]).media).toBe(4.5);
  });

  it("conta quantas respostas em cada nota", () => {
    const r = resumirNotas([5, 5, 3, 1, 5]);
    expect(r.total).toBe(5);
    expect(r.distribuicao[5]).toBe(3);
    expect(r.distribuicao[3]).toBe(1);
    expect(r.distribuicao[1]).toBe(1);
    expect(r.distribuicao[2]).toBe(0);
  });

  it("ignora nota fora da escala em vez de sujar a distribuicao", () => {
    const r = resumirNotas([5, 9, 0]);
    expect(r.distribuicao[5]).toBe(1);
    expect(Object.values(r.distribuicao).reduce((a, b) => a + b, 0)).toBe(1);
  });
});

describe("reviewInputSchema", () => {
  it("aceita nota vinda do formulario como texto", () => {
    // FormData entrega string; o schema precisa converter.
    const r = reviewInputSchema.safeParse({ rating: "4", comment: "Muito bom" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.rating).toBe(4);
  });

  it("recusa nota fora de 1 a 5", () => {
    for (const nota of [0, 6, -1, 2.5]) {
      const r = reviewInputSchema.safeParse({ rating: nota });
      expect(r.success, `nota ${nota} deveria ser recusada`).toBe(false);
    }
  });

  it("comentario em branco vira ausencia de comentario", () => {
    const r = reviewInputSchema.safeParse({ rating: 5, comment: "   " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.comment).toBeNull();
  });

  it("comentario e opcional", () => {
    expect(reviewInputSchema.safeParse({ rating: 5 }).success).toBe(true);
    expect(reviewInputSchema.safeParse({ rating: 5, comment: null }).success).toBe(true);
  });

  it("recusa comentario gigante", () => {
    const r = reviewInputSchema.safeParse({ rating: 5, comment: "a".repeat(2001) });
    expect(r.success).toBe(false);
  });

  it("apara espacos do comentario", () => {
    const r = reviewInputSchema.safeParse({ rating: 3, comment: "  ótimo curso  " });
    if (r.success) expect(r.data.comment).toBe("ótimo curso");
  });
});
