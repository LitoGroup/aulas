"use client";

import { useEffect, useRef } from "react";

/**
 * Remove o fundo de um vídeo em tempo real (canvas). A cor do fundo é
 * detectada nos cantos do quadro e depois TRAVADA (evita um quadro isolado
 * estimar errado e vazar fundo). Como rede de segurança, verde forte é
 * sempre removido.
 *
 * `crop` recorta a região do quadro (0..1) para enquadrar só o personagem.
 * `endTrim` corta os últimos segundos do loop (pula quadros de encerramento,
 * como molduras/fades no fim do vídeo).
 */
export function ChromaVideo({
  src,
  className = "",
  crop = { x: 0.28, y: 0.02, w: 0.44, h: 0.82 },
  tolerance = 62,
  endTrim = 0.45,
}: {
  src: string;
  className?: string;
  crop?: { x: number; y: number; w: number; h: number };
  tolerance?: number;
  endTrim?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<[number, number, number] | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const W = 260;
    let raf = 0;
    let visible = true;

    // Só processa quando o banner está na tela e a aba está ativa (economiza
    // CPU/bateria: o chroma roda quadro a quadro).
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (visible) video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);

    const draw = () => {
      if (!visible || document.hidden) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // Reinicia antes do fim para pular o quadro final (moldura/fade).
      if (video.duration && video.currentTime > video.duration - endTrim) {
        video.currentTime = 0;
      }

      if (video.readyState >= 2 && vw) {
        const sx = Math.round(vw * crop.x);
        const sy = Math.round(vh * crop.y);
        const sw = Math.round(vw * crop.w);
        const sh = Math.round(vh * crop.h);
        const H = Math.round((W * sh) / sw);
        if (canvas.width !== W || canvas.height !== H) {
          canvas.width = W;
          canvas.height = H;
        }
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);

        const frame = ctx.getImageData(0, 0, W, H);
        const d = frame.data;

        // Amostra a cor do fundo uma única vez e trava.
        if (!bgRef.current) {
          const sample = (x: number, y: number) => {
            const i = (y * W + x) * 4;
            return [d[i], d[i + 1], d[i + 2]] as const;
          };
          const pts = [sample(2, 2), sample(W - 3, 2), sample(2, 6), sample(W - 3, 6)];
          const avg = [0, 1, 2].map(
            (c) => pts.reduce((s, p) => s + p[c], 0) / pts.length,
          ) as [number, number, number];
          // Só trava se os cantos forem coerentes entre si (fundo uniforme).
          const spread = Math.max(
            ...[0, 1, 2].map((c) => Math.max(...pts.map((p) => Math.abs(p[c] - avg[c])))),
          );
          if (spread < 30) bgRef.current = avg;
        }
        const bg = bgRef.current;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];

          // Rede de segurança: verde forte sempre sai.
          const greenness = g - Math.max(r, b);
          if (greenness > 40) {
            d[i + 3] = 0;
            continue;
          }

          if (bg) {
            const dist = Math.sqrt(
              (r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2,
            );
            if (dist < tolerance) {
              d[i + 3] = 0;
            } else if (dist < tolerance * 1.5) {
              d[i + 3] = Math.round(255 * ((dist - tolerance) / (tolerance * 0.5)));
              if (greenness > 8) d[i + 1] = Math.max(r, b); // remove spill
            }
          }
        }
        ctx.putImageData(frame, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };

    video.play().catch(() => {});
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [crop.x, crop.y, crop.w, crop.h, tolerance, endTrim]);

  return (
    <>
      <video ref={videoRef} src={src} muted loop playsInline autoPlay className="hidden" />
      <canvas ref={canvasRef} aria-hidden className={className} />
    </>
  );
}
