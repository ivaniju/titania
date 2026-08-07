"use client";

import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { DIET_PLANS } from "@/lib/data/diets";
import { ScreenHeader } from "@/components/ScreenHeader";
import { GlassCard } from "@/components/ui/GlassCard";

export default function DietasPage() {
  const ready = useRequireOnboarding();
  if (!ready) return null;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-14">
      <ScreenHeader title="Planes de dieta" subtitle="Puntos de partida, ajustables a tus macros" />

      <div className="flex flex-col gap-3">
        {DIET_PLANS.map((plan) => (
          <GlassCard key={plan.id} className="flex flex-col gap-3 p-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold">{plan.name}</span>
                <span className="rounded-full border border-border-strong px-2.5 py-1 text-[10px] font-semibold text-text-dim">
                  {plan.style}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-text-dim">{plan.description}</p>
              <div className="mt-1.5 text-[11px] text-accent">
                {plan.kcalApprox} · {plan.proteinApprox}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 border-t border-border pt-3">
              {plan.meals.map((m) => (
                <div key={m.slot} className="flex gap-2 text-[12px]">
                  <span className="w-20 shrink-0 font-semibold text-text-dim">{m.slot}</span>
                  <span>{m.description}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
