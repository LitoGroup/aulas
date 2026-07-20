"use client";

import { useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

/** Safari do iPhone/iPad: não expõe API de instalação, só o menu Compartilhar. */
export function ehIosSafari(userAgent: string, maxTouchPoints: number): boolean {
  const iPhoneOuIPad =
    /iPad|iPhone|iPod/.test(userAgent) ||
    // iPad recente se identifica como Macintosh; o toque é o que o denuncia.
    (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
  if (!iPhoneOuIPad) return false;
  // Chrome, Firefox e Edge no iOS usam o mesmo motor, mas não instalam PWA.
  return !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
}

/** Já está rodando como app instalado (sem barra de endereço). */
function ehAppInstalado(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari do iOS usa esta propriedade própria em vez do display-mode.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function assinarInstalacao(aoMudar: () => void) {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", aoMudar);
  window.addEventListener("appinstalled", aoMudar);
  window.addEventListener("pwa-installable", aoMudar);
  return () => {
    mq.removeEventListener("change", aoMudar);
    window.removeEventListener("appinstalled", aoMudar);
    window.removeEventListener("pwa-installable", aoMudar);
  };
}

const semAssinatura = () => () => {};

export function InstallAppButton() {
  // useSyncExternalStore em vez de useEffect + setState: estes valores vêm do
  // navegador, não do React, e assim não há render extra nem risco de ler
  // antes do evento chegar.
  const instalado = useSyncExternalStore(assinarInstalacao, ehAppInstalado, () => false);
  const podeInstalar = useSyncExternalStore(
    assinarInstalacao,
    () => Boolean(window.__pwaPrompt),
    () => false,
  );
  const ios = useSyncExternalStore(
    semAssinatura,
    () => ehIosSafari(navigator.userAgent, navigator.maxTouchPoints),
    () => false,
  );

  const [passos, setPassos] = useState(false);
  const [recusado, setRecusado] = useState(false);

  async function instalar() {
    const evento = window.__pwaPrompt;
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    window.__pwaPrompt = null;
    if (outcome === "dismissed") setRecusado(true);
    window.dispatchEvent(new Event("pwa-installable"));
  }

  // Já instalado, ou navegador sem suporte (Firefox no desktop, por exemplo):
  // não faz sentido oferecer.
  if (instalado || (!podeInstalar && !ios)) return null;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => (ios ? setPassos(true) : instalar())}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 px-4 py-2.5 text-sm font-semibold text-[#9be36f] transition hover:bg-[color:var(--accent)]/15"
      >
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="6" y="2" width="8" height="16" rx="2" />
          <path d="M9 15.5h2" />
        </svg>
        Instalar no celular
      </button>
      <p className="mt-2 text-center text-[11px] text-white/35">
        {recusado
          ? "Sem problema. O botão continua aqui quando quiser."
          : "Acesse as aulas direto da tela inicial, sem abrir o navegador."}
      </p>

      {passos && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[13px] leading-relaxed text-white/70">
          <p className="mb-2 font-semibold text-white/90">Para instalar no iPhone:</p>
          <ol className="list-inside list-decimal space-y-1">
            <li>
              Toque em <span className="font-semibold text-white/90">Compartilhar</span> na barra do
              Safari
            </li>
            <li>
              Escolha{" "}
              <span className="font-semibold text-white/90">Adicionar à Tela de Início</span>
            </li>
            <li>
              Confirme em <span className="font-semibold text-white/90">Adicionar</span>
            </li>
          </ol>
          <button
            type="button"
            onClick={() => setPassos(false)}
            className="mt-3 text-xs font-semibold text-white/50 hover:text-white/80"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
