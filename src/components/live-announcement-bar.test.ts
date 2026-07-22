import { describe, it, expect } from "vitest";
import { calcularRestante } from "./live-announcement-bar";

// Referência fixa: 17/08/2026 20:00 (-03:00).
const EVENTO = new Date("2026-08-17T20:00:00-03:00").getTime();
const UM_DIA = 86_400_000;

describe("calcularRestante", () => {
  it("decompõe dias, horas, minutos e segundos", () => {
    const agora = EVENTO - (2 * UM_DIA + 3 * 3_600_000 + 4 * 60_000 + 5_000);
    expect(calcularRestante(agora, EVENTO)).toEqual({ dias: 2, horas: 3, min: 4, seg: 5 });
  });

  it("um dia antes é exatamente 1 dia", () => {
    expect(calcularRestante(EVENTO - UM_DIA, EVENTO)).toEqual({
      dias: 1,
      horas: 0,
      min: 0,
      seg: 0,
    });
  });

  it("recolhe (null) quando o evento chega", () => {
    expect(calcularRestante(EVENTO, EVENTO)).toBeNull();
  });

  it("recolhe (null) depois do evento", () => {
    expect(calcularRestante(EVENTO + 60_000, EVENTO)).toBeNull();
  });

  it("faltando menos de um minuto, só segundos", () => {
    expect(calcularRestante(EVENTO - 30_000, EVENTO)).toEqual({
      dias: 0,
      horas: 0,
      min: 0,
      seg: 30,
    });
  });
});
