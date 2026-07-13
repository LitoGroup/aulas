# Sistema de Aulas Online (LMS) — Documento de Design

**Data:** 2026-07-13
**Objetivo:** MVP real de uma plataforma de e-learning (LMS) segura, escalável e responsiva.

## 1. Escopo

Plataforma web onde professores criam cursos (Curso > Módulo > Aula) com vídeo-aulas,
apostilas e avaliações; e alunos se matriculam, consomem conteúdo, acompanham progresso
e realizam provas com correção automática.

Fora do escopo do MVP: pagamentos, certificados, fórum, upload/streaming próprio de vídeo
(previsto como evolução via gancho no modelo).

## 2. Stack

| Camada | Escolha | Justificativa |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Fullstack num só projeto; tipagem reduz bugs |
| UI | Tailwind CSS + shadcn/ui | Responsivo mobile-first, acessível |
| Banco | PostgreSQL | Domínio 100% relacional |
| ORM | Prisma | Queries parametrizadas (imune a SQLi), migrations versionadas |
| Auth | Auth.js (NextAuth v5), sessão em cookie httpOnly | Menos exposto a XSS/CSRF que JWT em localStorage |
| Hash de senha | Argon2id (fallback bcrypt) | Padrão OWASP atual (senha é HASH, não criptografia) |
| E-mail | Resend / SMTP | Token de "esqueci a senha" |
| Uploads | S3-compatible (S3/R2) + signed URLs | Apostilas (PDF/DOCX/ZIP) fora do app server |
| Vídeo | Embed Vimeo (domínio restrito) / YouTube unlisted | Melhor custo/proteção para MVP |
| Rate limit | Upstash Redis | Brute-force em login/reset |
| Deploy | Vercel + Postgres gerenciado (Neon/Supabase) | Deploy simples |

**Correções conceituais assumidas:** "criptografia de senha" = hash Argon2 (irreversível);
"proteção total contra download de vídeo" é inviável no browser — mitigado com embed
Vimeo domínio-restrito.

## 3. Modelo de dados

Entidades (PK `uuid`, timestamps implícitos):

- **User**: name, email (unique), password_hash, role (ADMIN|TEACHER|STUDENT), email_verified_at
- **PasswordResetToken**: user_id, token_hash, expires_at, used_at
- **Course**: title, slug (unique), description, cover_url, owner_id→User, is_published
- **Module**: course_id→Course, title, order
- **Lesson**: module_id→Module, title, order, content_type (VIDEO|TEXT|FILE),
  video_provider (VIMEO|YOUTUBE|S3|NULL), video_ref, text_body, requires_previous
- **Attachment** (Arquivos_Anexos): lesson_id→Lesson, file_name, storage_key, mime_type, size_bytes
- **Enrollment**: user_id→User, course_id→Course, enrolled_at — UNIQUE(user_id, course_id)
- **LessonProgress** (Progresso_Aluno): enrollment_id→Enrollment, lesson_id→Lesson,
  status (NOT_STARTED|COMPLETED), completed_at — UNIQUE(enrollment_id, lesson_id)
- **Assessment** (Avaliacoes): course_id→Course, module_id→Module (nullable), title, passing_score (int %)
- **Question**: assessment_id→Assessment, statement, type (MULTIPLE_CHOICE|TRUE_FALSE), order
- **AnswerOption**: question_id→Question, text, is_correct
- **AssessmentAttempt**: assessment_id→Assessment, user_id→User, score (int %), passed, submitted_at
- **AttemptAnswer**: attempt_id→AssessmentAttempt, question_id→Question, selected_option_id→AnswerOption

**Relações:** Course 1─N Module 1─N Lesson 1─N Attachment; User N─N Course via Enrollment;
LessonProgress ancorado em Enrollment; Assessment 1─N Question 1─N AnswerOption.

**Regra crítica:** `AnswerOption.is_correct` nunca é enviado ao cliente antes do submit;
correção 100% server-side comparando respostas e calculando score vs passing_score.

## 4. Estrutura do projeto

```
prisma/            schema.prisma, seed.ts
src/app/           (auth) (student) (teacher) api/
src/server/        auth/ services/ db.ts
src/lib/           zod schemas, rate-limit, csrf, utils
src/components/     shadcn/ui + domínio (VideoPlayer, LessonList)
middleware.ts      proteção de rotas + headers de segurança
```

## 5. Segurança (OWASP)

- **SQLi**: Prisma (queries parametrizadas), zero SQL cru.
- **XSS**: React auto-escape; sanitização de markdown de apoio; CSP no middleware.
- **CSRF**: cookies SameSite=Lax + token CSRF em mutações; Auth.js embutido.
- **Brute-force**: rate-limit por IP+email em login e reset.
- **Autorização**: helper `requireRole` em toda rota privada; checagem de ownership
  (professor só edita cursos próprios; aluno só acessa cursos matriculados).
- **Headers**: HSTS, CSP, X-Content-Type-Options, Referrer-Policy no middleware.
- **Validação**: Zod em toda entrada de API/action.

## 6. Fluxos principais

1. **Auth**: registro → login (cookie httpOnly) → forgot/reset via token e-mail com expiração.
2. **Conteúdo (professor)**: CRUD Curso/Módulo/Aula, upload de apostila (signed URL), publicar.
3. **Matrícula/consumo (aluno)**: matricular, assistir aula, baixar apostila (signed URL).
4. **Progresso**: marcar aula concluída; `requires_previous` libera a próxima.
5. **Avaliação**: professor cria prova+questões; aluno responde; correção server-side;
   score vs passing_score → feedback aprovado/reprovado; registro em AssessmentAttempt.

## 7. Testes

TDD por serviço em `src/server/services/`: grading (cálculo de nota, corte, cola bloqueada),
progress (liberação por dependência), enrollment (unicidade), auth (hash, RBAC, expiração de token).

## 8. Passo a passo de implementação (macro)

1. Ambiente (create-next-app TS+Tailwind, Postgres, .env)
2. Banco (schema.prisma, migrate, seed admin+demo)
3. Auth & segurança (Auth.js, Argon2, RBAC, rate-limit, headers, Zod)
4. Conteúdo (CRUD, player embed, upload signed URL, matrícula)
5. Progresso (concluir aula + liberar próxima)
6. Avaliação (criar prova, responder, correção, feedback)
7. Polimento (responsividade, erros, seed demo, README)
