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

      <TabBar />
    </div>
  );
}
