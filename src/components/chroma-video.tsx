"use client";

import { useEffect, useRef } from "react";

/**
 * Reproduz um vídeo com fundo verde (chroma key) removendo o verde em tempo
 * real via canvas, deixando o fundo transparente. O vídeo precisa ser
 * same-origin (servido de /public) para o canvas conseguir ler os pixels.
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

    const W = 300; // largura de processamento (leve)
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
          // Pixel predominantemente verde -> transparente.
          if (g > 90 && g > r * 1.3 && g > b * 1.3) {
            d[i + 3] = 0;
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
