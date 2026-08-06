"use client";

import { clsx } from "clsx";
import { useTitanStore, type Meal } from "@/lib/store";
import { GlassCard } from "@/components/ui/GlassCard";

function MacroPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-[10px] border border-border bg-white/5 py-2 text-center">
      <div className="tabular-nums text-[13px] font-bold">{value}g</div>
      <div className="text-[9.5px] font-semibold text-text-dim">{label}</div>
    </div>
  );
}

export function MealCard({ meal }: { meal: Meal }) {
  const toggleMealDone = useTitanStore((s) => s.toggleMealDone);
  const swapMeal = useTitanStore((s) => s.swapMeal);
  const done = useTitanStore((s) => s.mealsCompleted[meal.id]);

  return (
    <GlassCard className={clsx("p-4", done && "border-accent")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl leading-none">{meal.icon}</div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-text-dim capitalize">
              {meal.id}
            </div>
            <div className="mt-0.5 max-w-[190px] text-[14.5px] font-semibold leading-snug">
              {meal.name}
            </div>
            <div className="tabular-nums mt-1 text-[12px] text-text-dim">
              {meal.kcal} kcal
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleMealDone(meal.id)}
          className={clsx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
            done
              ? "border-accent bg-accent text-black"
              : "border-border text-text-dim"
          )}
        >
          {done ? "✓" : ""}
        </button>
      </div>

      <div className="mt-3.5 flex gap-2">
        <MacroPill label="Proteína" value={meal.protein} />
        <MacroPill label="Carbos" value={meal.carbs} />
        <MacroPill label="Grasas" value={meal.fat} />
      </div>

      <button
        onClick={() => swapMeal(meal.id)}
        className="mt-3.5 w-full rounded-full border border-border-strong py-2.5 text-[12.5px] font-semibold text-text-dim transition-colors hover:border-accent hover:text-accent"
      >
        ⟲ Cambiar comida
      </button>
    </GlassCard>
  );
}
