# Fundação & Autenticação — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ter um app Next.js conectado ao Supabase com cadastro, login, RBAC e proteções de segurança funcionando e testados.

**Architecture:** Next.js 15 App Router fullstack. Prisma como ORM contra Postgres do Supabase. Auth.js (NextAuth v5) com Credentials + sessão em cookie httpOnly. Senhas com Argon2id. Middleware aplica headers de segurança e protege rotas privadas. Rate limit em login/reset.

**Tech Stack:** Next.js 15, TypeScript, Tailwind, Prisma, PostgreSQL (Supabase), Auth.js v5, argon2, zod, Vitest.

## Global Constraints

- Node 20+, TypeScript strict.
- **NUNCA** commitar segredos. Todas as credenciais vivem em `.env.local` (gitignored). Plans/código versionado só referenciam `process.env.*`.
- Toda entrada de API/action validada com Zod.
- Correção/autorização sempre server-side.
- Repositório remoto: `https://github.com/LitoGroup/aulas`.
- Banco: Supabase Postgres (host/porta/senha em `.env.local`).

---

### Task 1: Scaffold, git e segredos

**Files:**
- Create: `package.json`, `tsconfig.json`, `.gitignore`, `.env.local`, `.env.example`, `README.md`

**Interfaces:**
- Produces: projeto Next.js rodando; `.env.local` com `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, chaves Supabase.

- [ ] **Step 1: Scaffold Next.js**

```bash
npx create-next-app@latest aulas-app --ts --tailwind --app --src-dir --eslint --use-npm --no-turbopack
# mover conteúdo para a raiz do repo, ou desenvolver dentro de aulas-app
```

- [ ] **Step 2: Criar `.gitignore` (garantir env fora do git)**

```
node_modules/
.next/
.env
.env.local
.env*.local
```

- [ ] **Step 3: Criar `.env.example` (SEM valores reais)**

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/postgres?sslmode=require"
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

- [ ] **Step 4: Preencher `.env.local`** com os valores reais do Supabase (host `forgottenperch-db.cloudfy.live`, porta `8275`, db `postgres`, senha do banco). Arquivo já ignorado pelo git.

- [ ] **Step 5: git init + primeiro commit + remote**

```bash
git init
git add -A
git status   # CONFERIR que .env.local NÃO aparece
git commit -m "chore: scaffold Next.js app"
git branch -M main
git remote add origin https://github.com/LitoGroup/aulas.git
git push -u origin main
```

Expected: push sucesso; `.env.local` ausente do commit.

---

### Task 2: Prisma + schema + conexão Supabase

**Files:**
- Create: `prisma/schema.prisma`, `src/server/db.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `prisma` client singleton exportado de `src/server/db.ts`; enums `Role`, `ContentType`, etc.; migração aplicada no Supabase.

- [ ] **Step 1: Instalar Prisma**

```bash
npm i -D prisma && npm i @prisma/client
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Escrever `schema.prisma`** com os modelos do spec (User, PasswordResetToken, Course, Module, Lesson, Attachment, Enrollment, LessonProgress, Assessment, Question, AnswerOption, AssessmentAttempt, AttemptAnswer) e enums. `datasource` usa `url = env("DATABASE_URL")` e `directUrl = env("DIRECT_URL")`.

- [ ] **Step 3: Criar `src/server/db.ts`** (singleton do PrismaClient para evitar múltiplas conexões em dev).

```ts
import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
```

- [ ] **Step 4: Rodar migração contra o Supabase**

```bash
npx prisma migrate dev --name init
```
Expected: tabelas criadas no Supabase.

- [ ] **Step 5: Commit** (`git add prisma src/server/db.ts package.json && git commit -m "feat: prisma schema e conexão supabase"`).

---

### Task 3: Hash de senha (Argon2) — TDD

**Files:**
- Create: `src/server/auth/password.ts`, `src/server/auth/password.test.ts`

**Interfaces:**
- Produces: `hashPassword(plain: string): Promise<string>`, `verifyPassword(hash: string, plain: string): Promise<boolean>`.

- [ ] **Step 1: Teste que falha**

```ts
import { hashPassword, verifyPassword } from "./password";
test("hash e verify", async () => {
  const h = await hashPassword("segredo123");
  expect(h).not.toBe("segredo123");
  expect(await verifyPassword(h, "segredo123")).toBe(true);
  expect(await verifyPassword(h, "errado")).toBe(false);
});
```

- [ ] **Step 2: Rodar e ver falhar** (`npx vitest run src/server/auth/password.test.ts`). Instalar `npm i argon2 && npm i -D vitest` se necessário.

- [ ] **Step 3: Implementar** usando `argon2.hash`/`argon2.verify` (type argon2id).

- [ ] **Step 4: Rodar e passar.**

- [ ] **Step 5: Commit.**

---

### Task 4: Validação Zod + serviço de registro — TDD

**Files:**
- Create: `src/lib/validation/auth.ts`, `src/server/services/user.ts`, `src/server/services/user.test.ts`

**Interfaces:**
- Consumes: `hashPassword` (Task 3), `prisma` (Task 2).
- Produces: `registerSchema` (zod), `createUser(input): Promise<User>` que rejeita email duplicado e grava `password_hash`.

- [ ] **Step 1: Teste que falha** (cria usuário; segundo com mesmo email lança erro; senha nunca salva em texto).
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** `registerSchema` (name, email, senha min 8) e `createUser` (checa duplicado, hash, role default STUDENT).
- [ ] **Step 4: Rodar e passar.**
- [ ] **Step 5: Commit.**

---

### Task 5: Auth.js (login) + RBAC helper

**Files:**
- Create: `src/server/auth/config.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/server/auth/rbac.ts`, `src/server/auth/rbac.test.ts`

**Interfaces:**
- Consumes: `verifyPassword`, `prisma`.
- Produces: `auth()` handler; sessão com `user.id` e `user.role`; `requireRole(roles: Role[])` que lança/redireciona se não autorizado.

- [ ] **Step 1: Teste que falha para `requireRole`** (usuário STUDENT barrado em rota TEACHER; TEACHER liberado).
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** Auth.js Credentials provider (valida com `verifyPassword`), callbacks jwt/session injetando `role`; `requireRole` lê a sessão.
- [ ] **Step 4: Rodar e passar.**
- [ ] **Step 5: Commit.**

---

### Task 6: Middleware — proteção de rotas + headers de segurança

**Files:**
- Create: `middleware.ts`

**Interfaces:**
- Consumes: sessão Auth.js.
- Produces: redireciona não autenticados de `(student)`/`(teacher)` para `/login`; adiciona headers HSTS, CSP, X-Content-Type-Options, Referrer-Policy.

- [ ] **Step 1:** Implementar `middleware.ts` com `matcher` para rotas privadas e função que seta headers de segurança na resposta.
- [ ] **Step 2:** Teste manual: acessar `/dashboard` deslogado → redireciona `/login`; conferir headers via `curl -I`.
- [ ] **Step 3: Commit.**

---

### Task 7: Rate limiting em login/reset

**Files:**
- Create: `src/lib/rate-limit.ts`
- Modify: `src/server/auth/config.ts` (aplicar no authorize)

**Interfaces:**
- Produces: `checkRateLimit(key: string): Promise<boolean>` (Upstash Redis ou fallback in-memory para dev).

- [ ] **Step 1: Teste que falha** (N tentativas → bloqueio).
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** limite por `ip+email` (janela deslizante).
- [ ] **Step 4: Rodar e passar.**
- [ ] **Step 5: Commit.**

---

### Task 8: Fluxo "Esqueci minha senha"

**Files:**
- Create: `src/server/services/password-reset.ts`, `src/server/services/password-reset.test.ts`, `src/app/(auth)/forgot-password/page.tsx`, `src/app/(auth)/reset-password/page.tsx`, rotas de API correspondentes.

**Interfaces:**
- Consumes: `prisma`, `hashPassword`, e-mail (Resend/SMTP).
- Produces: `requestReset(email)` gera token (hash salvo em `PasswordResetToken`, expira 1h), envia e-mail; `resetPassword(token, novaSenha)` valida token não usado/não expirado e troca a senha.

- [ ] **Step 1: Teste que falha** (token expirado rejeitado; token usado não reusa; senha trocada).
- [ ] **Step 2: Rodar e ver falhar.**
- [ ] **Step 3: Implementar** serviço (token aleatório, guarda só o hash).
- [ ] **Step 4: Rodar e passar.**
- [ ] **Step 5:** UI mínima das duas páginas + rotas.
- [ ] **Step 6: Commit.**

---

### Task 9: UI de cadastro/login + páginas base

**Files:**
- Create: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(student)/dashboard/page.tsx`, `src/app/layout.tsx` (nav), componentes de form.

**Interfaces:**
- Consumes: `createUser`, Auth.js `signIn`.
- Produces: telas responsivas de registro e login; dashboard protegido mostrando o usuário logado.

- [ ] **Step 1:** Form de registro (client) → chama action/route que usa `registerSchema` + `createUser`.
- [ ] **Step 2:** Form de login → `signIn("credentials")`.
- [ ] **Step 3:** Dashboard protegido por `requireRole([STUDENT, TEACHER, ADMIN])`.
- [ ] **Step 4:** Teste manual do fluxo completo registrar→login→dashboard→logout.
- [ ] **Step 5: Commit + push.**

---

### Task 10: Seed (admin + professor demo)

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (`prisma.seed`)

**Interfaces:**
- Produces: usuário ADMIN e um TEACHER de demonstração com senha via `.env.local` (nunca hardcoded em plaintext no commit).

- [ ] **Step 1:** Escrever `seed.ts` lendo `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` de env, com `hashPassword`.
- [ ] **Step 2:** `npx prisma db seed`.
- [ ] **Step 3: Commit.**

## Self-Review

- Cobertura do spec (seção 5 Segurança): SQLi (Prisma, Task 2), XSS/CSP+CSRF (middleware, Task 6), brute-force (Task 7), RBAC (Task 5), validação Zod (Task 4), hash Argon2 (Task 3), reset token (Task 8). ✔
- Sem placeholders de código executável não resolvidos (UIs descritas por passos, código de serviços indicado). Tasks de UI são de integração; detalhar componentes na execução.
- Consistência de tipos: `hashPassword/verifyPassword`, `createUser`, `requireRole`, `requestReset/resetPassword` usados de forma consistente entre tasks. ✔
