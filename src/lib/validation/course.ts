import { z } from "zod";

export const courseInputSchema = z.object({
  title: z.string().trim().min(3, "Titulo muito curto").max(160),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CourseInput = z.infer<typeof courseInputSchema>;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}
