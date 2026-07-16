export function ProgressRing({
  percent,
  size = 44,
  stroke = 4,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const done = percent >= 100;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={done ? "var(--accent)" : "var(--accent)"}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[color:var(--ink)]">
        {percent}%
      </span>
    </div>
  );
}
