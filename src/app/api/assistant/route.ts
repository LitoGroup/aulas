import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { auth } from "@/server/auth/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildAssistantContext } from "@/server/assistant/context";
import { buildSystemPrompt } from "@/server/assistant/prompt";

// Modelo econômico via Vercel AI Gateway (string provider/model, trocável).
const ASSISTANT_MODEL = process.env.ASSISTANT_MODEL ?? "openai/gpt-4o-mini";
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
  if (!process.env.AI_GATEWAY_API_KEY) {
    return Response.json({ error: "Assistente indisponível no momento." }, { status: 503 });
  }

  const { messages, lessonId } = (await req.json()) as {
    messages: UIMessage[];
    lessonId?: string;
  };

  const contexto = await buildAssistantContext({ lessonId });

  const result = streamText({
    model: ASSISTANT_MODEL,
    system: buildSystemPrompt(contexto),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
