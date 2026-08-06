"use client";

import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { useTitanStore } from "@/lib/store";

export function MealsRow() {
  const router = useRouter();
  const meals = useTitanStore((s) => s.meals);
  const mealsCompleted = useTitanStore((s) => s.mealsCompleted);
  const toggleMealDone = useTitanStore((s) => s.toggleMealDone);

  return (
    <div className="flex gap-2.5">
      {meals.map((meal) => {
        const isDone = mealsCompleted[meal.id];
        return (
          <button
            key={meal.id}
            onClick={() => toggleMealDone(meal.id)}
            onDoubleClick={() => router.push("/nutricion")}
            className={clsx(
              "flex flex-1 flex-col items-center gap-1.5 rounded-[14px] border px-2.5 py-3.5 text-center transition-colors",
              isDone ? "border-accent bg-accent-dim" : "border-border bg-glass"
            )}
          >
            <div className="text-xl leading-none">{meal.icon}</div>
            <div
              className={clsx(
                "text-[11px] font-semibold capitalize",
                isDone ? "text-accent" : "text-text-dim"
              )}
            >
              {meal.id}
            </div>
          </button>
        );
      })}
    </div>
  );
}
