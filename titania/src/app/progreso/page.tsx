"use client";

import { useState, useRef } from "react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { motion } from "framer-motion";
import { useTitanStore, isoToLabel } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";

const CHART_RANGES = ["7d", "30d", "90d"] as const;
type ChartRange = (typeof CHART_RANGES)[number];

export default function ProgresoPage() {
  const ready = useRequireOnboarding();
  const weighIns = useTitanStore((s) => s.weighIns);
  const addWeighIn = useTitanStore((s) => s.addWeighIn);
  const progressPhotos = useTitanStore((s) => s.progressPhotos);
  const addProgressPhoto = useTitanStore((s) => s.addProgressPhoto);
  const removeProgressPhoto = useTitanStore((s) => s.removeProgressPhoto);
  const dailyHistory = useTitanStore((s) => s.dailyHistory);
  const dailyStats = useTitanStore((s) => s.dailyStats);

  const [value, setValue] = useState("");
  const [range, setRange] = useState<ChartRange>("30d");
  const [photoNote, setPhotoNote] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!ready) return null;

  // Build chart data from real weighIns
  const now = Date.now();
  const msPerDay = 86400000;
  const rangeDays = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const cutoff = new Date(now - rangeDays * msPerDay).toISOString().split("T")[0];
  const chartData = weighIns
    .filter((w) => w.date >= cutoff)
    .map((w) => ({ date: isoToLabel(w.date), weight: w.weight }));

  const last = weighIns[weighIns.length - 1]?.weight ?? null;
  const first = weighIns[0]?.weight ?? null;
  const delta = last && first ? (last - first).toFixed(1) : null;

  function submit() {
    const w = parseFloat(value);
    if (!w || w < 20 || w > 300) return;
    addWeighIn(w);
    setValue("");
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) addProgressPhoto(dataUrl, photoNote || undefined);
    };
    reader.readAsDataURL(file);
    setPhotoNote("");
    if (fileRef.current) fileRef.current.value = "";
  }

  // Steps history from dailyHistory
  const stepsData = dailyHistory.slice(-7).map((d) => ({
    date: isoToLabel(d.date),
    steps: d.steps,
  }));
  if (dailyStats.steps > 0) {
    stepsData.push({ date: "Hoy", steps: dailyStats.steps });
  }

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[100px]">
      <ScreenHeader title="Tu progreso" subtitle="Solo datos reales" />

      {/* Sin datos aún */}
      {weighIns.length === 0 && progressPhotos.length === 0 && (
        <GlassCard className="p-5 text-center">
          <div className="text-[32px] mb-2">📈</div>
          <div className="text-[15px] font-bold">Empieza a registrar tu progreso</div>
          <div className="text-[12px] text-text-dim mt-1">
            Anota tu peso hoy y en unos días verás la tendencia
          </div>
        </GlassCard>
      )}

      {/* Peso */}
      {weighIns.length > 0 && (
        <GlassCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="tabular-nums text-[26px] font-extrabold">{last} kg</div>
              <div className="mt-0.5 text-[12px] text-text-dim">Peso actual</div>
            </div>
            {delta && (
              <div className={`tabular-nums rounded-full px-3 py-1 text-[12px] font-bold ${
                Number(delta) <= 0 ? "bg-success-dim text-success" : "bg-danger-dim text-danger"
              }`}>
                {Number(delta) > 0 ? "+" : ""}{delta} kg
              </div>
            )}
          </div>

          {/* Range selector */}
          <div className="mb-3 flex gap-1.5">
            {CHART_RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                  range === r ? "bg-accent text-black" : "bg-glass text-text-dim"
                }`}>
                {r}
              </button>
            ))}
          </div>

          {chartData.length >= 2 ? (
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c6ff00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c6ff00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }}
                    axisLine={false} tickLine={false} />
                  <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }}
                    axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{
                    background: "#111", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, fontSize: 12,
                  }} labelStyle={{ color: "#fff" }} />
                  <Area type="monotone" dataKey="weight" stroke="#C6FF00"
                    strokeWidth={2.5} fill="url(#weightGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-4 text-center text-[12px] text-text-dimmer">
              Añade al menos 2 pesajes para ver la gráfica
            </div>
          )}
        </GlassCard>
      )}

      {/* Registrar pesaje */}
      <GlassCard className="p-4">
        <div className="text-[13px] font-semibold">Registrar pesaje de hoy</div>
        <div className="mt-3 flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="number"
            inputMode="decimal"
            placeholder="Ej. 80.5 kg"
            className="flex-1 rounded-[10px] border border-border bg-glass px-3.5 py-2.5 text-[14px] outline-none focus:border-accent"
          />
          <PillButton onClick={submit} disabled={!value.trim()}>Guardar</PillButton>
        </div>
      </GlassCard>

      {/* Pasos — solo si hay datos */}
      {stepsData.length > 0 && (
        <GlassCard className="p-4">
          <div className="mb-3 text-[13px] font-semibold">Pasos — últimos 7 días</div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stepsData} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }}
                  axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{
                  background: "#111", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, fontSize: 12,
                }} labelStyle={{ color: "#fff" }} />
                <Area type="monotone" dataKey="steps" stroke="#34d399"
                  strokeWidth={2} fill="url(#stepsGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Historial de pesajes */}
      {weighIns.length > 0 && (
        <GlassCard className="p-4">
          <div className="mb-3 text-[13px] font-semibold">Historial de pesajes</div>
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
            {[...weighIns].reverse().map((w, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[13px] text-text-dim">{isoToLabel(w.date)}</span>
                <span className="tabular-nums text-[13px] font-semibold">{w.weight} kg</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Fotos de progreso */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-[14px] font-bold">Fotos de progreso</div>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-black"
          >
            + Añadir
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {progressPhotos.length === 0 ? (
          <GlassCard className="p-5 text-center">
            <div className="text-[28px] mb-2">📸</div>
            <div className="text-[13px] font-semibold">Sin fotos todavía</div>
            <div className="text-[11.5px] text-text-dim mt-1">
              Toma tu primera foto hoy. En 30, 90 y 180 días verás el cambio.
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 rounded-full border border-border-strong px-5 py-2.5 text-[12px] font-semibold"
            >
              Tomar foto
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {progressPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square overflow-hidden rounded-[14px] border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.dataUrl} alt="Progreso" className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                  <div className="text-[9px] text-white/80">{isoToLabel(photo.date)}</div>
                </div>
                {confirmDeleteId === photo.id ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 p-2">
                    <div className="text-[10px] text-white text-center">¿Eliminar?</div>
                    <div className="flex gap-1">
                      <button onClick={() => { removeProgressPhoto(photo.id); setConfirmDeleteId(null); }}
                        className="rounded-full bg-danger px-2 py-1 text-[10px] font-bold text-white">
                        Sí
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        className="rounded-full border border-border px-2 py-1 text-[10px]">
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(photo.id)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] text-white"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}
