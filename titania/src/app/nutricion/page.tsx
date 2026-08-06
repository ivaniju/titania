"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import type { Meal } from "@/lib/store";

function RingProgress({ pct, size = 52, stroke = 5, color = "var(--color-accent)" }: {
  pct: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        className="ring-progress transition-all duration-700"
      />
    </svg>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1 rounded-[10px] border border-border bg-white/5 py-2 text-center">
      <div className={`tabular-nums text-[13px] font-bold ${color}`}>{value}g</div>
      <div className="text-[9.5px] font-semibold text-text-dim">{label}</div>
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const toggleMealDone = useTitanStore((s) => s.toggleMealDone);
  const swapMeal = useTitanStore((s) => s.swapMeal);
  const done = useTitanStore((s) => s.mealsCompleted[meal.id]);
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassCard className={`overflow-hidden p-4 ${done ? "border-accent/40" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-start gap-3 flex-1 text-left"
        >
          <div className="text-[26px] leading-none">{meal.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wide text-text-dim capitalize">
              {meal.id}
            </div>
            <div className="mt-0.5 text-[14.5px] font-semibold leading-snug">
              {meal.name}
            </div>
            <div className="tabular-nums mt-1 text-[12px] text-text-dim">
              {meal.kcal} kcal
            </div>
          </div>
        </button>
        <button
          onClick={() => toggleMealDone(meal.id)}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-all ${
            done ? "border-accent bg-accent text-black" : "border-border text-text-dim"
          }`}
        >
          {done ? "✓" : ""}
        </button>
      </div>

      <div className="mt-3.5 flex gap-2">
        <MacroPill label="Proteína" value={meal.protein} color="text-blue" />
        <MacroPill label="Carbos" value={meal.carbs} color="text-orange" />
        <MacroPill label="Grasas" value={meal.fat} color="text-success" />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {meal.alternatives.length > 0 && (
              <div className="mt-3 border-t border-border pt-3">
                <div className="text-[11px] font-bold text-text-dim mb-2">Alternativas</div>
                <div className="flex flex-col gap-2">
                  {meal.alternatives.map((alt, i) => (
                    <div key={i} className="rounded-[12px] border border-border bg-glass p-2.5">
                      <div className="text-[12.5px] font-semibold">{alt.name}</div>
                      <div className="mt-0.5 text-[11px] text-text-dim tabular-nums">
                        {alt.kcal} kcal · {alt.protein}g prot · {alt.carbs}g carbs
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => swapMeal(meal.id)}
        className="mt-3.5 w-full rounded-full border border-border-strong py-2.5 text-[12.5px] font-semibold text-text-dim transition-colors hover:border-accent hover:text-accent"
      >
        ⟲ Cambiar comida
      </button>
    </GlassCard>
  );
}

export default function NutricionPage() {
  const ready = useRequireOnboarding();
  const meals = useTitanStore((s) => s.meals);
  const [search, setSearch] = useState("");

  if (!ready) return null;

  const totalKcal = meals.reduce((sum, m) => sum + m.kcal, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  const targetKcal = 2200;
  const targetProtein = 160;

  const filteredMeals = search
    ? meals.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.includes(search.toLowerCase())
      )
    : meals;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[110px]">
      <ScreenHeader
        title="Nutrición de hoy"
        subtitle={`${totalKcal} kcal · ${totalProtein}g proteína`}
      />

      {/* Resumen macros con rings */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-4">
          {/* Ring calorías */}
          <div className="relative shrink-0">
            <RingProgress
              pct={Math.round((totalKcal / targetKcal) * 100)}
              size={64}
              stroke={6}
              color="var(--color-accent)"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-bold text-accent">🔥</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="tabular-nums text-[24px] font-extrabold">{totalKcal}</span>
              <span className="text-[12px] text-text-dim">/ {targetKcal} kcal</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { label: "Prot.", value: totalProtein, target: targetProtein, color: "bg-blue" },
                { label: "Carbs", value: totalCarbs, target: 220, color: "bg-orange" },
                { label: "Grasas", value: totalFat, target: 60, color: "bg-success" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-[11px] text-text-dim">{m.label}</div>
                  <div className="tabular-nums text-[13px] font-bold">{m.value}g</div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${m.color}`}
                      style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Búsqueda */}
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar comida..."
          className="w-full rounded-full border border-border bg-glass px-5 py-3 text-[14px] text-text placeholder:text-text-dimmer outline-none focus:border-accent"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim"
          >
            ×
          </button>
        )}
      </div>

      {/* Comidas */}
      <div className="flex flex-col gap-3">
        {filteredMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>

      {/* Estado vacío */}
      {filteredMeals.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="text-[40px]">🔍</div>
          <div className="text-[14px] font-semibold">Sin resultados</div>
          <div className="text-[12px] text-text-dim">Prueba con otro término</div>
          <PillButton variant="secondary" onClick={() => setSearch("")}>
            Ver todas
          </PillButton>
        </div>
      )}

      <TabBar />
    </div>
  );
}
