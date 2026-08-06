"use client";

import { useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";

const CHART_RANGES = ["7d", "30d", "90d", "1a"] as const;
type ChartRange = (typeof CHART_RANGES)[number];

const MOCK_WEIGHT_DATA: Record<ChartRange, { date: string; weight: number }[]> = {
  "7d": [
    { date: "L", weight: 80.8 }, { date: "M", weight: 80.6 }, { date: "X", weight: 80.5 },
    { date: "J", weight: 80.7 }, { date: "V", weight: 80.4 }, { date: "S", weight: 80.2 },
    { date: "D", weight: 80.0 },
  ],
  "30d": Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}`,
    weight: parseFloat((82.4 - i * 0.07 + (Math.random() - 0.5) * 0.3).toFixed(1)),
  })),
  "90d": Array.from({ length: 12 }, (_, i) => ({
    date: `Sem ${i + 1}`,
    weight: parseFloat((82.4 - i * 0.18 + (Math.random() - 0.5) * 0.2).toFixed(1)),
  })),
  "1a": Array.from({ length: 12 }, (_, i) => ({
    date: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
    weight: parseFloat((85 - i * 0.4 + (Math.random() - 0.5) * 0.5).toFixed(1)),
  })),
};

const STATS_CARDS = [
  { icon: "⚖️", label: "Peso actual", value: "80.2 kg", delta: "-2.2 kg", positive: true },
  { icon: "📏", label: "IMC", value: "24.1", delta: "-0.8", positive: true },
  { icon: "🏋️", label: "Entrenos/semana", value: "3.8", delta: "+0.6", positive: true },
  { icon: "⏱️", label: "Tiempo entreno", value: "52 min", delta: "+8 min", positive: true },
  { icon: "💪", label: "Proteína media", value: "143g", delta: "+12g", positive: true },
  { icon: "👣", label: "Pasos/día", value: "7.2k", delta: "+1.1k", positive: true },
];

export default function ProgresoPage() {
  const ready = useRequireOnboarding();
  const weighIns = useTitanStore((s) => s.weighIns);
  const addWeighIn = useTitanStore((s) => s.addWeighIn);
  const [value, setValue] = useState("");
  const [range, setRange] = useState<ChartRange>("30d");

  if (!ready) return null;

  const data = MOCK_WEIGHT_DATA[range];
  const last = weighIns[weighIns.length - 1]?.weight ?? 0;
  const first = weighIns[0]?.weight ?? 0;
  const delta = (last - first).toFixed(1);

  function submit() {
    const w = parseFloat(value);
    if (!w) return;
    addWeighIn(w);
    setValue("");
  }

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[110px]">
      <ScreenHeader
        title="Tu progreso"
        subtitle="Analizamos la tendencia, no un único dato"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {STATS_CARDS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-3">
              <div className="text-[18px]">{s.icon}</div>
              <div className="tabular-nums mt-2 text-[16px] font-extrabold">{s.value}</div>
              <div className="mt-0.5 text-[9.5px] text-text-dim leading-tight">{s.label}</div>
              <div
                className={`mt-1 text-[10px] font-bold tabular-nums ${
                  s.positive ? "text-success" : "text-danger"
                }`}
              >
                {s.delta}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Gráfica de peso */}
      <GlassCard className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="tabular-nums text-[26px] font-extrabold">{last} kg</div>
            <div className="mt-0.5 text-[12px] text-text-dim">Peso actual</div>
          </div>
          <div
            className={`tabular-nums rounded-full px-3 py-1 text-[12px] font-bold ${
              Number(delta) <= 0 ? "bg-success-dim text-success" : "bg-danger-dim text-danger"
            }`}
          >
            {Number(delta) > 0 ? "+" : ""}{delta} kg
          </div>
        </div>

        {/* Range selector */}
        <div className="mb-3 flex gap-1.5">
          {CHART_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                range === r ? "bg-accent text-black" : "bg-glass text-text-dim"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c6ff00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c6ff00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }}
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
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#C6FF00"
                strokeWidth={2.5}
                fill="url(#weightGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Registrar pesaje */}
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

      {/* Historial */}
      {weighIns.length > 0 && (
        <GlassCard className="p-4">
          <div className="mb-3 text-[13px] font-semibold">Historial de pesajes</div>
          <div className="flex flex-col gap-2">
            {[...weighIns].reverse().map((w, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[13px] text-text-dim">{w.date}</span>
                <span className="tabular-nums text-[13px] font-semibold">{w.weight} kg</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <TabBar />
    </div>
  );
}
