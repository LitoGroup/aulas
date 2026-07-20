import { describe, it, expect } from "vitest";
import { studyStage, studyCta, studyEyebrow } from "./study-cta";

describe("studyStage", () => {
  it("sem nenhuma aula concluida o aluno esta em nao-iniciado", () => {
    expect(studyStage(0)).toBe("nao-iniciado");
  });

  it("qualquer progresso parcial e em-andamento", () => {
    expect(studyStage(1)).toBe("em-andamento");
    expect(studyStage(50)).toBe("em-andamento");
    expect(studyStage(99)).toBe("em-andamento");
  });

  it("100% ou mais e concluido", () => {
    expect(studyStage(100)).toBe("concluido");
    expect(studyStage(120)).toBe("concluido");
  });
});

describe("studyCta", () => {
  it("convida a comecar quem ainda nao abriu nenhuma aula", () => {
    expect(studyCta(0)).toBe("Iniciar os estudos");
  });

  it("muda para continuar assim que ha progresso", () => {
    expect(studyCta(5)).toBe("Continuar estudando");
  });

  it("vira revisao quando o curso termina", () => {
    expect(studyCta(100)).toBe("Revisar o curso");
  });
});

describe("studyEyebrow", () => {
  it("acompanha o mesmo estagio do botao", () => {
    expect(studyEyebrow(0)).toBe("Comece agora");
    expect(studyEyebrow(40)).toBe("Continue de onde parou");
    expect(studyEyebrow(100)).toBe("Curso concluído");
  });
});
