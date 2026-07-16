"use client";

import { useActionState, useState } from "react";
import {
  updateModuleAction,
  updateLessonAction,
  moveModuleAction,
  moveLessonAction,
  deleteModuleAction,
  deleteLessonAction,
  deleteQuestionAction,
  type ActionState,
} from "@/server/actions/content-edit";
import { Input, Label, Button, Select, Textarea, Alert } from "@/components/ui";
import { VideoUploadField } from "./video-upload-field";

const iconBtn =
  "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[color:var(--border)] text-[color:var(--ink-soft)] transition hover:bg-[color:var(--canvas)] disabled:opacity-40";

function MoveButtons({
  courseId,
  field,
  id,
  action,
}: {
  courseId: string;
  field: "moduleId" | "lessonId";
  id: string;
  action: (fd: FormData) => Promise<void>;
}) {
  return (
    <div className="flex gap-1">
      {(["up", "down"] as const).map((dir) => (
        <form key={dir} action={action}>
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name={field} value={id} />
          <input type="hidden" name="dir" value={dir} />
          <button type="submit" className={iconBtn} title={dir === "up" ? "Mover para cima" : "Mover para baixo"}>
            {dir === "up" ? "↑" : "↓"}
          </button>
        </form>
      ))}
    </div>
  );
}

function DeleteButton({
  courseId,
  extraName,
  extraValue,
  field,
  id,
  action,
  label,
}: {
  courseId: string;
  extraName?: string;
  extraValue?: string;
  field: string;
  id: string;
  action: (fd: FormData) => Promise<void>;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="courseId" value={courseId} />
      {extraName && <input type="hidden" name={extraName} value={extraValue} />}
      <input type="hidden" name={field} value={id} />
      <button
        type="submit"
        className="inline-flex h-7 items-center rounded-lg border border-[color:var(--border)] px-2 text-xs font-medium text-[color:var(--danger)] transition hover:bg-[color:var(--danger)]/8"
        title="Excluir"
      >
        Excluir
      </button>
    </form>
  );
}

export function ModuleControls({
  courseId,
  moduleId,
  title,
}: {
  courseId: string;
  moduleId: string;
  title: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    updateModuleAction,
    null,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {editing ? (
        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="moduleId" value={moduleId} />
          <Input name="title" defaultValue={title} className="h-8 py-1" />
          <Button type="submit" disabled={pending} className="h-8 w-auto px-3 py-1 text-xs">
            Salvar
          </Button>
          <button type="button" onClick={() => setEditing(false)} className={iconBtn}>
            ✕
          </button>
        </form>
      ) : (
        <>
          <MoveButtons courseId={courseId} field="moduleId" id={moduleId} action={moveModuleAction} />
          <button onClick={() => setEditing(true)} className="text-xs font-medium text-[color:var(--ink-soft)] hover:underline">
            Renomear
          </button>
          <DeleteButton
            courseId={courseId}
            field="moduleId"
            id={moduleId}
            action={deleteModuleAction}
            label="o módulo e suas aulas"
          />
        </>
      )}
      {state?.error && <Alert kind="error">{state.error}</Alert>}
    </div>
  );
}

interface LessonData {
  id: string;
  moduleId: string;
  title: string;
  contentType: string;
  videoProvider: string | null;
  videoRef: string | null;
  textBody: string | null;
  requiresPrevious: boolean;
}

export function LessonControls({
  courseId,
  lesson,
}: {
  courseId: string;
  lesson: LessonData;
}) {
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState(lesson.contentType);
  const [provider, setProvider] = useState(lesson.videoProvider ?? "YOUTUBE");
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    updateLessonAction,
    null,
  );

  return (
    <div className="mt-1">
      <div className="flex flex-wrap items-center gap-2">
        <MoveButtons courseId={courseId} field="lessonId" id={lesson.id} action={moveLessonAction} />
        <button onClick={() => setEditing((v) => !v)} className="text-xs font-medium text-[color:var(--ink-soft)] hover:underline">
          {editing ? "Fechar" : "Editar"}
        </button>
        <DeleteButton
          courseId={courseId}
          field="lessonId"
          id={lesson.id}
          action={deleteLessonAction}
          label="a aula"
        />
      </div>

      {editing && (
        <form action={action} className="mt-3 space-y-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--canvas)] p-3">
          {state?.error && <Alert kind="error">{state.error}</Alert>}
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="lessonId" value={lesson.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Título</Label>
              <Input name="title" defaultValue={lesson.title} required />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select name="contentType" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="VIDEO">Vídeo</option>
                <option value="TEXT">Texto de apoio</option>
                <option value="FILE">Apostila / PDF</option>
              </Select>
            </div>
          </div>
          {type === "VIDEO" && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Origem do vídeo</Label>
                  <Select
                    name="videoProvider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                  >
                    <option value="YOUTUBE">YouTube</option>
                    <option value="VIMEO">Vimeo</option>
                    <option value="S3">Upload (plataforma, até 50 MB)</option>
                  </Select>
                </div>
                {provider !== "S3" && (
                  <div>
                    <Label>ID do vídeo</Label>
                    <Input name="videoRef" defaultValue={lesson.videoRef ?? ""} />
                  </div>
                )}
              </div>
              {provider === "S3" && (
                <VideoUploadField
                  moduleId={lesson.moduleId}
                  defaultRef={lesson.videoProvider === "S3" ? lesson.videoRef : null}
                />
              )}
            </div>
          )}
          {type === "TEXT" && (
            <div>
              <Label>Conteúdo</Label>
              <Textarea name="textBody" rows={3} defaultValue={lesson.textBody ?? ""} />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)]">
            <input type="checkbox" name="requiresPrevious" defaultChecked={lesson.requiresPrevious} />
            Exige concluir a aula anterior
          </label>
          <Button type="submit" disabled={pending} className="w-auto px-4">
            {pending ? "Salvando..." : "Salvar aula"}
          </Button>
        </form>
      )}
    </div>
  );
}

export function DeleteQuestionButton({
  courseId,
  assessmentId,
  questionId,
}: {
  courseId: string;
  assessmentId: string;
  questionId: string;
}) {
  return (
    <DeleteButton
      courseId={courseId}
      extraName="assessmentId"
      extraValue={assessmentId}
      field="questionId"
      id={questionId}
      action={deleteQuestionAction}
      label="a questão"
    />
  );
}
