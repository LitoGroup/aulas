"use client";

import { useActionState, useState } from "react";
import {
  createAssessmentAction,
  addQuestionAction,
  type ActionState,
} from "@/server/actions/assessment";
import { Input, Label, Button, Alert } from "@/components/ui";

export function NewAssessmentForm({ courseId }: { courseId: string }) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    createAssessmentAction,
    null,
  );
  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="courseId" value={courseId} />
      <div>
        <Label htmlFor="title">Titulo da prova</Label>
        <Input id="title" name="title" required minLength={3} />
      </div>
      <div>
        <Label htmlFor="passingScore">Nota de corte (%)</Label>
        <Input
          id="passingScore"
          name="passingScore"
          type="number"
          min={0}
          max={100}
          defaultValue={70}
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar prova"}
      </Button>
    </form>
  );
}

export function QuestionForm({
  courseId,
  assessmentId,
}: {
  courseId: string;
  assessmentId: string;
}) {
  const [state, action, pending] = useActionState<ActionState | null, FormData>(
    addQuestionAction,
    null,
  );
  const [type, setType] = useState("MULTIPLE_CHOICE");

  return (
    <form action={action} className="space-y-4 rounded-lg bg-slate-50 p-4">
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="assessmentId" value={assessmentId} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="statement">Enunciado</Label>
          <Input id="statement" name="statement" required minLength={3} />
        </div>
        <div>
          <Label htmlFor="qtype">Tipo</Label>
          <select
            id="qtype"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="MULTIPLE_CHOICE">Multipla escolha</option>
            <option value="TRUE_FALSE">Verdadeiro/Falso</option>
          </select>
        </div>
      </div>

      {type === "MULTIPLE_CHOICE" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Marque o circulo da alternativa correta. Deixe em branco as opcoes que nao usar.
          </p>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctIndex"
                value={i}
                defaultChecked={i === 0}
                aria-label={`Opcao ${i + 1} correta`}
              />
              <Input name="optionText" placeholder={`Opcao ${i + 1}`} />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <Label>Resposta correta</Label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="correctTF" value="V" defaultChecked /> Verdadeiro
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="correctTF" value="F" /> Falso
            </label>
          </div>
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-auto px-4">
        {pending ? "..." : "Adicionar questao"}
      </Button>
    </form>
  );
}
