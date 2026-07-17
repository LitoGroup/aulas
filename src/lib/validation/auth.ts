import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120),
  email: z.string().trim().toLowerCase().email("E-mail invalido"),
  password: z
    .string()
    .min(8, "A senha deve ter ao menos 8 caracteres")
    .max(128),
});

// Formulario de cadastro: exige o aceite (LGPD Art. 8).
export const registerFormSchema = registerSchema.extend({
  consent: z.literal(true, {
    message: "Voce precisa aceitar a Politica de Privacidade e os Termos de Uso",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail invalido"),
  password: z.string().min(1, "Senha obrigatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;
