import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120),
  email: z.string().trim().toLowerCase().email("E-mail invalido"),
  password: z
    .string()
    .min(8, "A senha deve ter ao menos 8 caracteres")
    .max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail invalido"),
  password: z.string().min(1, "Senha obrigatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;
