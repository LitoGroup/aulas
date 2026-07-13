import { describe, it, expect } from "vitest";
import { computeLessonLocks, type OrderedLesson } from "./lesson-access";

const lessons: OrderedLesson[] = [
  { id: "A", requiresPrevious: false },
  { id: "B", requiresPrevious: true },
  { id: "C", requiresPrevious: true },
];

describe("computeLessonLocks", () => {
  it("primeira aula nunca bloqueia; B e C bloqueadas sem progresso", () => {
    const locks = computeLessonLocks(lessons, new Set());
    expect(locks.get("A")).toBe(false);
    expect(locks.get("B")).toBe(true);
    expect(locks.get("C")).toBe(true);
  });

  it("com A concluida, B libera e C continua bloqueada", () => {
    const locks = computeLessonLocks(lessons, new Set(["A"]));
    expect(locks.get("B")).toBe(false);
    expect(locks.get("C")).toBe(true);
  });

  it("com A e B concluidas, todas liberadas", () => {
    const locks = computeLessonLocks(lessons, new Set(["A", "B"]));
    expect(locks.get("B")).toBe(false);
    expect(locks.get("C")).toBe(false);
  });

  it("aula sem requiresPrevious nunca bloqueia", () => {
    const free: OrderedLesson[] = [
      { id: "X", requiresPrevious: false },
      { id: "Y", requiresPrevious: false },
    ];
    const locks = computeLessonLocks(free, new Set());
    expect(locks.get("Y")).toBe(false);
  });
});
