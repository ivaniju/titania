"use client";

import { clsx } from "clsx";
import { useState } from "react";

const MEALS = [
  { key: "desayuno", icon: "🍳", label: "Desayuno" },
  { key: "comida", icon: "🥗", label: "Comida" },
  { key: "cena", icon: "🍗", label: "Cena" },
  { key: "snack", icon: "🥤", label: "Snack" },
];

export function MealsRow() {
  const [done, setDone] = useState<Record<string, boolean>>({
    desayuno: true,
    comida: true,
  });

  return (
    <div className="flex gap-2.5">
      {MEALS.map((meal) => {
        const isDone = done[meal.key];
        return (
          <button
            key={meal.key}
            onClick={() =>
              setDone((d) => ({ ...d, [meal.key]: !d[meal.key] }))
            }
            className={clsx(
              "flex flex-1 flex-col items-center gap-1.5 rounded-[14px] border px-2.5 py-3.5 text-center transition-colors",
              isDone
                ? "border-accent bg-accent-dim"
                : "border-border bg-glass"
            )}
          >
            <div className="text-xl leading-none">{meal.icon}</div>
            <div
              className={clsx(
                "text-[11px] font-semibold",
                isDone ? "text-accent" : "text-text-dim"
              )}
            >
              {meal.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
