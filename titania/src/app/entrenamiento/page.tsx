"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTitanStore, type Exercise } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { AchievementToast } from "@/components/ui/AchievementToast";

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const logSet = useTitanStore((s) => s.logSet);
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("8");

  const done = exercise.loggedSets.length >= exercise.targetSets;
  const progress = Math.min(exercise.loggedSets.length / exercise.targetSets, 1);

  function submit() {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    const rp = parseFloat(rpe);
    if (!w || !r) return;
    logSet(exercise.id, { weight: w, reps: r, rpe: rp });
    setWeight("");
    setReps("");
  }

  return (
    <GlassCard className={`overflow-hidden p-4 ${done ? "border-accent/40" : ""}`}>
      <button
        className="flex w-full items-center justify-between gap-3"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <div className="text-[14.5px] font-semibold">{exercise.name}</div>
            {exercise.muscleGroup && (
              <span className="rounded-full border border-border bg-glass px-2 py-0.5 text-[9px] text-text-dim">
                {exercise.muscleGroup}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[12px] text-text-dim">
            {exercise.loggedSets.length}/{exercise.targetSets} series · {exercise.targetReps} reps
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={`h-full rounded-full ${done ? "bg-accent" : "bg-white/40"}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
            done ? "bg-accent text-black" : "border border-border text-text-dim"
          }`}
        >
          {done ? "✓" : exercise.loggedSets.length}
        </div>
      </button>

      {exercise.loggedSets.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {exercise.loggedSets.map((s, i) => (
            <span
              key={i}
              className="tabular-nums rounded-full border border-accent/30 bg-accent-dim px-2.5 py-1 text-[11px] text-accent"
            >
              {s.weight}kg × {s.reps} · RPE {s.rpe}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex items-end gap-2 border-t border-border pt-4">
              {[
                { label: "Kg", value: weight, set: setWeight, mode: "decimal" as const },
                { label: "Reps", value: reps, set: setReps, mode: "numeric" as const },
                { label: "RPE", value: rpe, set: setRpe, mode: "decimal" as const },
              ].map((field) => (
                <div key={field.label} className="flex-1">
                  <label className="text-[10.5px] font-semibold text-text-dim">
                    {field.label}
                  </label>
                  <input
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    type="number"
                    inputMode={field.mode}
                    className="mt-1 w-full rounded-[10px] border border-border bg-glass px-3 py-2 text-[14px] outline-none focus:border-accent"
                  />
                </div>
              ))}
              <PillButton onClick={submit} className="mb-[1px]">
                +
              </PillButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

export default function EntrenamientoPage() {
  const ready = useRequireOnboarding();
  const todayWorkout = useTitanStore((s) => s.todayWorkout);
  const completeWorkout = useTitanStore((s) => s.completeWorkout);

  if (!ready) return null;

  const allDone = todayWorkout.exercises.every(
    (ex) => ex.loggedSets.length >= ex.targetSets
  );
  const completedCount = todayWorkout.exercises.filter(
    (ex) => ex.loggedSets.length >= ex.targetSets
  ).length;
  const overallPct = Math.round(
    (completedCount / todayWorkout.exercises.length) * 100
  );

  return (
    <>
      <AchievementToast />
      <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[100px]">
        <ScreenHeader title={todayWorkout.title} subtitle={todayWorkout.meta} />

        {/* Progreso general */}
        <GlassCard className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[13px] font-semibold">Progreso del entreno</div>
            <div className="tabular-nums text-[13px] font-bold text-accent">
              {completedCount}/{todayWorkout.exercises.length}
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </GlassCard>

        {/* Ejercicios */}
        <div className="flex flex-col gap-3">
          {todayWorkout.exercises.map((ex) => (
            <ExerciseRow key={ex.id} exercise={ex} />
          ))}
        </div>

        {/* CTA */}
        {todayWorkout.completed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[20px] border border-accent bg-accent-dim p-5 text-center"
          >
            <div className="text-[24px] mb-1">💪</div>
            <div className="text-[15px] font-bold text-accent">Entreno completado</div>
            <div className="text-[13px] text-text-dim mt-1">+120 XP ganados</div>
          </motion.div>
        ) : (
          <PillButton
            onClick={completeWorkout}
            className="mt-2 w-full py-4 text-center text-[14px]"
          >
            {allDone ? "Completar entreno · +120 XP" : "Marcar como completado igualmente"}
          </PillButton>
        )}
      </div>
      <TabBar />
    </>
  );
}
