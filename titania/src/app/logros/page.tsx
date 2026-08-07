"use client";

import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { ScreenHeader } from "@/components/ScreenHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { clsx } from "clsx";

export default function LogrosPage() {
  const ready = useRequireOnboarding();
  const unlockedIds = useTitanStore((s) => s.unlockedAchievementIds);
  const workoutsCompletedTotal = useTitanStore((s) => s.workoutsCompletedTotal);
  const streakDays = useTitanStore((s) => s.streakDays);
  const mealsLoggedTotal = useTitanStore((s) => s.mealsLoggedTotal);
  const pullUpsTotal = useTitanStore((s) => s.pullUpsTotal);
  const kmRunTotal = useTitanStore((s) => s.kmRunTotal);
  const duelsWonTotal = useTitanStore((s) => s.duelsWonTotal);
  const xp = useTitanStore((s) => s.xp);
  const friendIds = useTitanStore((s) => s.friendIds);

  if (!ready) return null;

  const metrics: Record<string, number> = {
    workoutsCompleted: workoutsCompletedTotal,
    streakDays,
    mealsLogged: mealsLoggedTotal,
    pullUpsMax: pullUpsTotal,
    runsCompleted: Math.floor(kmRunTotal / 5),
    kmRun: kmRunTotal,
    duelsWon: duelsWonTotal,
    weeklyTop1: 0,
    totalPoints: xp,
    friendsAdded: friendIds.length,
  };

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-14">
      <ScreenHeader
        title="Logros"
        subtitle={`${unlockedIds.length} de ${ACHIEVEMENTS.length} insignias conseguidas`}
      />

      <div className="flex flex-col gap-2.5">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedIds.includes(a.id);
          const value = metrics[a.metric] ?? 0;
          const progress = Math.min(1, value / a.target);
          return (
            <GlassCard
              key={a.id}
              className={clsx("flex items-center gap-3.5 p-4", unlocked && "border-accent/40")}
            >
              <div
                className={clsx(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[20px]",
                  unlocked ? "bg-accent-dim" : "bg-white/5 grayscale opacity-50"
                )}
              >
                {a.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-bold">{a.name}</span>
                  <span className="text-[11px] font-semibold text-accent">+{a.xp} XP</span>
                </div>
                <p className="mt-0.5 text-[11.5px] leading-tight text-text-dim">{a.description}</p>
                {!unlocked && (
                  <div className="mt-2">
                    <ProgressBar progress={progress} />
                    <div className="mt-1 text-[10.5px] text-text-dimmer">
                      {Math.min(value, a.target)} / {a.target}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
