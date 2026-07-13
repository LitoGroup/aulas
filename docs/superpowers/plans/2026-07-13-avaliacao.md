# Avaliação — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Professor cria provas (questões de múltipla escolha e V/F) associadas a curso/módulo; aluno responde; o sistema corrige server-side, calcula a nota, compara com a nota de corte configurável e registra a tentativa com feedback de aprovado/reprovado.

**Architecture:** Serviços `assessment.ts` (autoria) e `grading.ts` (correção). Autoria com ownership (dono do curso/admin). Correção 100% server-side — o `isCorrect` das alternativas NUNCA vai ao cliente antes do envio. Tentativas gravadas em `AssessmentAttempt` + `AttemptAnswer`.

**Tech Stack:** Next.js 16, Prisma 6, Auth.js, Zod, Vitest.

## Global Constraints

- Tabelas `school_*` no schema `lms`. Entrada validada; autorização server-side.
- `AnswerOption.isCorrect` jamais serializado para o cliente na tela de responder.
- Professor/dono edita; aluno matriculado responde.
- Nota de corte (`passingScore`) por avaliação; nota final em % inteiro.

---

### Task 1: Serviço de autoria de avaliações — TDD

**Files:** Create `src/lib/validation/assessment.ts`, `src/server/services/assessment.ts`, `src/server/services/assessment.test.ts`

**Interfaces:**
- Produces:
  - `createAssessment(actor, courseId, { title, passingScore, moduleId? })` (ownership via curso).
  - `addQuestion(actor, assessmentId, { statement, type, options: [{text, isCorrect}], order? })` — valida: MULTIPLE_CHOICE 2+ opções e exatamente 1 correta; TRUE_FALSE exatamente 2 opções (V/F) e 1 correta.
  - `getAssessmentForEditing(actor, id)` (inclui opções com isCorrect).
  - `AssessmentForbiddenError`, `InvalidQuestionError`.

- [ ] Step 1: Teste — cria avaliação em curso próprio; barra não-dono; addQuestion MC com 1 correta OK; MC com 0 corretas lança `InvalidQuestionError`; V/F exige 2 opções.
- [ ] Step 2: Rodar e ver falhar.
- [ ] Step 3: Implementar validação Zod + serviço (transação criando questão + opções).
- [ ] Step 4: Rodar e passar.
- [ ] Step 5: Commit.

---

### Task 2: Serviço de correção (grading) — TDD

**Files:** Create `src/server/services/grading.ts`, `src/server/services/grading.test.ts`

**Interfaces:**
- Produces:
  - `getAssessmentForTaking(actor, id)`: valida matrícula; retorna questões + opções SEM `isCorrect`.
  - `submitAttempt(actor, assessmentId, answers: {questionId, selectedOptionId}[])`: valida matrícula, corrige comparando com `isCorrect`, calcula `score` (% inteiro), `passed = score >= passingScore`, grava `AssessmentAttempt` + `AttemptAnswer`; retorna `{ score, passed, correct, total }`.
  - `listAttempts(userId, assessmentId)`.
  - `NotEnrolledError` (reutiliza de progress ou próprio).

- [ ] Step 1: Teste — prova com 2 questões; respostas 2/2 → score 100 passed true (corte 70); 1/2 → 50 passed false; grava attempt; `getAssessmentForTaking` não expõe `isCorrect`.
- [ ] Step 2: Rodar e ver falhar.
- [ ] Step 3: Implementar (busca gabarito server-side, calcula, persiste em transação).
- [ ] Step 4: Rodar e passar.
- [ ] Step 5: Commit.

---

### Task 3: Actions de avaliação

**Files:** Create `src/server/actions/assessment.ts`.

**Interfaces:**
- Consumes: serviços das Tasks 1–2 + `requireRole`.
- Produces: `createAssessmentAction`, `addQuestionAction` (TEACHER/ADMIN); `submitAttemptAction` (STUDENT+), que recebe as respostas e retorna resultado serializável.

- [ ] Step 1: Implementar as três actions com `requireRole` e `revalidatePath`.
- [ ] Step 2: Commit.

---

### Task 4: UI do professor — criar prova e questões

**Files:** Create `src/app/(app)/manage/courses/[id]/assessments/new/page.tsx`, `.../assessments/[assessmentId]/page.tsx`, forms client; adicionar link na página de gestão do curso.

- [ ] Step 1: Criar avaliação (título, nota de corte, módulo opcional).
- [ ] Step 2: Adicionar questão (tipo, enunciado, opções com marcação da correta). MC: campos dinâmicos de opções; V/F: Verdadeiro/Falso pré-preenchidos.
- [ ] Step 3: Listar questões já criadas na página da avaliação.
- [ ] Step 4: Teste manual.
- [ ] Step 5: Commit.

---

### Task 5: UI do aluno — responder e ver resultado

**Files:** Create `src/app/(app)/assessments/[id]/page.tsx` (server, guard matrícula, questões sem gabarito) + `take-form.tsx` (client) + resultado.

- [ ] Step 1: Listar avaliações do curso na página do curso (aluno) com link para responder.
- [ ] Step 2: Form de resposta (radio por questão) → `submitAttemptAction`.
- [ ] Step 3: Exibir resultado: nota %, Aprovado/Reprovado (cor), acertos/total; permitir refazer.
- [ ] Step 4: Teste manual.
- [ ] Step 5: Commit + push.

## Self-Review

- Cobertura: autoria (T1), correção + nota de corte (T2), actions (T3), UI professor (T4), UI aluno + resultado (T5). ✔
- Segurança: `isCorrect` só server-side; matrícula exigida para responder; ownership para autoria. ✔
- Tipos de questão: MULTIPLE_CHOICE e TRUE_FALSE validados. ✔
