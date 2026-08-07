"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";

export default function ProgresoPage() {
  const ready = useRequireOnboarding();
  const weighIns = useTitanStore((s) => s.weighIns);
  const addWeighIn = useTitanStore((s) => s.addWeighIn);
  const todayWater = useTitanStore((s) => s.todayWater);
  const todaySteps = useTitanStore((s) => s.todaySteps);
  const logWater = useTitanStore((s) => s.logWater);
  const logSteps = useTitanStore((s) => s.logSteps);
  const kmRunTotal = useTitanStore((s) => s.kmRunTotal);
  const pullUpsTotal = useTitanStore((s) => s.pullUpsTotal);
  const logRun = useTitanStore((s) => s.logRun);
  const logPullUps = useTitanStore((s) => s.logPullUps);
  const [value, setValue] = useState("");

  const first = weighIns[0]?.weight ?? 0;
  const last = weighIns[weighIns.length - 1]?.weight ?? 0;
  const delta = (last - first).toFixed(1);

  function submit() {
    const w = parseFloat(value);
    if (!w) return;
    addWeighIn(w);
    setValue("");
  }

  if (!ready) return null;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-[110px]">
      <ScreenHeader title="Tu progreso" subtitle="Analizamos la tendencia, nunca un único dato" />

      <GlassCard className="p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="tabular-nums text-[26px] font-extrabold">{last} kg</div>
            <div className="mt-0.5 text-[12px] text-text-dim">Peso actual</div>
          </div>
          <div
            className={
              "tabular-nums rounded-full px-3 py-1 text-[12px] font-bold " +
              (Number(delta) <= 0
                ? "bg-accent-dim text-accent"
                : "bg-white/10 text-text-dim")
            }
          >
            {Number(delta) > 0 ? "+" : ""}
            {delta} kg
          </div>
        </div>

        <div className="mt-4 h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weighIns} margin={{ top: 5, right: 8, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#C6FF00"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#C6FF00", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="text-[13px] font-semibold">Registrar pesaje de hoy</div>
        <div className="mt-3 flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="number"
            inputMode="decimal"
            placeholder="Ej. 80.5"
            className="flex-1 rounded-[10px] border border-border bg-glass px-3.5 py-2.5 text-[14px] outline-none focus:border-accent"
          />
          <PillButton onClick={submit}>Guardar</PillButton>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-2.5">
        <GlassCard className="flex flex-col gap-1 p-3.5">
          <div className="text-[11px] text-text-dim">💧 Agua hoy</div>
          <div className="text-[16px] font-extrabold">{todayWater} L</div>
          <div className="mt-1 flex gap-1.5">
            {[0.5, 1].map((amt) => (
              <button
                key={amt}
                onClick={() => logWater(todayWater + amt)}
                className="rounded-full border border-border-strong px-2.5 py-1 text-[10.5px] font-semibold"
              >
                +{amt}L
              </button>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="flex flex-col gap-1 p-3.5">
          <div className="text-[11px] text-text-dim">👣 Pasos hoy</div>
          <div className="tabular-nums text-[16px] font-extrabold">{todaySteps}</div>
          <div className="mt-1 flex gap-1.5">
            <button
              onClick={() => logSteps(todaySteps + 1000)}
              className="rounded-full border border-border-strong px-2.5 py-1 text-[10.5px] font-semibold"
            >
              +1.000
            </button>
          </div>
        </GlassCard>
        <GlassCard className="flex flex-col gap-1 p-3.5">
          <div className="text-[11px] text-text-dim">🏃 Km recorridos</div>
          <div className="tabular-nums text-[16px] font-extrabold">{kmRunTotal} km</div>
          <div className="mt-1 flex gap-1.5">
            <button
              onClick={() => logRun(5)}
              className="rounded-full border border-border-strong px-2.5 py-1 text-[10.5px] font-semibold"
            >
              +5 km
            </button>
          </div>
        </GlassCard>
        <GlassCard className="flex flex-col gap-1 p-3.5">
          <div className="text-[11px] text-text-dim">🧗 Dominadas totales</div>
          <div className="tabular-nums text-[16px] font-extrabold">{pullUpsTotal}</div>
          <div className="mt-1 flex gap-1.5">
            <button
              onClick={() => logPullUps(5)}
              className="rounded-full border border-border-strong px-2.5 py-1 text-[10.5px] font-semibold"
            >
              +5
            </button>
          </div>
        </GlassCard>
      </div>

      <TabBar />
    </div>
  );
}
