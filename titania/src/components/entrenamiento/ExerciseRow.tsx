"use client";

import { useState } from "react";
import { useTitanStore, type Exercise } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";

export function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const logSet = useTitanStore((s) => s.logSet);
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("8");

  const done = exercise.loggedSets.length >= exercise.targetSets;

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
    <GlassCard className="p-4">
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="text-left">
          <div className="text-[14.5px] font-semibold">{exercise.name}</div>
          <div className="mt-0.5 text-[12px] text-text-dim">
            {exercise.loggedSets.length}/{exercise.targetSets} series ·{" "}
            {exercise.targetReps} reps
          </div>
        </div>
        <div
          className={
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold " +
            (done ? "bg-accent text-black" : "border border-border text-text-dim")
          }
        >
          {done ? "✓" : exercise.loggedSets.length}
        </div>
      </button>

      {exercise.loggedSets.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {exercise.loggedSets.map((s, i) => (
            <span
              key={i}
              className="tabular-nums rounded-full border border-border bg-white/5 px-2.5 py-1 text-[11px] text-text-dim"
            >
              {s.weight}kg × {s.reps} · RPE {s.rpe}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-4 flex items-end gap-2 border-t border-border pt-4">
          <div className="flex-1">
            <label className="text-[10.5px] font-semibold text-text-dim">Kg</label>
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              type="number"
              inputMode="decimal"
              className="mt-1 w-full rounded-[10px] border border-border bg-glass px-3 py-2 text-[14px] outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10.5px] font-semibold text-text-dim">Reps</label>
            <input
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              type="number"
              inputMode="numeric"
              className="mt-1 w-full rounded-[10px] border border-border bg-glass px-3 py-2 text-[14px] outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10.5px] font-semibold text-text-dim">RPE</label>
            <input
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              type="number"
              inputMode="decimal"
              className="mt-1 w-full rounded-[10px] border border-border bg-glass px-3 py-2 text-[14px] outline-none focus:border-accent"
            />
          </div>
          <PillButton onClick={submit} className="mb-[1px]">
            Añadir
          </PillButton>
        </div>
      )}
    </GlassCard>
  );
}
