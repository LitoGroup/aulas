import { z } from "zod";

export const assessmentInputSchema = z.object({
  title: z.string().trim().min(3, "Titulo muito curto").max(160),
  passingScore: z.coerce.number().int().min(0).max(100).default(70),
  moduleId: z.string().uuid().optional().nullable(),
});
export type AssessmentInput = z.infer<typeof assessmentInputSchema>;

export const optionInputSchema = z.object({
  text: z.string().trim().min(1, "Opcao vazia").max(500),
  isCorrect: z.boolean(),
});

export const questionInputSchema = z
  .object({
    statement: z.string().trim().min(3, "Enunciado muito curto").max(1000),
    type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE"]),
    options: z.array(optionInputSchema).min(2, "Minimo de 2 opcoes"),
  })
  .superRefine((data, ctx) => {
    const corretas = data.options.filter((o) => o.isCorrect).length;
    if (corretas !== 1) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "Deve haver exatamente 1 opcao correta" });
    }
    if (data.type === "TRUE_FALSE" && data.options.length !== 2) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "V/F deve ter exatamente 2 opcoes" });
    }
  });
export type QuestionInput = z.infer<typeof questionInputSchema>;
