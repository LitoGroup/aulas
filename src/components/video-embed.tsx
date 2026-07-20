import { montarUrlDoPlayer } from "@/lib/video-ref";

export function VideoEmbed({
  provider,
  videoRef,
  title,
}: {
  provider: string | null;
  videoRef: string | null;
  title: string;
}) {
  if (!provider || !videoRef) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-[color:var(--canvas)] text-sm text-[color:var(--muted)]">
        Vídeo não configurado
      </div>
    );
  }

  // Aceita tanto o ID quanto o link completo: as aulas cadastradas antes da
  // correção guardaram a URL inteira e precisam continuar tocando.
  const src = montarUrlDoPlayer(provider, videoRef);

  if (!src) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-1 rounded-lg bg-[color:var(--canvas)] px-6 text-center">
        <p className="text-sm font-semibold text-[color:var(--ink)]">
          Não foi possível carregar o vídeo
        </p>
        <p className="text-xs text-[color:var(--muted)]">
          O link cadastrado não é reconhecido. Avise o professor do curso.
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-black">
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
