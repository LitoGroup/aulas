# Vídeo Próprio (upload + streaming protegido) — Implementation Plan

> REQUIRED SUB-SKILL: superpowers:executing-plans.

**Goal:** Professor faz upload do vídeo da aula direto para a plataforma; aluno assiste num player próprio com URL assinada temporária. Sem YouTube/Vimeo.

**Architecture:** Bucket privado `school-videos` no Supabase Storage. Upload direto navegador→storage com signed upload URL (XHR com progresso). Aula grava `videoProvider=S3` + `videoRef=storageKey`. No player, o servidor gera signed URL de reprodução (2h) apenas para matriculado/dono; `<video>` HTML5 com range/seek.

## Global Constraints
- Vídeo aceito: mp4/webm, até 1 GB (limite do bucket).
- Playback URL só é gerada server-side dentro do guard existente do viewer.
- Sem DRM (fora de escopo); proteção = bucket privado + URL expirável + autorização.

---

### Task 1: Bucket + funções de storage de vídeo
**Files:** `src/server/storage.ts`
- `ensureVideosBucket()` (privado, 1 GB, mime video/*), `createVideoUploadUrl(key)`, `createVideoPlaybackUrl(key, expiresIn=7200)` (inline, sem download).
- Criar o bucket via script. Verificar upload+playback com range (206) via script e2e.
- Commit.

### Task 2: Action de upload + validação — 
**Files:** `src/server/actions/video.ts`
- `getVideoUploadUrlAction({moduleId|lessonId, fileName, mimeType, sizeBytes})`: requireRole TEACHER/ADMIN + ownership (via módulo), valida mime (`video/mp4|video/webm`) e tamanho ≤ 1 GB, gera key `videos/{moduleId}/{uuid}-{nome}` e devolve signedUrl+key.
- Commit.

### Task 3: UI do professor — upload no form de aula
**Files:** `src/app/(app)/manage/course-forms.tsx` (LessonForm), `src/app/(app)/manage/video-upload.ts(x)` se necessário.
- No tipo Vídeo, provedor ganha opção **“Upload (plataforma)”**: input de arquivo + barra de progresso (XHR). Ao concluir o upload, o form envia `videoProvider=S3`, `videoRef=key`.
- Mesmo fluxo no editar aula (LessonControls).
- Commit.

### Task 4: Player próprio
**Files:** `src/components/video-embed.tsx` (ou novo `video-player.tsx`), `src/app/(app)/learn/[lessonId]/page.tsx`
- Se `videoProvider===S3`: page gera `createVideoPlaybackUrl(videoRef)` e renderiza `<video controls controlsList="nodownload" preload="metadata">`.
- Commit + push.

## Self-Review
- Autorização: upload só dono; playback só matriculado/dono (guard já existente no viewer). ✔
- Range/seek verificado com requisição Range (espera 206). ✔
