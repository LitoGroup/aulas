// Capa de curso: tons navy da identidade, com leve variação por curso.
const SHADES = ["#0e2440", "#102a4c", "#0d2848", "#123054", "#0f2b4d", "#14335a"];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function CourseCover({
  title,
  seed,
  src,
  className = "",
  size = "card",
}: {
  title: string;
  seed?: string;
  src?: string | null;
  className?: string;
  size?: "card" | "thumb";
}) {
  // Thumb enviada pelo professor tem prioridade sobre a capa gerada.
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }

  const shade = SHADES[hash(seed ?? title) % SHADES.length];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: shade }}
    >
      {/* grade sutil + brilho discreto, tudo em tons neutros */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 85% 15%, rgba(255,255,255,0.10), transparent 55%)",
        }}
      />
      <span
        className={`relative font-display font-semibold tracking-tight text-white/85 ${
          size === "card" ? "text-2xl" : "text-base"
        }`}
      >
        {initials(title)}
      </span>
    </div>
  );
}
