"use client";

import { xpToLevel } from "@/lib/store";

export function XpBar({ xp, className }: { xp: number; className?: string }) {
  const { level, levelXp, nextLevelXp } = xpToLevel(xp);
  const pct = Math.round((levelXp / nextLevelXp) * 100);

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-text-dim">Nivel {level}</span>
        <span className="tabular-nums text-[11px] text-text-dimmer">{levelXp} / {nextLevelXp} XP</span>
      </div>
      <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
