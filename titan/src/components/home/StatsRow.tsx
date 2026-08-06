const STATS = [
  { icon: "💧", value: "1.4L", label: "de 2.5L", pct: 56 },
  { icon: "👣", value: "6,204", label: "de 8,000", pct: 77 },
  { icon: "🌙", value: "7h 20m", label: "sueño", pct: 90 },
];

export function StatsRow() {
  return (
    <div className="flex gap-2.5">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex-1 rounded-[14px] border border-border bg-glass px-3.5 py-4"
        >
          <div className="text-[16px] opacity-85">{stat.icon}</div>
          <div className="tabular-nums mt-2 text-[19px] font-extrabold">
            {stat.value}
          </div>
          <div className="mt-0.5 text-[10.5px] font-semibold text-text-dim">
            {stat.label}
          </div>
          <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${stat.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
