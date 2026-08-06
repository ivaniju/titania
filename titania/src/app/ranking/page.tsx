"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTitanStore, xpToLevel } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";

type Tab = "amigos" | "ciudad" | "global";

const GLOBAL_RANKING = [
  { id: "g1", name: "Ana S.", level: 14, commitmentIndex: 91, streak: 22, position: 1, delta: 0 },
  { id: "g2", name: "Marcos L.", level: 13, commitmentIndex: 88, streak: 18, position: 2, delta: 1 },
  { id: "g3", name: "Sara P.", level: 12, commitmentIndex: 86, streak: 14, position: 3, delta: -1 },
  { id: "g4", name: "Carlos M.", level: 12, commitmentIndex: 84, streak: 15, position: 4, delta: 2 },
  { id: "g5", name: "David F.", level: 11, commitmentIndex: 82, streak: 11, position: 5, delta: 0 },
  { id: "g6", name: "Laura G.", level: 10, commitmentIndex: 79, streak: 10, position: 6, delta: -2 },
];

const CITY_RANKING = [
  { id: "c1", name: "Javier M.", level: 15, commitmentIndex: 93, streak: 28, position: 1, delta: 0 },
  { id: "c2", name: "Elena R.", level: 13, commitmentIndex: 87, streak: 19, position: 2, delta: 1 },
  { id: "c3", name: "Roberto A.", level: 12, commitmentIndex: 85, streak: 16, position: 3, delta: 0 },
  { id: "c4", name: "María T.", level: 11, commitmentIndex: 81, streak: 12, position: 4, delta: -1 },
  { id: "c5", name: "Pablo C.", level: 10, commitmentIndex: 77, streak: 8, position: 5, delta: 2 },
];

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-[10px] text-text-dimmer">—</span>;
  return (
    <span
      className={`text-[10px] font-bold ${delta > 0 ? "text-success" : "text-danger"}`}
    >
      {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
    </span>
  );
}

function Medal({ pos }: { pos: number }) {
  if (pos === 1) return <span className="text-[18px]">🥇</span>;
  if (pos === 2) return <span className="text-[18px]">🥈</span>;
  if (pos === 3) return <span className="text-[18px]">🥉</span>;
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-[12px] font-bold text-text-dim">
      {pos}
    </div>
  );
}

export default function RankingPage() {
  const ready = useRequireOnboarding();
  const [tab, setTab] = useState<Tab>("amigos");
  const { friends, userRankPosition, userCommitmentIndex, xp, streak, profile } = useTitanStore();
  const { level } = xpToLevel(xp);
  const firstName = profile.name?.split(" ")[0] ?? "Tú";

  if (!ready) return null;

  const friendsRanking = [...friends]
    .sort((a, b) => b.commitmentIndex - a.commitmentIndex)
    .map((f, i) => ({ ...f, position: i + 1, delta: Math.floor(Math.random() * 3) - 1 }));

  // Insert the user at their position
  const meRow = {
    id: "me",
    name: `${firstName} (tú)`,
    level,
    commitmentIndex: userCommitmentIndex,
    streak,
    position: userRankPosition,
    delta: 0,
    isMe: true,
  };

  const rows =
    tab === "amigos"
      ? [...friendsRanking.slice(0, userRankPosition - 1), { ...meRow }, ...friendsRanking.slice(userRankPosition - 1)]
          .map((r, i) => ({ ...r, position: i + 1 }))
          .slice(0, 10)
      : tab === "ciudad"
      ? CITY_RANKING
      : GLOBAL_RANKING;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "amigos", label: "Amigos", icon: "👥" },
    { id: "ciudad", label: "Ciudad", icon: "🏙️" },
    { id: "global", label: "Global", icon: "🌍" },
  ];

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[110px]">
      <ScreenHeader
        title="Ranking"
        subtitle="Índice de compromiso diario"
      />

      {/* Info sobre índice */}
      <GlassCard className="p-4">
        <div className="text-[12px] font-bold text-text-dim mb-2">
          Índice de compromiso
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { label: "Entrenos", pct: 40, color: "bg-accent" },
            { label: "Nutrición", pct: 25, color: "bg-blue" },
            { label: "Pasos", pct: 15, color: "bg-success" },
            { label: "Hidrat.", pct: 10, color: "bg-orange" },
            { label: "Sueño", pct: 10, color: "bg-purple" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-[11px] font-bold">{item.pct}%</div>
              <div className={`mt-1 h-1.5 w-full rounded-full ${item.color} opacity-80`} />
              <div className="mt-1 text-[9px] text-text-dimmer">{item.label}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-full py-2.5 text-[12px] font-bold transition-all ${
              tab === t.id
                ? "bg-accent text-black"
                : "border border-border bg-glass text-text-dim"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Ranking list */}
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => {
          const isMe = "isMe" in row && row.isMe;
          return (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard
                className={`p-3.5 ${isMe ? "border-accent/50 bg-accent-dim" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Medal pos={row.position} />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-glass text-[12px] font-bold">
                    {row.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[14px] font-semibold ${isMe ? "text-accent" : ""}`}>
                      {row.name}
                    </div>
                    <div className="text-[11px] text-text-dim">
                      Nv. {row.level} · 🔥 {row.streak} días
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[15px] font-extrabold">{row.commitmentIndex}%</div>
                    <DeltaBadge delta={row.delta ?? 0} />
                  </div>
                </div>
                {/* Barra de índice */}
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isMe ? "bg-accent" : "bg-white/30"}`}
                    style={{ width: `${row.commitmentIndex}%` }}
                  />
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Temporada */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold">Temporada 1</div>
            <div className="text-[11px] text-text-dim">Finaliza en 42 días</div>
          </div>
          <div className="rounded-full border border-purple/30 bg-purple-dim px-3 py-1 text-[11px] font-bold text-purple">
            🏆 Recompensas exclusivas
          </div>
        </div>
      </GlassCard>

      <TabBar />
    </div>
  );
}
