# Gestão de Conteúdo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Professor cria Curso › Módulo › Aula com vídeo (embed), texto e apostilas; aluno navega, matricula-se e assiste às aulas.

**Architecture:** Serviços em `src/server/services/*` (regras + Prisma), Server Actions em `src/server/actions/*`, telas em App Router. Autorização via `requireRole` + checagem de ownership. Apostilas via Supabase Storage (signed URLs), aproveitando as chaves já configuradas.

**Tech Stack:** Next.js 16, Prisma 6, Auth.js, Supabase Storage, Zod, Vitest.

## Global Constraints

- Tabelas prefixadas `school_` no schema `lms` (já existentes).
- Toda entrada validada com Zod. Autorização sempre server-side.
- Professor só edita cursos onde `ownerId === user.id` (ADMIN pode tudo).
- Aluno só acessa conteúdo de curso publicado e em que está matriculado.

---

### Task 1: Serviço de Cursos (CRUD + ownership) — TDD

**Files:** Create `src/lib/validation/course.ts`, `src/server/services/course.ts`, `src/server/services/course.test.ts`

**Interfaces:**
- Produces: `createCourse(ownerId, input)`, `updateCourse(user, id, input)`, `deleteCourse(user, id)`, `listCoursesByOwner(ownerId)`, `getCourseBySlug(slug)`, `NotOwnerError`. Slug gerado do título (único).

- [ ] Step 1: Teste — cria curso (gera slug), rejeita update por não-dono (`NotOwnerError`), ADMIN pode editar de qualquer um.
- [ ] Step 2: Rodar e ver falhar.
- [ ] Step 3: Implementar validação Zod + serviço (slugify + colisão → sufixo).
- [ ] Step 4: Rodar e passar.
- [ ] Step 5: Commit.

---

### Task 2: Serviço de Módulos e Aulas (CRUD + ordenação) — TDD

**Files:** Create `src/lib/validation/content.ts`, `src/server/services/module.ts`, `src/server/services/lesson.ts`, testes correspondentes.

**Interfaces:**
- Produces: `createModule(user, courseId, input)`, `reorderModules(...)`, `createLesson(user, moduleId, input)`, `updateLesson`, `deleteLesson`. Ownership herda do curso.

- [ ] Step 1: Teste — cria módulo em curso próprio; barra em curso alheio; cria aula VIDEO com provider+ref; `order` auto-incrementa.
- [ ] Step 2: Rodar e ver falhar.
- [ ] Step 3: Implementar (validação por tipo de conteúdo: VIDEO exige provider+ref; TEXT exige textBody).
- [ ] Step 4: Rodar e passar.
- [ ] Step 5: Commit.

---

### Task 3: Serviço de Matrícula — TDD

**Files:** Create `src/server/services/enrollment.ts`, teste.

**Interfaces:**
- Produces: `enroll(userId, courseId)` (idempotente via unique), `listEnrollments(userId)`, `isEnrolled(userId, courseId)`.

- [ ] Step 1: Teste — matricula uma vez; segunda vez não duplica; lista retorna o curso.
- [ ] Step 2: Rodar e ver falhar.
- [ ] Step 3: Implementar (upsert na unique userId_courseId).
- [ ] Step 4: Rodar e passar.
- [ ] Step 5: Commit.

---

### Task 4: Server Actions de conteúdo e matrícula

**Files:** Create `src/server/actions/course.ts`, `src/server/actions/enrollment.ts`.

**Interfaces:**
- Consumes: serviços das Tasks 1–3 + `requireRole`.
- Produces: actions `createCourseAction`, `updateCourseAction`, `createModuleAction`, `createLessonAction`, `enrollAction`. Cada uma faz `requireRole` e revalida o path.

- [ ] Step 1: Implementar actions com `requireRole(["TEACHER","ADMIN"])` (conteúdo) e `requireRole(["STUDENT","TEACHER","ADMIN"])` (matrícula), `revalidatePath`.
- [ ] Step 2: Teste manual via UI (Task 5+).
- [ ] Step 3: Commit.

---

### Task 5: UI do Professor — lista e criação de cursos

**Files:** Create `src/app/(app)/manage/page.tsx`, `src/app/(app)/manage/courses/new/page.tsx`, `src/app/(app)/manage/courses/[id]/page.tsx` + forms client.

- [ ] Step 1: `/manage` lista cursos do professor (`listCoursesByOwner`), botão "Novo curso".
- [ ] Step 2: Form de criação (título, descrição) → `createCourseAction`.
- [ ] Step 3: Página do curso: editar dados + publicar; listar módulos/aulas.
- [ ] Step 4: Teste manual (criar curso logado como professor).
- [ ] Step 5: Commit.

---

### Task 6: UI do Professor — módulos e aulas

**Files:** Modify `src/app/(app)/manage/courses/[id]/page.tsx`; create forms para módulo/aula.

- [ ] Step 1: Adicionar módulo ao curso.
- [ ] Step 2: Adicionar aula ao módulo (tipo VIDEO: provider + ref; TEXT: corpo).
- [ ] Step 3: Teste manual.
- [ ] Step 4: Commit.

---

### Task 7: UI do Aluno — catálogo e matrícula

**Files:** Create `src/app/(app)/courses/page.tsx`, `src/app/(app)/courses/[slug]/page.tsx`.

- [ ] Step 1: Catálogo lista cursos publicados.
- [ ] Step 2: Página do curso mostra módulos/aulas; botão "Matricular" → `enrollAction`.
- [ ] Step 3: Teste manual.
- [ ] Step 4: Commit.

---

### Task 8: Player de aula (vídeo embed + texto + apostilas)

**Files:** Create `src/app/(app)/learn/[lessonId]/page.tsx`, `src/components/video-embed.tsx`.

**Interfaces:**
- Consumes: `isEnrolled` (guard), lesson + attachments.
- Produces: componente `VideoEmbed` (Vimeo/YouTube-nocookie por provider+ref).

- [ ] Step 1: Guard: só matriculado (ou dono/admin) acessa.
- [ ] Step 2: Renderizar vídeo (iframe nocookie), textBody e lista de apostilas.
- [ ] Step 3: Teste manual.
- [ ] Step 4: Commit.

---

### Task 9: Upload de apostilas via Supabase Storage (signed URL)

**Files:** Create `src/server/storage.ts`, `src/server/actions/attachment.ts`, UI de upload na página de aula do professor.

**Interfaces:**
- Produces: `createUploadUrl(key)`, `createDownloadUrl(key)` usando `SUPABASE_SERVICE_ROLE_KEY`; `addAttachment(user, lessonId, meta)`.

- [ ] Step 1: Criar bucket `school-attachments` (privado) no Supabase.
- [ ] Step 2: `storage.ts` gera signed upload/download URLs.
- [ ] Step 3: Professor faz upload; registro em `school_attachments`; aluno baixa via signed URL temporária.
- [ ] Step 4: Teste manual.
- [ ] Step 5: Commit.

## Self-Review

- Cobertura: Curso/Módulo/Aula (T1,T2), matrícula (T3), UI professor (T5,T6), UI aluno (T7,T8), apostilas (T9), vídeo embed (T8). ✔
- Ownership e enrollment guards em serviços e actions. ✔
- Apostilas usam Supabase Storage (chaves já disponíveis) em vez de S3 novo. ✔
