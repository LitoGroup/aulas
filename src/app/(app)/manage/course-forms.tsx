"use client";

import { useActionState } from "react";
import {
  createCourseAction,
  updateCourseAction,
  createModuleAction,
  createLessonAction,
  type ActionState,
} from "@/server/actions/course";
import { Input, Label, Button, Alert, Select, Textarea } from "@/components/ui";
import { useState } from "react";

export function NewCourseForm() {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    createCourseAction,
    null,
  );
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <div>
        <Label htmlFor="title">Titulo do curso</Label>
        <Input id="title" name="title" required minLength={3} />
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar curso"}
      </Button>
    </form>
  );
}

export function CourseEditForm({
  course,
}: {
  course: { id: string; title: string; description: string | null; isPublished: boolean };
}) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    updateCourseAction,
    null,
  );
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="id" value={course.id} />
      <div>
        <Label htmlFor="title">Titulo</Label>
        <Input id="title" name="title" defaultValue={course.title} required />
      </div>
      <div>
        <Label htmlFor="description">Descricao</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={course.description ?? ""}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="isPublished" defaultChecked={course.isPublished} />
        Publicado (visivel para alunos)
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}

export function ModuleForm({ courseId }: { courseId: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    createModuleAction,
    null,
  );
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="courseId" value={courseId} />
      <div className="flex-1">
        <Label htmlFor="mtitle">Novo modulo</Label>
        <Input id="mtitle" name="title" placeholder="Titulo do modulo" required />
      </div>
      <Button type="submit" disabled={pending} className="w-auto px-4">
        {pending ? "..." : "Adicionar"}
      </Button>
    </form>
  );
}

export function LessonForm({ courseId, moduleId }: { courseId: string; moduleId: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    createLessonAction,
    null,
  );
  const [type, setType] = useState("VIDEO");
  return (
    <form action={action} className="space-y-3 rounded-lg bg-slate-50 p-3">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`lt-${moduleId}`}>Titulo da aula</Label>
          <Input id={`lt-${moduleId}`} name="title" required />
        </div>
        <div>
          <Label htmlFor={`ct-${moduleId}`}>Tipo</Label>
          <Select
            id={`ct-${moduleId}`}
            name="contentType"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="VIDEO">Vídeo</option>
            <option value="TEXT">Texto de apoio</option>
            <option value="FILE">Apostila / PDF</option>
          </Select>
        </div>
      </div>

      {type === "VIDEO" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`vp-${moduleId}`}>Provedor</Label>
            <Select id={`vp-${moduleId}`} name="videoProvider">
              <option value="YOUTUBE">YouTube</option>
              <option value="VIMEO">Vimeo</option>
            </Select>
          </div>
          <div>
            <Label htmlFor={`vr-${moduleId}`}>ID do vídeo</Label>
            <Input id={`vr-${moduleId}`} name="videoRef" placeholder="ex: dQw4w9WgXcQ" />
          </div>
        </div>
      )}

      {type === "TEXT" && (
        <div>
          <Label htmlFor={`tb-${moduleId}`}>Conteúdo</Label>
          <Textarea id={`tb-${moduleId}`} name="textBody" rows={3} />
        </div>
      )}

      {type === "FILE" && (
        <p className="rounded-xl border border-[color:var(--border)] bg-[color:var(--canvas)] px-3.5 py-2.5 text-xs text-[color:var(--muted)]">
          Crie a aula e depois use <strong className="text-[color:var(--ink-soft)]">“+ Anexar apostila”</strong> abaixo
          dela para enviar o PDF, DOCX ou ZIP. O aluno verá o arquivo nesta aula.
        </p>
      )}

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" name="requiresPrevious" />
        Exige concluir a aula anterior
      </label>

      <Button type="submit" disabled={pending} className="w-auto px-4">
        {pending ? "..." : "Adicionar aula"}
      </Button>
    </form>
  );
}
