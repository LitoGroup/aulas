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
        Video nao configurado
      </div>
    );
  }

  const src =
    provider === "VIMEO"
      ? `https://player.vimeo.com/video/${encodeURIComponent(videoRef)}`
      : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoRef)}`;

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
