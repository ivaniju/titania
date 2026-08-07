"use client";

import { useState } from "react";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ROUTINES } from "@/lib/data/routines";
import { EXERCISES } from "@/lib/data/exercises";
import { ScreenHeader } from "@/components/ScreenHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { clsx } from "clsx";

function exerciseName(id: string) {
  return EXERCISES.find((e) => e.id === id)?.name ?? id;
}

export default function RutinasPage() {
  const ready = useRequireOnboarding();
  const selectedRoutineId = useTitanStore((s) => s.selectedRoutineId);
  const setRoutine = useTitanStore((s) => s.setRoutine);
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!ready) return null;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-14">
      <ScreenHeader title="Rutinas" subtitle="Programas variados según tu objetivo y material" />

      <div className="flex flex-col gap-3">
        {ROUTINES.map((r) => {
          const active = r.id === selectedRoutineId;
          const isOpen = expanded === r.id;
          return (
            <GlassCard key={r.id} className={clsx("p-4", active && "border-accent/50")}>
              <button className="w-full text-left" onClick={() => setExpanded(isOpen ? null : r.id)}>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold">{r.name}</span>
                  {active && <span className="text-[10px] font-bold text-accent">ACTIVA</span>}
                </div>
                <p className="mt-1 text-[12px] leading-snug text-text-dim">{r.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[r.level, `${r.daysPerWeek} días/sem`, r.equipment, r.goal].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border-strong px-2.5 py-1 text-[10px] font-semibold text-text-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>

              {isOpen && (
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                  {r.days.map((day) => (
                    <div key={day.day}>
                      <div className="text-[11.5px] font-bold text-accent">
                        {day.day} · {day.title}
                      </div>
                      <ul className="mt-1 list-disc pl-4 text-[12px] text-text-dim">
                        {day.exerciseIds.map((id) => (
                          <li key={id}>{exerciseName(id)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <PillButton
                variant={active ? "secondary" : "primary"}
                className="mt-3 w-full py-2.5 text-center text-[12.5px]"
                onClick={() => setRoutine(r.id)}
              >
                {active ? "Rutina seleccionada" : "Elegir esta rutina"}
              </PillButton>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
