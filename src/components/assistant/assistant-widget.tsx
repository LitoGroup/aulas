"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ESCOLA } from "@/lib/contact";

const SUGESTOES = [
  "Quais cursos vocês têm?",
  "Como funciona o pagamento?",
  "Como concluo uma aula?",
];

/**
 * Texto renderizável de uma mensagem (só as partes de texto), já higienizado:
 * sem markdown de negrito e sem travessão, como rede de segurança além do
 * system prompt.
 */
function textoDaMensagem(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("")
    .replace(/\*\*/g, "")
    .replace(/^\s*\*\s+/gm, "- ")
    .replace(/[—–]/g, "-");
}

/**
 * Assistente de suporte flutuante. Só é renderizado pelo layout logado quando
 * a chave do AI Gateway existe, então aqui já assumimos que está disponível.
 */
export function AssistantWidget() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/assistant" }));
  const { messages, sendMessage, status, error, regenerate } = useChat({ transport });

  const ocupado = status === "submitted" || status === "streaming";

  function enviar(valor: string) {
    const t = valor.trim();
    if (!t || ocupado) return;
    sendMessage({ text: t });
    setTexto("");
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        aria-label={aberto ? "Fechar assistente" : "Abrir assistente de suporte"}
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#0a1f3c] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5 lg:bottom-6 lg:right-6"
      >
        {aberto ? (
          <svg viewBox="0 0 20 20" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/brand/avatar-lito.png" alt="" aria-hidden className="h-12 w-auto object-contain" />
        )}
      </button>

      {/* Painel */}
      {aberto && (
        <div
          role="dialog"
          aria-label="Assistente de suporte"
          className="fixed inset-x-3 bottom-20 z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] sm:inset-x-auto sm:right-6 sm:w-96 lg:bottom-24"
        >
          <div className="flex items-center gap-2 border-b border-[color:var(--border)] bg-[#0a1f3c] px-4 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/avatar-lito.png" alt="" aria-hidden className="h-7 w-auto object-contain" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Assistente Lito</p>
              <p className="text-[11px] text-white/55">Tira dúvidas sobre a escola e os cursos</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-[color:var(--ink-soft)]">
                  Olá! Posso ajudar com dúvidas sobre os cursos e o uso da plataforma. Como posso ajudar?
                </p>
                <div className="flex flex-col gap-2">
                  {SUGESTOES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => enviar(s)}
                      className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-left text-sm text-[color:var(--ink-soft)] transition hover:bg-[color:var(--canvas)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <span
                    className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-[color:var(--navy-fill)] text-white"
                        : "bg-[color:var(--canvas)] text-[color:var(--ink)]"
                    }`}
                  >
                    {textoDaMensagem(m.parts)}
                  </span>
                </div>
              ))
            )}
            {ocupado && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <span className="inline-block rounded-2xl bg-[color:var(--canvas)] px-3.5 py-2 text-sm text-[color:var(--muted)]">
                  digitando...
                </span>
              </div>
            )}
            {error && (
              <div className="space-y-2">
                <span className="inline-block max-w-[90%] rounded-2xl bg-[color:var(--canvas)] px-3.5 py-2 text-sm text-[color:var(--ink-soft)]">
                  Estou com dificuldade para responder agora. Tente de novo ou fale com a equipe no
                  WhatsApp{" "}
                  <a href={ESCOLA.whatsappHref} className="font-semibold text-[color:var(--brand-ink)] underline">
                    {ESCOLA.telefone}
                  </a>
                  .
                </span>
                <button
                  type="button"
                  onClick={() => regenerate()}
                  className="block rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ink-soft)] transition hover:bg-[color:var(--canvas)]"
                >
                  Tentar de novo
                </button>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(texto);
            }}
            className="flex items-end gap-2 border-t border-[color:var(--border)] p-3"
          >
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar(texto);
                }
              }}
              rows={1}
              placeholder="Escreva sua dúvida..."
              className="max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--brand)]"
            />
            <button
              type="submit"
              disabled={ocupado || texto.trim().length === 0}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl brand-gradient text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M4 10h11M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
