"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTitanStore, type Challenge } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";

type ChallengeType = "daily" | "weekly" | "monthly";

const TYPE_LABELS: Record<ChallengeType, string> = {
  daily: "Diarios",
  weekly: "Semanales",
  monthly: "Mensuales",
};

const TYPE_COLORS: Record<ChallengeType, string> = {
  daily: "text-success",
  weekly: "text-blue",
  monthly: "text-purple",
};

const TYPE_BG: Record<ChallengeType, string> = {
  daily: "bg-success-dim border-success/30",
  weekly: "bg-blue-dim border-blue/30",
  monthly: "bg-purple-dim border-purple/30",
};

export default function RetosPage() {
  const ready = useRequireOnboarding();
  const challenges = useTitanStore((s) => s.challenges);
  const [filter, setFilter] = useState<ChallengeType | "all">("all");

  if (!ready) return null;

  const filtered =
    filter === "all" ? challenges : challenges.filter((c) => c.type === filter);

  const totalXp = challenges
    .filter((c) => c.completed)
    .reduce((sum, c) => sum + c.xpReward, 0);

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[110px]">
      <ScreenHeader
        title="Retos"
        subtitle={`${completedCount}/${challenges.length} completados · +${totalXp} XP ganado`}
      />

      {/* Resumen */}
      <div className="flex gap-2.5">
        {(["daily", "weekly", "monthly"] as ChallengeType[]).map((type) => {
            const group = challenges.filter((c: Challenge) => c.type === type);
            const done = group.filter((c: Challenge) => c.completed).length;
          return (
            <div
              key={type}
              className={`flex-1 rounded-[18px] border p-3.5 ${TYPE_BG[type]}`}
            >
              <div className={`text-[20px] font-extrabold tabular-nums ${TYPE_COLORS[type]}`}>
                {done}/{group.length}
              </div>
              <div className="mt-0.5 text-[10px] font-bold text-text-dim">
                {TYPE_LABELS[type]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(["all", "daily", "weekly", "monthly"] as (ChallengeType | "all")[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
              filter === f
                ? "bg-accent text-black"
                : "border border-border bg-glass text-text-dim"
            }`}
          >
            {f === "all" ? "Todos" : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Lista de retos */}
      <div className="flex flex-col gap-3">
        {filtered.map((challenge: Challenge, i: number) => {
          const pct = Math.min(
            Math.round((challenge.progress / challenge.target) * 100),
            100
          );
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard
                className={`p-4 ${
                  challenge.completed ? "border-accent/30 bg-accent-dim" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${TYPE_BG[challenge.type as ChallengeType]} ${TYPE_COLORS[challenge.type as ChallengeType]}`}
                        >
                          {TYPE_LABELS[challenge.type as ChallengeType]}
                      </span>
                      {challenge.completed && (
                        <span className="text-[10px] font-bold text-accent">✓ Completado</span>
                      )}
                    </div>
                    <div className="mt-1.5 text-[15px] font-bold">{challenge.title}</div>
                    <div className="mt-0.5 text-[12px] text-text-dim">
                      {challenge.description}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[14px] font-extrabold text-accent">
                      +{challenge.xpReward}
                    </div>
                    <div className="text-[10px] text-text-dimmer">XP</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] text-text-dim">
                      {challenge.progress.toLocaleString("es")} / {challenge.target.toLocaleString("es")} {challenge.unit}
                    </span>
                    <span className="text-[11px] font-bold">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={`h-full rounded-full ${challenge.completed ? "bg-accent" : "bg-white/40"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <TabBar />
    </div>
  );
}
