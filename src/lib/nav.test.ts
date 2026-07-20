import { describe, it, expect } from "vitest";
import { learnItems, teachItems, bottomBarItems, activeHref, isTeacherRole } from "./nav";

describe("teachItems", () => {
  it("aluno nao recebe itens de gestao", () => {
    expect(teachItems("STUDENT")).toEqual([]);
  });

  it("professor recebe gerenciar, mas nao alunos", () => {
    const itens = teachItems("TEACHER").map((i) => i.href);
    expect(itens).toEqual(["/manage"]);
  });

  it("admin recebe gerenciar e alunos", () => {
    const itens = teachItems("ADMIN").map((i) => i.href);
    expect(itens).toEqual(["/manage", "/manage/users"]);
  });
});

describe("bottomBarItems", () => {
  it("sempre entrega exatamente 4 abas (a quinta vaga e o Menu)", () => {
    for (const papel of ["STUDENT", "TEACHER", "ADMIN"]) {
      expect(bottomBarItems(papel)).toHaveLength(4);
    }
  });

  it("aluno ve a conta na barra", () => {
    expect(bottomBarItems("STUDENT").map((i) => i.href)).toEqual([
      "/dashboard",
      "/courses",
      "/assessments",
      "/conta",
    ]);
  });

  it("professor troca a conta por gerenciar", () => {
    expect(bottomBarItems("TEACHER").map((i) => i.href)).toEqual([
      "/dashboard",
      "/courses",
      "/assessments",
      "/manage",
    ]);
  });

  it("os rotulos curtos cabem na barra", () => {
    for (const item of bottomBarItems("ADMIN")) {
      expect(item.short.length).toBeLessThanOrEqual(9);
    }
  });
});

describe("activeHref", () => {
  const hrefs = learnItems().map((i) => i.href).concat(teachItems("ADMIN").map((i) => i.href));

  it("casa a rota exata", () => {
    expect(activeHref("/dashboard", hrefs)).toBe("/dashboard");
  });

  it("casa rota filha com o pai", () => {
    expect(activeHref("/courses/mecanica-basica", hrefs)).toBe("/courses");
  });

  it("prefere o href mais especifico", () => {
    // "/manage/users" e "/manage" casam os dois; deve vencer o mais longo
    expect(activeHref("/manage/users", hrefs)).toBe("/manage/users");
    expect(activeHref("/manage/courses/abc", hrefs)).toBe("/manage");
  });

  it("nao casa prefixo parcial de outro segmento", () => {
    expect(activeHref("/coursesXYZ", hrefs)).toBeUndefined();
  });

  it("retorna indefinido fora da navegacao", () => {
    expect(activeHref("/learn/abc123", hrefs)).toBeUndefined();
  });
});

describe("isTeacherRole", () => {
  it("reconhece professor e admin", () => {
    expect(isTeacherRole("TEACHER")).toBe(true);
    expect(isTeacherRole("ADMIN")).toBe(true);
    expect(isTeacherRole("STUDENT")).toBe(false);
  });
});
