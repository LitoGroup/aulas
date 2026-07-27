import { streamText, convertToModelMessages, tool, stepCountIs, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { auth } from "@/server/auth/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildAssistantContext } from "@/server/assistant/context";
import { buildSystemPrompt } from "@/server/assistant/prompt";
import { consultarSite } from "@/server/assistant/site";

// Modelo econômico da OpenAI (usa a OPENAI_API_KEY do ambiente). Trocável.
const ASSISTANT_MODEL = process.env.ASSISTANT_MODEL ?? "gpt-4o-mini";
const LIMITE_DIA = 30; // mensagens por aluno por dia
const UM_DIA_MS = 86_400_000;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const permitido = await checkRateLimit(`assistant:${session.user.id}`, {
    max: LIMITE_DIA,
    windowMs: UM_DIA_MS,
  });
  if (!permitido) {
    return Response.json(
      { error: "Você atingiu o limite de mensagens de hoje. Tente novamente amanhã." },
      { status: 429 },
    );
  }

  // Sem a chave, o assistente fica indisponível (não deveria nem aparecer).
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Assistente indisponível no momento." }, { status: 503 });
  }

  const { messages, lessonId } = (await req.json()) as {
    messages: UIMessage[];
    lessonId?: string;
  };

  const contexto = await buildAssistantContext({ lessonId });

  const result = streamText({
    model: openai(ASSISTANT_MODEL),
    system: buildSystemPrompt(contexto),
    messages: await convertToModelMessages(messages),
    tools: {
      consultarPaginaDoCurso: tool({
        description:
          "Busca o conteúdo atual de uma página oficial da Lito Aviation Academy (site ou checkout) para responder com dados reais, como preço, duração, o que inclui e links de pagamento. Passe a URL exata da página do curso que está no contexto.",
        inputSchema: z.object({
          url: z.string().describe("URL oficial da página do curso (do contexto)"),
        }),
        execute: async ({ url }) => consultarSite(url),
      }),
    },
    // Permite: chamar a ferramenta, receber a página e então responder.
    stopWhen: stepCountIs(3),
  });

  // Erro genérico ao cliente (o widget mostra uma mensagem amigável). O detalhe
  // técnico fica nos logs da função, não é exposto ao aluno.
  return result.toUIMessageStreamResponse({
    onError: () => "Não foi possível gerar a resposta.",
  });
}
