import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { auth } from "@/server/auth/config";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildAssistantContext } from "@/server/assistant/context";
import { buildSystemPrompt } from "@/server/assistant/prompt";

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
  });

  // Por padrão o AI SDK mascara o erro como "An error occurred". Enquanto
  // ligamos o assistente, devolvemos a mensagem real para diagnosticar
  // (chave, crédito, modelo). Depois isto pode voltar a ser genérico.
  return result.toUIMessageStreamResponse({
    onError: (error) =>
      error instanceof Error ? error.message : "Erro desconhecido no assistente.",
  });
}
