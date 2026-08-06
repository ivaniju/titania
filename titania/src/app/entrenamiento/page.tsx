"use client";

import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ExerciseRow } from "@/components/entrenamiento/ExerciseRow";
import { PillButton } from "@/components/ui/PillButton";
import { TabBar } from "@/components/TabBar";

export default function EntrenamientoPage() {
  const ready = useRequireOnboarding();
  const { todayWorkout, completeWorkout } = useTitanStore();
  if (!ready) return null;
  const allDone = todayWorkout.exercises.every(
    (ex) => ex.loggedSets.length >= ex.targetSets
  );

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-[110px]">
      <ScreenHeader title={todayWorkout.title} subtitle={todayWorkout.meta} />

      <div className="flex flex-col gap-3">
        {todayWorkout.exercises.map((ex) => (
          <ExerciseRow key={ex.id} exercise={ex} />
        ))}
      </div>

      {todayWorkout.completed ? (
        <div className="mt-2 rounded-[20px] border border-accent bg-accent-dim p-4 text-center text-[13.5px] font-semibold text-accent">
          Entreno completado — buen trabajo hoy 💪
        </div>
      ) : (
        <PillButton
          onClick={completeWorkout}
          className="mt-2 w-full py-3.5 text-center text-[14px]"
        >
          {allDone ? "Completar entreno" : "Marcar como completado igualmente"}
        </PillButton>
      )}

      <TabBar />
    </div>
  );
}
