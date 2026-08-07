"use client";

import { useMemo, useState } from "react";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { FOODS, FOOD_CATEGORIES, searchFoods, type FoodCategory } from "@/lib/data/foods";
import { ScreenHeader } from "@/components/ScreenHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { clsx } from "clsx";

export default function AlimentosPage() {
  const ready = useRequireOnboarding();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategory | "Favoritos" | "Recientes" | null>(null);
  const favoriteFoodIds = useTitanStore((s) => s.favoriteFoodIds);
  const recentFoodIds = useTitanStore((s) => s.recentFoodIds);
  const toggleFavoriteFood = useTitanStore((s) => s.toggleFavoriteFood);
  const registerRecentFood = useTitanStore((s) => s.registerRecentFood);

  const results = useMemo(() => {
    if (category === "Favoritos") return FOODS.filter((f) => favoriteFoodIds.includes(f.id));
    if (category === "Recientes")
      return recentFoodIds.map((id) => FOODS.find((f) => f.id === id)).filter(Boolean) as typeof FOODS;
    return searchFoods(query, category ?? undefined);
  }, [query, category, favoriteFoodIds, recentFoodIds]);

  if (!ready) return null;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-14">
      <ScreenHeader title="Alimentos" subtitle={`${FOODS.length} alimentos disponibles`} />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar alimento..."
        className="rounded-2xl border border-border bg-glass px-4 py-3 text-[14px] text-text placeholder:text-text-dimmer outline-none focus:border-accent"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {(["Favoritos", "Recientes", ...FOOD_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(category === c ? null : c)}
            className={clsx(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold",
              category === c ? "border-accent text-accent" : "border-border text-text-dim"
            )}
          >
            {c === "Favoritos" ? "⭐ Favoritos" : c === "Recientes" ? "🕒 Recientes" : c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {results.map((food) => {
          const isFav = favoriteFoodIds.includes(food.id);
          return (
            <GlassCard
              key={food.id}
              className="flex items-center gap-3 p-3.5"
            >
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => registerRecentFood(food.id)}
              >
                <div className="text-[13.5px] font-bold">{food.name}</div>
                <div className="mt-0.5 text-[11px] text-text-dim">
                  {food.kcal} kcal · P {food.protein}g · C {food.carbs}g · G {food.fat}g
                  {food.portion ? ` · ${food.portion}` : " · por 100 g"}
                </div>
              </button>
              <button
                onClick={() => toggleFavoriteFood(food.id)}
                className={clsx("text-[18px]", isFav ? "opacity-100" : "opacity-30")}
              >
                ⭐
              </button>
            </GlassCard>
          );
        })}
        {results.length === 0 && (
          <p className="px-1 py-6 text-center text-[12.5px] text-text-dim">
            No hay alimentos que coincidan con tu búsqueda.
          </p>
        )}
      </div>
    </div>
  );
}
