"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTitanStore } from "@/lib/store";
import { TrainingCard } from "@/components/home/TrainingCard";
import { MealsRow } from "@/components/home/MealsRow";
import { StatsRow } from "@/components/home/StatsRow";
import { TitanMessage } from "@/components/home/TitanMessage";
import { TabBar } from "@/components/TabBar";
import { levelFromXp } from "@/lib/gamification";

export default function HomePage() {
  const router = useRouter();
  const { onboardingCompleted, profile, todayWorkout, xp, streakDays, registerActivityToday } =
    useTitanStore();

  useEffect(() => {
    if (!onboardingCompleted) router.replace("/onboarding");
  }, [onboardingCompleted, router]);

  useEffect(() => {
    if (onboardingCompleted) registerActivityToday();
  }, [onboardingCompleted, registerActivityToday]);

  if (!onboardingCompleted) return null;

  const goalLabel = profile.goal ?? "tu objetivo";
  const { level } = levelFromXp(xp);

  return (
    <div className="flex min-h-dvh flex-col gap-5 px-5 pb-[110px] pt-1">
      <div className="flex items-start justify-between px-1 pt-2">
        <div>
          <div className="text-[26px] font-extrabold tracking-[-0.4px]">
            Hola{profile.name ? `, ${profile.name}` : ""} 👋
          </div>
          <p className="mt-1.5 max-w-[280px] text-[14px] leading-[1.5] text-text-dim">
            He preparado tu plan de hoy enfocado en {goalLabel.toLowerCase()}.
            Vamos a por ello.
          </p>
        </div>
        <button
          onClick={() => router.push("/perfil")}
          className="flex shrink-0 flex-col items-center gap-1 rounded-2xl border border-border bg-glass px-3 py-2"
        >
          <span className="text-[11px] font-bold text-accent">Nv {level}</span>
          <span className="text-[11px] font-bold">🔥 {streakDays}</span>
        </button>
      </div>

      <TrainingCard
        title={todayWorkout.title}
        meta={todayWorkout.meta}
        completed={todayWorkout.completed}
        imageUrl="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop"
      />

      <MealsRow />

      <button onClick={() => router.push("/progreso")} className="text-left">
        <StatsRow />
      </button>

      <button onClick={() => router.push("/titan")} className="text-left">
        <TitanMessage text="No buscamos una semana perfecta. Solo una mejor que la anterior. Vas muy bien — 4 de 4 entrenos esta semana." />
      </button>

      <TabBar />
    </div>
  );
}
