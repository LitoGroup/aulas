# Progresso do Aluno — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Aluno marca aula como concluída; o sistema calcula o progresso do curso, aplica a regra `requiresPrevious` (a aula só abre se a anterior estiver concluída) e o dashboard mostra os cursos matriculados com percentual.

**Architecture:** Serviço `progress.ts` (regras + Prisma) ancorado em `Enrollment` → `LessonProgress`. Server Action para marcar concluída. UI: botão no player, cadeado nas aulas bloqueadas, cards de progresso no dashboard.

**Tech Stack:** Next.js 16, Prisma 6, Auth.js, Zod, Vitest.

## Global Constraints

- Tabelas `school_*` no schema `lms`. Toda entrada validada; autorização server-side.
- Progresso sempre ancorado na `Enrollment` do aluno (nunca direto no User).
- Aluno só marca progresso em curso onde está matriculado.
- Ordem global das aulas = ordem do módulo, depois ordem da aula dentro do módulo.

---

### Task 1: Serviço de progresso (marcar concluída + cálculo) — TDD

**Files:** Create `src/server/services/progress.ts`, `src/server/services/progress.test.ts`

**Interfaces:**
- Produces:
  - `markLessonComplete(userId, lessonId)`: valida matrícula, faz upsert de `LessonProgress` (status COMPLETED, completedAt). Lança `NotEnrolledError` se não matriculado.
  - `getCourseProgress(userId, courseId)`: retorna `{ total, completed, percent, completedLessonIds: string[] }`.
  - `NotEnrolledError`.

- [ ] Step 1: Teste — sem matrícula lança `NotEnrolledError`; após matrícula, marcar 1 de 2 aulas dá percent 50 e completedLessonIds contém a aula; marcar de novo é idempotente.
- [ ] Step 2: Rodar e ver falhar.
- [ ] Step 3: Implementar (buscar enrollment por unique userId_courseId; contar lessons do curso via módulos; upsert em unique enrollmentId_lessonId).
- [ ] Step 4: Rodar e passar.
- [ ] Step 5: Commit.

---

### Task 2: Regra de liberação (requiresPrevious) — TDD

**Files:** Create `src/server/services/lesson-access.ts`, `src/server/services/lesson-access.test.ts`

**Interfaces:**
- Produces:
  - `computeLessonLocks(courseWithModules, completedLessonIds)`: função **pura** que recebe a lista ordenada de aulas (com flag `requiresPrevious`) + set de concluídas e retorna `Map<lessonId, boolean>` (true = bloqueada). Regra: uma aula com `requiresPrevious` fica bloqueada se a aula imediatamente anterior (ordem global) não estiver concluída. Primeira aula nunca bloqueia.
  - `isLessonUnlocked(userId, lessonId)`: versão que lê do banco (matrícula + progresso) para o guard do viewer.

- [ ] Step 1: Teste (puro) — 3 aulas [A, B(requiresPrevious), C(requiresPrevious)]: sem nada concluído → A livre, B bloqueada, C bloqueada; com A concluída → B livre, C bloqueada; com A+B → todas livres.
- [ ] Step 2: Rodar e ver falhar.
- [ ] Step 3: Implementar `computeLessonLocks` (pura) e `isLessonUnlocked` (usa `getCourseProgress` + ordem).
- [ ] Step 4: Rodar e passar.
- [ ] Step 5: Commit.

---

### Task 3: Server Action + guard no player

**Files:** Create `src/server/actions/progress.ts`; Modify `src/app/(app)/learn/[lessonId]/page.tsx`; create `src/app/(app)/learn/[lessonId]/complete-button.tsx`.

**Interfaces:**
- Consumes: `markLessonComplete`, `isLessonUnlocked`, `getCourseProgress`.
- Produces: `markCompleteAction(prev, formData)` (requireRole aluno+, revalida); botão "Marcar como concluída" no player; se a aula estiver bloqueada por `requiresPrevious`, o viewer redireciona de volta com aviso.

- [ ] Step 1: `markCompleteAction` valida sessão e chama `markLessonComplete`.
- [ ] Step 2: No viewer: checar `isLessonUnlocked`; se bloqueada, `redirect` para a página do curso. Mostrar botão de concluir (ou "Concluída ✓").
- [ ] Step 3: Teste manual (marcar conclui e libera a próxima).
- [ ] Step 4: Commit.

---

### Task 4: Cadeado e progresso na página do curso

**Files:** Modify `src/app/(app)/courses/[slug]/page.tsx`.

- [ ] Step 1: Carregar `getCourseProgress` + locks; exibir barra de progresso do curso.
- [ ] Step 2: Aulas concluídas com ✓; aulas bloqueadas com 🔒 (sem link); demais como link.
- [ ] Step 3: Teste manual.
- [ ] Step 4: Commit.

---

### Task 5: Dashboard real (Meus cursos + progresso)

**Files:** Modify `src/app/(app)/dashboard/page.tsx`; create `src/server/services/progress.ts` helper `listStudentProgress(userId)` (ou reutilizar `listEnrollments` + `getCourseProgress`).

**Interfaces:**
- Produces: no dashboard, para cada matrícula, card com título do curso, percentual e link "Continuar".

- [ ] Step 1: Buscar matrículas do aluno + progresso de cada uma.
- [ ] Step 2: Substituir o card placeholder "Meus cursos / Em breve" por lista real com barra de progresso.
- [ ] Step 3: Teste manual.
- [ ] Step 4: Commit + push.

## Self-Review

- Cobertura: marcar concluída (T1), percentual (T1), requiresPrevious/liberação (T2), guard no player (T3), UI curso com cadeado (T4), dashboard real (T5). ✔
- `computeLessonLocks` isolada e pura → testável sem banco. ✔
- Progresso ancorado em Enrollment; guard de matrícula em todas as escritas. ✔
