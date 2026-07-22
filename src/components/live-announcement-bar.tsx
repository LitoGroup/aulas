"use client";

import { useEffect, useState } from "react";
import { ChromaVideo } from "@/components/chroma-video";

/* ------------------------------------------------------------------ *
 * Dados da live. Para trocar data, hora ou texto, edite só isto aqui. *
 * ------------------------------------------------------------------ */
// 17 de agosto de 2026, 20h (horário de Brasília, UTC-3).
const EVENTO = new Date("2026-08-17T20:00:00-03:00");
const DATA_TEXTO = "17 de agosto, 20h";
const CHAMADA = "Live exclusiva é dia";

export interface Restante {
  dias: number;
  horas: number;
  min: number;
  seg: number;
}

/**
 * Tempo até a live, decomposto. Devolve null quando o evento já passou — é o
 * sinal para a barra se recolher sozinha depois do dia 17.
 */
export function calcularRestante(agora: number, evento: number = EVENTO.getTime()): Restante | null {
  const ms = evento - agora;
  if (ms <= 0) return null;
  const seg = Math.floor(ms / 1000);
  return {
    dias: Math.floor(seg / 86400),
    horas: Math.floor((seg % 86400) / 3600),
    min: Math.floor((seg % 3600) / 60),
    seg: seg % 60,
  };
}

function Bloco({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <span className="flex flex-col items-center leading-none">
      <span className="font-display text-base font-bold tabular-nums text-white sm:text-lg">
        {String(valor).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/45">
        {rotulo}
      </span>
    </span>
  );
}

export function LiveAnnouncementBar() {
  // Fixa: não há como dispensar. Só se recolhe sozinha depois do dia 17.
  // A contagem inicia null para casar SSR e cliente (evita descompasso).
  const [restante, setRestante] = useState<Restante | null>(null);

  useEffect(() => {
    const tick = () => setRestante(calcularRestante(Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!restante) return null;

  return (
    <aside
      className="group relative isolate overflow-hidden border-b border-white/10 bg-[#0a1f3c]"
      aria-label={`Live ${DATA_TEXTO}`}
    >
      {/* atmosfera: gradiente da marca + facho verde que respira */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0a1f3c] via-[#0d2b52] to-[#0a1f3c]"
      />
      <div
        aria-hidden
        className="live-sheen absolute inset-y-0 -z-10 w-1/3 bg-gradient-to-r from-transparent via-[color:var(--accent)]/10 to-transparent"
      />

      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:gap-5 sm:px-6">
        {/* avatar animado (some no celular estreito para não apertar a barra) */}
        <ChromaVideo
          src="/brand/promo-avatar.mp4"
          className="avatar-pop hidden h-14 w-auto shrink-0 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)] sm:block"
        />

        {/* selo AO VIVO */}
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e0294a] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
          Live
        </span>

        {/* chamada + data */}
        <p className="min-w-0 flex-1 text-sm text-white/85">
          <span className="hidden sm:inline">{CHAMADA} </span>
          <strong className="font-semibold text-white">{DATA_TEXTO}</strong>
          <span className="hidden text-white/55 md:inline"> · não perca.</span>
        </p>

        {/* contagem regressiva */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-white/45 sm:inline">
            Faltam
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Bloco valor={restante.dias} rotulo="dias" />
            <span className="text-white/25">:</span>
            <Bloco valor={restante.horas} rotulo="hrs" />
            <span className="text-white/25">:</span>
            <Bloco valor={restante.min} rotulo="min" />
            <span className="hidden text-white/25 sm:inline">:</span>
            <span className="hidden sm:block">
              <Bloco valor={restante.seg} rotulo="seg" />
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
