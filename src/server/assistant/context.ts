import { prisma } from "../db";
import { KNOWLEDGE_BASE } from "./knowledge";

const MAX_TEXTO_AULA = 4000; // limita custo/tamanho do contexto

/**
 * Monta o contexto que o assistente recebe: base curada + dados reais da
 * plataforma (cursos publicados e, se houver, o conteúdo da aula aberta).
 * Só entra conteúdo de curso publicado.
 */
export async function buildAssistantContext(opts: { lessonId?: string } = {}): Promise<string> {
  const partes: string[] = [KNOWLEDGE_BASE];

  const cursos = await prisma.course.findMany({
    where: { isPublished: true },
    select: { title: true, description: true },
    orderBy: { createdAt: "desc" },
  });
  if (cursos.length > 0) {
    const lista = cursos
      .map((c) => `- ${c.title}${c.description ? `: ${c.description}` : ""}`)
      .join("\n");
    partes.push(`CURSOS PUBLICADOS NA PLATAFORMA\n${lista}`);
  }

  if (opts.lessonId) {
    const aula = await prisma.lesson.findUnique({
      where: { id: opts.lessonId },
      select: {
        title: true,
        contentType: true,
        textBody: true,
        module: { select: { course: { select: { title: true, isPublished: true } } } },
      },
    });
    // Só usa a aula se for de curso publicado.
    if (aula && aula.module.course.isPublished) {
      const corpo =
        aula.contentType === "TEXT" && aula.textBody
          ? `\n${aula.textBody.slice(0, MAX_TEXTO_AULA)}`
          : "";
      partes.push(
        `AULA ATUAL (curso "${aula.module.course.title}")\nTítulo: ${aula.title}${corpo}`,
      );
    }
  }

  return partes.join("\n\n");
}
