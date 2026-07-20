import { z } from "zod";
import { normalizarVideoRef } from "@/lib/video-ref";

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
    requiresPrevious: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contentType === "VIDEO") {
      if (!data.videoProvider) {
        ctx.addIssue({ code: "custom", path: ["videoProvider"], message: "Selecione o provedor de video" });
      }
      if (!data.videoRef) {
        ctx.addIssue({ code: "custom", path: ["videoRef"], message: "Informe o link do vídeo" });
      } else if (
        (data.videoProvider === "YOUTUBE" || data.videoProvider === "VIMEO") &&
        !normalizarVideoRef(data.videoProvider, data.videoRef)
      ) {
        // Antes qualquer texto passava, e a aula era salva com um link que o
        // player não conseguia tocar.
        ctx.addIssue({
          code: "custom",
          path: ["videoRef"],
          message:
            data.videoProvider === "YOUTUBE"
              ? "Link do YouTube não reconhecido. Cole o endereço da página do vídeo."
              : "Link do Vimeo não reconhecido. Cole o endereço da página do vídeo.",
        });
      }
    }
    if (data.contentType === "TEXT" && !data.textBody) {
      ctx.addIssue({ code: "custom", path: ["textBody"], message: "Informe o conteudo de texto" });
    }
  })
  // Guarda só o identificador. O professor cola o link inteiro; o player
  // precisa do ID. Normalizar aqui cobre a criação e a edição de uma vez.
  .transform((data) => ({
    ...data,
    videoRef:
      data.contentType === "VIDEO"
        ? normalizarVideoRef(data.videoProvider, data.videoRef)
        : data.videoRef,
  }));

/** O que se entrega ao schema (videoRef pode vir como link completo). */
export type LessonInput = z.input<typeof lessonInputSchema>;
/** O que sai do parse, com o videoRef já reduzido ao identificador. */
export type LessonData = z.output<typeof lessonInputSchema>;
