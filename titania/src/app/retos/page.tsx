"use client";

import { useState } from "react";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { CHALLENGE_TEMPLATES, type ChallengeFrequency } from "@/lib/data/challenges";
import { ScreenHeader } from "@/components/ScreenHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PillButton } from "@/components/ui/PillButton";
import { clsx } from "clsx";

const TABS: ChallengeFrequency[] = ["Diario", "Semanal", "Mensual"];

export default function RetosPage() {
  const ready = useRequireOnboarding();
  const [tab, setTab] = useState<ChallengeFrequency>("Diario");
  const challengeProgress = useTitanStore((s) => s.challengeProgress);
  const completedIds = useTitanStore((s) => s.completedChallengeIds);
  const incrementChallenge = useTitanStore((s) => s.incrementChallenge);

  if (!ready) return null;

  const filtered = CHALLENGE_TEMPLATES.filter((c) => c.frequency === tab);

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-14">
      <ScreenHeader title="Retos" subtitle="Cúmplelos para ganar XP extra" />

      <div className="flex gap-2 rounded-full border border-border bg-glass p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "flex-1 rounded-full py-2 text-[12.5px] font-bold transition-colors",
              tab === t ? "bg-accent text-black" : "text-text-dim"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map((c) => {
          const progress = challengeProgress[c.id] ?? 0;
          const completed = completedIds.includes(c.id);
          const step = c.metric === "steps" ? 1000 : c.metric === "kmRun" ? 2 : 1;
          return (
            <GlassCard key={c.id} className={clsx("p-4", completed && "border-accent/40")}>
              <div className="flex items-center gap-3">
                <span className="text-[20px]">{c.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold">{c.name}</div>
                  <div className="text-[11px] text-accent">+{c.xp} XP</div>
                </div>
                {completed ? (
                  <span className="text-[18px]">✅</span>
                ) : (
                  <PillButton
                    className="px-3.5 py-2 text-[11.5px]"
                    onClick={() => incrementChallenge(c.id, step)}
                  >
                    +
                  </PillButton>
                )}
              </div>
              <div className="mt-3">
                <ProgressBar progress={Math.min(1, progress / c.target)} />
                <div className="mt-1 text-[10.5px] text-text-dimmer">
                  {Math.min(progress, c.target)} / {c.target}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
