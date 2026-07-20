"use client";

import { useEffect, useRef } from "react";

/**
 * Remove o fundo de um vídeo em tempo real (canvas), detectando a cor do
 * fundo automaticamente pelos cantos superiores do quadro. Funciona para
 * fundos razoavelmente uniformes (verde, azul, branco).
 *
 * `crop` recorta a região do quadro que interessa (0..1), útil para excluir
 * chão e objetos de cena, deixando só o personagem.
 */
export function ChromaVideo({
  src,
  className = "",
  crop = { x: 0.28, y: 0.02, w: 0.44, h: 0.82 },
  tolerance = 62,
}: {
  src: string;
  className?: string;
  crop?: { x: number; y: number; w: number; h: number };
  tolerance?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const W = 260;
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

        // Cor do fundo: média dos cantos superiores (área sem personagem).
        const sample = (x: number, y: number) => {
          const i = (y * W + x) * 4;
          return [d[i], d[i + 1], d[i + 2]] as const;
        };
        const pts = [sample(2, 2), sample(W - 3, 2), sample(2, 6), sample(W - 3, 6)];
        const bg = [0, 1, 2].map(
          (c) => pts.reduce((s, p) => s + p[c], 0) / pts.length,
        );

        for (let i = 0; i < d.length; i += 4) {
          const dist = Math.sqrt(
            (d[i] - bg[0]) ** 2 + (d[i + 1] - bg[1]) ** 2 + (d[i + 2] - bg[2]) ** 2,
          );
          if (dist < tolerance) {
            d[i + 3] = 0; // fundo
          } else if (dist < tolerance * 1.5) {
            // borda: transparência suave
            d[i + 3] = Math.round(255 * ((dist - tolerance) / (tolerance * 0.5)));
          }
        }
        ctx.putImageData(frame, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };

    video.play().catch(() => {});
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [crop.x, crop.y, crop.w, crop.h, tolerance]);

  return (
    <>
      <video ref={videoRef} src={src} muted loop playsInline autoPlay className="hidden" />
      <canvas ref={canvasRef} aria-hidden className={className} />
    </>
  );
}
