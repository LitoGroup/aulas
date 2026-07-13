import { z } from "zod";

export const moduleInputSchema = z.object({
  title: z.string().trim().min(2, "Titulo muito curto").max(160),
});
export type ModuleInput = z.infer<typeof moduleInputSchema>;

export const lessonInputSchema = z
  .object({
    title: z.string().trim().min(2, "Titulo muito curto").max(160),
    contentType: z.enum(["VIDEO", "TEXT", "FILE"]),
    videoProvider: z.enum(["VIMEO", "YOUTUBE", "S3"]).optional().nullable(),
    videoRef: z.string().trim().max(500).optional().nullable(),
    textBody: z.string().trim().max(20000).optional().nullable(),
    requiresPrevious: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.contentType === "VIDEO") {
      if (!data.videoProvider) {
        ctx.addIssue({ code: "custom", path: ["videoProvider"], message: "Selecione o provedor de video" });
      }
      if (!data.videoRef) {
        ctx.addIssue({ code: "custom", path: ["videoRef"], message: "Informe o ID/URL do video" });
      }
    }
    if (data.contentType === "TEXT" && !data.textBody) {
      ctx.addIssue({ code: "custom", path: ["textBody"], message: "Informe o conteudo de texto" });
    }
  });

export type LessonInput = z.infer<typeof lessonInputSchema>;
