/**
 * Textos do card de estudo conforme o estágio do aluno no curso.
 *
 * O rótulo do botão muda com o progresso: quem ainda não abriu nenhuma aula
 * precisa ser convidado a começar, não a "continuar".
 */
export type StudyStage = "nao-iniciado" | "em-andamento" | "concluido";

export function studyStage(percent: number): StudyStage {
  if (percent >= 100) return "concluido";
  if (percent > 0) return "em-andamento";
  return "nao-iniciado";
}

const CTA: Record<StudyStage, string> = {
  "nao-iniciado": "Iniciar os estudos",
  "em-andamento": "Continuar estudando",
  concluido: "Revisar o curso",
};

const EYEBROW: Record<StudyStage, string> = {
  "nao-iniciado": "Comece agora",
  "em-andamento": "Continue de onde parou",
  concluido: "Curso concluído",
};

/** Rótulo do botão principal do card de estudo. */
export function studyCta(percent: number): string {
  return CTA[studyStage(percent)];
}

/** Chapéu acima do título do card de estudo. */
export function studyEyebrow(percent: number): string {
  return EYEBROW[studyStage(percent)];
}
