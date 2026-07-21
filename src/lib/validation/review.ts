import { z } from "zod";

export const NOTA_MINIMA = 1;
export const NOTA_MAXIMA = 5;
export const COMENTARIO_MAXIMO = 2000;

export const reviewInputSchema = z.object({
  rating: z.coerce
    .number()
    .int("Escolha uma nota de 1 a 5")
    .min(NOTA_MINIMA, "Escolha uma nota de 1 a 5")
    .max(NOTA_MAXIMA, "Escolha uma nota de 1 a 5"),
  comment: z
    .string()
    .trim()
    .max(COMENTARIO_MAXIMO, `O comentário passa de ${COMENTARIO_MAXIMO} caracteres`)
    // Campo em branco é ausência de comentário, não string vazia.
    .transform((t) => (t.length === 0 ? null : t))
    .nullable()
    .optional(),
});

export type ReviewInput = z.input<typeof reviewInputSchema>;
export type ReviewData = z.output<typeof reviewInputSchema>;
