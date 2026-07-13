// Capa de curso gerada por gradiente deterministico (sem precisar de upload).
const GRADIENTS = [
  ["#4f3ff0", "#6d28d9"],
  ["#0ea5e9", "#4f3ff0"],
  ["#f5a623", "#e5484d"],
  ["#10b981", "#0ea5e9"],
  ["#8b5cf6", "#ec4899"],
  ["#f59e0b", "#6d28d9"],
];

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
  const [from, to] = GRADIENTS[hash(seed ?? title) % GRADIENTS.length];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {/* textura sutil */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,.5) 0, transparent 40%)",
        }}
      />
      <span
        className={`relative font-display font-bold text-white/95 ${
          size === "card" ? "text-3xl" : "text-lg"
        }`}
      >
        {initials(title)}
      </span>
    </div>
  );
}
