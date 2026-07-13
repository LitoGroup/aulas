// Capa de curso sóbria: tom escuro neutro com leve variação por curso.
const SHADES = ["#1b1b1f", "#202028", "#1e2226", "#232026", "#1c2024", "#26232a"];

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
  className = "",
  size = "card",
}: {
  title: string;
  seed?: string;
  className?: string;
  size?: "card" | "thumb";
}) {
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
