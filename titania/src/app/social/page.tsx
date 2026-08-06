"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTitanStore, type FeedItem, type Friend } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";

type SocialTab = "feed" | "amigos" | "duelos";

export default function SocialPage() {
  const ready = useRequireOnboarding();
  const friends = useTitanStore((s) => s.friends);
  const feed = useTitanStore((s) => s.feed);
  const [tab, setTab] = useState<SocialTab>("feed");

  if (!ready) return null;

  const tabs: { id: SocialTab; label: string; icon: string }[] = [
    { id: "feed", label: "Actividad", icon: "📡" },
    { id: "amigos", label: "Amigos", icon: "👥" },
    { id: "duelos", label: "Duelos", icon: "⚔️" },
  ];

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[110px]">
      <ScreenHeader title="Social" subtitle="Tu comunidad de entrenamiento" />

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

      {/* Feed */}
      {tab === "feed" && (
        <div className="flex flex-col gap-2">
          {feed.map((item: FeedItem, i: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="flex items-start gap-3 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-glass text-sm font-bold">
                  {item.userName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px]">
                    <span className="font-semibold">{item.userName}</span>{" "}
                    <span className="text-text-dim">{item.action}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-dimmer">
                    {item.timestamp}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Amigos */}
      {tab === "amigos" && (
        <div className="flex flex-col gap-3">
          {/* Buscar */}
          <div className="relative">
            <input
              placeholder="Buscar usuario..."
              className="w-full rounded-full border border-border bg-glass px-5 py-3 text-[14px] text-text placeholder:text-text-dimmer outline-none focus:border-accent"
            />
          </div>

          {/* Lista */}
          {friends.map((f: Friend, i: number) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="flex items-center gap-3 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-glass text-[14px] font-bold">
                  {f.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold">{f.name}</div>
                  <div className="text-[11px] text-text-dim">
                    Nv. {f.level} · 🔥 {f.streak} días · {f.commitmentIndex}% índice
                  </div>
                </div>
                <button className="rounded-full border border-border-strong px-3 py-1.5 text-[11px] font-semibold text-text-dim">
                  Ver
                </button>
              </GlassCard>
            </motion.div>
          ))}

          {/* Invitar */}
          <GlassCard className="flex flex-col items-center gap-2 p-5 text-center">
            <div className="text-[32px]">👥</div>
            <div className="text-[14px] font-bold">Invita a tus amigos</div>
            <div className="text-[12px] text-text-dim">
              Compite con ellos y motívate mutuamente
            </div>
            <div className="mt-2 flex gap-2">
              <button className="rounded-full bg-accent px-5 py-2.5 text-[12px] font-bold text-black">
                Invitar por enlace
              </button>
              <button className="rounded-full border border-border-strong px-4 py-2.5 text-[12px] font-semibold">
                QR
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Duelos */}
      {tab === "duelos" && (
        <div className="flex flex-col gap-3">
          {/* Info */}
          <GlassCard className="p-4">
            <div className="text-[13px] font-bold">⚔️ Duelos de fin de semana</div>
            <div className="mt-1 text-[12px] text-text-dim">
              Los duelos están disponibles únicamente sábado y domingo. Elige un rival entre tus amigos y compite en tiempo real.
            </div>
          </GlassCard>

          {/* Tipos de duelo */}
          <div className="text-[12px] font-bold text-text-dim px-1">Tipos disponibles</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Dominadas", "Flexiones", "Sentadillas", "Abdominales",
              "Burpees", "5 km", "10 km", "Pasos",
              "Calorías", "Tiempo entreno", "Distancia ciclismo", "Volumen total",
            ].map((type) => (
              <GlassCard key={type} className="flex items-center gap-2 p-3">
                <div className="text-[13px] font-semibold">{type}</div>
              </GlassCard>
            ))}
          </div>

          {/* CTA */}
          <GlassCard className="flex flex-col items-center gap-2 p-5 text-center">
            <div className="text-[32px]">🏆</div>
            <div className="text-[14px] font-bold">Lanza un duelo</div>
            <div className="text-[12px] text-text-dim">
              Disponible el próximo fin de semana
            </div>
            <button
              disabled
              className="mt-2 rounded-full bg-accent/40 px-6 py-3 text-[13px] font-bold text-black/60 cursor-not-allowed"
            >
              Disponible el sábado
            </button>
          </GlassCard>
        </div>
      )}

      <TabBar />
    </div>
  );
}
