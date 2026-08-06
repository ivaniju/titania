"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTitanStore, todayISO, isoToLabel } from "@/lib/store";
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
      <circle cx={size / 2} cy={size / 2} r={r}
        stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        className="ring-progress transition-all duration-700" />
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
  const done = useTitanStore((s) => !!s.mealsCompleted[meal.id]);
  const [expanded, setExpanded] = useState(false);
  const isEmpty = meal.kcal === 0;

  return (
    <GlassCard className={`overflow-hidden p-4 ${done ? "border-accent/40" : ""}`}>
      <div className="flex items-start gap-3">
        <button onClick={() => setExpanded((e) => !e)}
          className="flex items-start gap-3 flex-1 text-left">
          <div className="text-[26px] leading-none">{meal.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wide text-text-dim capitalize">
              {meal.id}
            </div>
            <div className="mt-0.5 text-[14.5px] font-semibold leading-snug">
              {meal.name}
            </div>
            {!isEmpty && (
              <div className="tabular-nums mt-1 text-[12px] text-text-dim">
                {meal.kcal} kcal
              </div>
            )}
          </div>
        </button>
        {!isEmpty && (
          <button onClick={() => toggleMealDone(meal.id)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-all ${
              done ? "border-accent bg-accent text-black" : "border-border text-text-dim"
            }`}>
            {done ? "✓" : ""}
          </button>
        )}
      </div>

      {!isEmpty && (
        <div className="mt-3.5 flex gap-2">
          <MacroPill label="Proteína" value={meal.protein} color="text-blue" />
          <MacroPill label="Carbos" value={meal.carbs} color="text-orange" />
          <MacroPill label="Grasas" value={meal.fat} color="text-success" />
        </div>
      )}

      <AnimatePresence>
        {expanded && !isEmpty && (
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

      {!isEmpty && (
        <button onClick={() => swapMeal(meal.id)}
          className="mt-3.5 w-full rounded-full border border-border-strong py-2.5 text-[12.5px] font-semibold text-text-dim transition-colors hover:border-accent hover:text-accent">
          ⟲ Cambiar comida
        </button>
      )}
    </GlassCard>
  );
}

// Historial semanal tab
function HistorialTab() {
  const mealHistory = useTitanStore((s) => s.mealHistory);
  const meals = useTitanStore((s) => s.meals);
  const mealsCompleted = useTitanStore((s) => s.mealsCompleted);
  const today = todayISO();

  const allDays = [
    { date: today, meals, completed: mealsCompleted },
    ...mealHistory.filter((d) => d.date !== today),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);

  if (allDays.length === 0) {
    return (
      <GlassCard className="p-5 text-center">
        <div className="text-[28px] mb-2">📋</div>
        <div className="text-[13px] font-semibold">Sin historial todavía</div>
        <div className="text-[11.5px] text-text-dim mt-1">
          Registra tus comidas de hoy y aparecerán aquí mañana
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {allDays.map((day) => {
        const totalKcal = day.meals.reduce((s, m) => s + m.kcal, 0);
        const completedCount = Object.values(day.completed).filter(Boolean).length;
        return (
          <div key={day.date}>
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="text-[13px] font-bold">
                {day.date === today ? "Hoy" : isoToLabel(day.date)}
              </div>
              <div className="text-[11px] text-text-dimmer">
                {completedCount}/{day.meals.length} · {totalKcal > 0 ? `${totalKcal} kcal` : "Sin datos"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {day.meals.map((meal) => (
                <GlassCard key={meal.id} className={`p-3 ${day.completed[meal.id] ? "border-accent/30" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[18px]">{meal.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold uppercase text-text-dimmer">{meal.id}</div>
                      <div className="text-[12px] font-semibold leading-tight truncate">{meal.name}</div>
                    </div>
                    {day.completed[meal.id] && (
                      <span className="text-[12px] text-accent shrink-0">✓</span>
                    )}
                  </div>
                  {meal.kcal > 0 && (
                    <div className="mt-1.5 text-[10px] text-text-dimmer tabular-nums">
                      {meal.kcal} kcal · {meal.protein}g prot
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function NutricionPage() {
  const ready = useRequireOnboarding();
  const meals = useTitanStore((s) => s.meals);
  const saveTodayMeals = useTitanStore((s) => s.saveTodayMeals);
  const [tab, setTab] = useState<"hoy" | "historial">("hoy");

  if (!ready) return null;

  const totalKcal = meals.reduce((sum, m) => sum + m.kcal, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  const targetKcal = 2200;
  const targetProtein = 160;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[100px]">
      <ScreenHeader
        title="Nutrición"
        subtitle={totalKcal > 0 ? `${totalKcal} kcal · ${totalProtein}g proteína` : "Registra tus comidas de hoy"}
      />

      {/* Tabs */}
      <div className="flex gap-2">
        {(["hoy", "historial"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2.5 text-[12px] font-bold transition-all capitalize ${
              tab === t ? "bg-accent text-black" : "border border-border bg-glass text-text-dim"
            }`}>
            {t === "hoy" ? "🍽️ Hoy" : "📋 Historial"}
          </button>
        ))}
      </div>

      {/* HOY */}
      {tab === "hoy" && (
        <>
          {/* Resumen macros */}
          {totalKcal > 0 && (
            <GlassCard className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <RingProgress pct={Math.min(Math.round((totalKcal / targetKcal) * 100), 100)}
                    size={64} stroke={6} color="var(--color-accent)" />
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
                          <div className={`h-full rounded-full ${m.color}`}
                            style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Comidas */}
          <div className="flex flex-col gap-3">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>

          {/* Guardar en historial */}
          <PillButton
            variant="secondary"
            className="w-full py-3 text-center"
            onClick={saveTodayMeals}
          >
            Guardar en historial
          </PillButton>
        </>
      )}

      {/* HISTORIAL */}
      {tab === "historial" && <HistorialTab />}

      <TabBar />
    </div>
  );
}
