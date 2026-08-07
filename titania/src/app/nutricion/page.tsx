"use client";

import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { MealCard } from "@/components/nutricion/MealCard";
import { TabBar } from "@/components/TabBar";
import { NavCard } from "@/components/ui/NavCard";
import { FOODS } from "@/lib/data/foods";
import { DIET_PLANS } from "@/lib/data/diets";

export default function NutricionPage() {
  const ready = useRequireOnboarding();
  const meals = useTitanStore((s) => s.meals);
  if (!ready) return null;
  const totalKcal = meals.reduce((sum, m) => sum + m.kcal, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-[110px]">
      <ScreenHeader
        title="Nutrición de hoy"
        subtitle={`${totalKcal} kcal totales · ${totalProtein}g de proteína`}
      />

      <div className="flex flex-col gap-3">
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <NavCard
          href="/alimentos"
          icon="🥗"
          title="Base de alimentos"
          subtitle={`${FOODS.length} alimentos por categoría`}
        />
        <NavCard
          href="/dietas"
          icon="📋"
          title="Planes de dieta"
          subtitle={`${DIET_PLANS.length} dietas variadas`}
        />
      </div>

      <TabBar />
    </div>
  );
}
