"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTitanStore } from "@/lib/store";
import { TrainingCard } from "@/components/home/TrainingCard";
import { MealsRow } from "@/components/home/MealsRow";
import { StatsRow } from "@/components/home/StatsRow";
import { TitanMessage } from "@/components/home/TitanMessage";
import { TabBar } from "@/components/TabBar";

export default function HomePage() {
  const router = useRouter();
  const { onboardingCompleted, profile, todayWorkout } = useTitanStore();

  useEffect(() => {
    if (!onboardingCompleted) router.replace("/onboarding");
  }, [onboardingCompleted, router]);

  if (!onboardingCompleted) return null;

  const goalLabel = profile.goal ?? "tu objetivo";

  return (
    <div className="flex min-h-dvh flex-col gap-5 px-5 pb-[110px] pt-1">
      <div className="px-1 pt-2">
        <div className="text-[26px] font-extrabold tracking-[-0.4px]">
          Hola 👋
        </div>
        <p className="mt-1.5 max-w-[280px] text-[14px] leading-[1.5] text-text-dim">
          He preparado tu plan de hoy enfocado en {goalLabel.toLowerCase()}.
          Vamos a por ello.
        </p>
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
