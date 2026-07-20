"use client";

import { useEffect, useRef } from "react";

/**
 * Toca um vídeo com fundo verde removendo o verde em tempo real (canvas),
 * deixando o personagem com fundo transparente. Faz também supressão de
 * "spill" (a franja esverdeada na borda do personagem).
 * O vídeo precisa ser same-origin (/public) para o canvas ler os pixels.
 */
export function ChromaVideo({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const W = 320; // largura de processamento
    let raf = 0;

    const draw = () => {
      if (video.readyState >= 2 && video.videoWidth) {
        const H = Math.round((W * video.videoHeight) / video.videoWidth);
        if (canvas.width !== W || canvas.height !== H) {
          canvas.width = W;
          canvas.height = H;
        }
        ctx.drawImage(video, 0, 0, W, H);
        const frame = ctx.getImageData(0, 0, W, H);
        const d = frame.data;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          const other = Math.max(r, b);
          const greenness = g - other;

          if (greenness > 45) {
            // fundo: totalmente transparente
            d[i + 3] = 0;
          } else if (greenness > 12) {
            // borda: transparência suave + remove o excesso de verde
            d[i + 3] = Math.round(255 * (1 - (greenness - 12) / 33));
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
  }, []);

  return (
    <>
      <video ref={videoRef} src={src} muted loop playsInline autoPlay className="hidden" />
      <canvas ref={canvasRef} aria-hidden className={className} />
    </>
  );
}
