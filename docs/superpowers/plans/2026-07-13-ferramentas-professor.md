# Ferramentas do Professor — Implementation Plan

> REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** Professor acompanha notas/progresso dos alunos de um curso e consegue editar, reordenar e excluir módulos, aulas e questões.

**Architecture:** Novos métodos nos serviços (gradebook, reorder, updateModule, deleteQuestion) com checagem de ownership; actions; UI na área de gestão.

## Global Constraints
- Tabelas `school_*` no schema `lms`. Ownership sempre server-side (dono do curso ou ADMIN).

---

### Task 1: Gradebook — TDD
**Files:** `src/server/services/gradebook.ts` (+ test)
- `getCourseGradebook(actor, courseId)` → `{ assessments: {id,title}[], students: {id,name,progressPercent, scores: Record<assessmentId,{best:number|null,passed:boolean}>}[] }`. Ownership.
- Steps: teste (dono vê alunos matriculados com progresso e melhor nota; não-dono barrado) → falha → implementa → passa → commit.

### Task 2: Reorder + updateModule — TDD
**Files:** `src/server/services/module.ts`, `src/server/services/lesson.ts` (+ tests)
- `updateModule(actor, moduleId, {title})`; `moveModule(actor, moduleId, "up"|"down")`; `moveLesson(actor, lessonId, "up"|"down")` (troca `order` com o vizinho). Ownership herdada do curso.
- Steps: teste (mover troca ordem; nos extremos é no-op) → falha → implementa → passa → commit.

### Task 3: deleteQuestion + actions
**Files:** `src/server/services/assessment.ts` (deleteQuestion), `src/server/actions/content-edit.ts`
- Actions: `updateLessonAction`, `deleteLessonAction`, `updateModuleAction`, `deleteModuleAction`, `moveModuleAction`, `moveLessonAction`, `deleteQuestionAction` — cada uma `requireRole([TEACHER,ADMIN])` + `revalidatePath`.
- Commit.

### Task 4: UI — Painel de notas
**Files:** `src/app/(app)/manage/courses/[id]/students/page.tsx` + link na página do curso.
- Tabela: aluno × (progresso, nota por avaliação). Ownership via getCourseGradebook.
- Commit.

### Task 5: UI — editar/reordenar/excluir
**Files:** editar `src/app/(app)/manage/courses/[id]/page.tsx`; forms client (`content-edit-forms.tsx`).
- Por módulo: renomear, ↑/↓, excluir. Por aula: editar (form pré-preenchido), ↑/↓, excluir. Por questão (na página da avaliação): excluir.
- Commit + push.

## Self-Review
- Ownership em todos os novos serviços/actions. ✔
- Reorder por troca de vizinho (simples e confiável) em vez de drag. ✔
