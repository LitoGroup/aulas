"use client";

import { useEffect, useRef } from "react";

/**
 * Remove fundo verde (chroma key) em tempo real via canvas, deixando o
 * personagem com fundo transparente. Inclui supressão de spill (a franja
 * esverdeada na borda) e borda suave.
 * O vídeo precisa ser same-origin (/public) para o canvas ler os pixels.
 */
export function ChromaVideo({
  src,
  className = "",
  // recorte do quadro (0..1) para enquadrar só o personagem
  crop = { x: 0.33, y: 0.02, w: 0.34, h: 0.95 },
}: {
  src: string;
  className?: string;
  crop?: { x: number; y: number; w: number; h: number };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const W = 280;
    let raf = 0;

    const draw = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
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
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const other = Math.max(r, b);
          const greenness = g - other;

          if (greenness > 40) {
            d[i + 3] = 0; // fundo verde
          } else if (greenness > 8) {
            // borda: suaviza e remove o excesso de verde (spill)
            d[i + 3] = Math.round(255 * (1 - (greenness - 8) / 32));
            d[i + 1] = other;
          }
        }
        ctx.putImageData(frame, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };

    video.play().catch(() => {});
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [crop.x, crop.y, crop.w, crop.h]);

  return (
    <>
      <video ref={videoRef} src={src} muted loop playsInline autoPlay className="hidden" />
      <canvas ref={canvasRef} aria-hidden className={className} />
    </>
  );
}
