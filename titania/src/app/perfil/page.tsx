"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTitanStore, xpToLevel, type HealthSource } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { XpBar } from "@/components/ui/XpBar";

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

type ProfileTab = "perfil" | "salud" | "notificaciones";

function CalendarMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  // Only mark today as active — no fake data
  const cells = Array.from({ length: firstDay }, (_, i) => ({ key: `pad-${i}`, day: 0 }))
    .concat(Array.from({ length: daysInMonth }, (_, i) => ({ key: `${i + 1}`, day: i + 1 })));

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-text-dimmer">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ key, day }) => {
          if (!day) return <div key={key} />;
          const isToday = day === today.getDate();
          return (
            <div key={key}
              className={`flex h-7 items-center justify-center rounded-[7px] text-[11px] font-semibold ${
                isToday ? "bg-accent text-black" : "bg-white/5 text-white/50"
              }`}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HEALTH_SOURCES: { id: HealthSource; label: string; icon: string; desc: string; platform: string }[] = [
  {
    id: "apple_health",
    label: "Apple Health",
    icon: "❤️",
    desc: "Sincroniza pasos, calorías, sueño y distancia desde iPhone",
    platform: "iOS",
  },
  {
    id: "health_connect",
    label: "Health Connect",
    icon: "🤖",
    desc: "Integra datos de Google Fit, Samsung Health y otros en Android",
    platform: "Android",
  },
];

export default function PerfilPage() {
  const router = useRouter();
  const ready = useRequireOnboarding();
  const profile = useTitanStore((s) => s.profile);
  const xp = useTitanStore((s) => s.xp);
  const streak = useTitanStore((s) => s.streak);
  const achievements = useTitanStore((s) => s.achievements);
  const resetOnboarding = useTitanStore((s) => s.resetOnboarding);
  const healthSource = useTitanStore((s) => s.healthSource);
  const setHealthSource = useTitanStore((s) => s.setHealthSource);
  const notifications = useTitanStore((s) => s.notifications);
  const updateNotifications = useTitanStore((s) => s.updateNotifications);
  const { level } = xpToLevel(xp);
  const [activeTab, setActiveTab] = useState<ProfileTab>("perfil");

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);

  function handleReset() {
    if (confirm("Esto borrará todos tus datos y reiniciará la aplicación. ¿Continuar?")) {
      resetOnboarding();
      router.push("/onboarding");
    }
  }

  if (!ready) return null;

  const firstName = profile.name ?? "Atleta";

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[100px] pt-4">

      {/* Avatar y nombre */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 pt-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-[28px] font-extrabold text-black">
            {firstName[0]?.toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-glass-strong border border-border px-2 py-0.5 text-[10px] font-bold text-accent">
            Nv. {level}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[22px] font-extrabold">{firstName}</div>
          <div className="text-[13px] text-text-dim">{profile.goal ?? "Sin objetivo configurado"}</div>
        </div>
        <XpBar xp={xp} className="w-full px-4" />
        <div className="mt-1 flex gap-4">
          {[
            { value: streak > 0 ? String(streak) : "0", label: "Racha", icon: "🔥" },
            { value: String(unlockedAchievements.length), label: "Logros", icon: "🏆" },
            { value: level.toString(), label: "Nivel", icon: "⭐" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-0.5">
              <div className="text-[18px]">{s.icon}</div>
              <div className="text-[18px] font-extrabold tabular-nums">{s.value}</div>
              <div className="text-[10px] text-text-dim">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["perfil", "salud", "notificaciones"] as ProfileTab[]).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 rounded-full py-2 text-[11.5px] font-bold capitalize transition-all ${
              activeTab === t ? "bg-accent text-black" : "border border-border bg-glass text-text-dim"
            }`}>
            {t === "perfil" ? "Perfil" : t === "salud" ? "Salud" : "Avisos"}
          </button>
        ))}
      </div>

      {/* PERFIL */}
      {activeTab === "perfil" && (
        <>
          {/* Datos personales */}
          <GlassCard className="divide-y divide-border p-1">
            {[
              { label: "Objetivo", value: profile.goal },
              { label: "Nivel deportivo", value: profile.level },
              { label: "Edad", value: profile.age ? `${profile.age} años` : undefined },
              { label: "Sexo", value: profile.sex },
              { label: "Altura", value: profile.height ? `${profile.height} cm` : undefined },
              { label: "Peso actual", value: profile.weight ? `${profile.weight} kg` : undefined },
              { label: "Peso objetivo", value: profile.targetWeight },
              { label: "Días de entreno", value: profile.trainingDays },
              { label: "Lugar de entreno", value: profile.trainingPlace },
              { label: "Dieta", value: profile.dietPreference },
            ]
              .filter((row) => row.value)
              .map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-[13px] text-text-dim">{label}</span>
                  <span className="text-[13px] font-semibold">{value}</span>
                </div>
              ))}
          </GlassCard>

          {/* Calendario */}
          <GlassCard className="p-4">
            <div className="mb-3 text-[14px] font-bold">
              {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            </div>
            <CalendarMonth />
          </GlassCard>

          {/* Logros */}
          <div>
            <div className="mb-2 px-1 text-[14px] font-bold">Logros</div>
            <div className="grid grid-cols-3 gap-2">
              {achievements.map((a) => (
                <GlassCard key={a.id}
                  className={`flex flex-col items-center gap-1.5 p-3 text-center ${a.unlockedAt ? "" : "opacity-35"}`}>
                  <div className="text-[24px]">{a.icon}</div>
                  <div className="text-[11px] font-semibold leading-tight">{a.title}</div>
                  {a.unlockedAt ? (
                    <div className="text-[9px] text-accent font-bold">+{a.xpReward} XP</div>
                  ) : (
                    <div className="text-[9px] text-text-dimmer">🔒</div>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Reiniciar */}
          <button
            onClick={handleReset}
            className="w-full rounded-full border border-danger/30 bg-danger-dim py-3 text-[13px] font-bold text-danger"
          >
            Reiniciar perfil
          </button>
        </>
      )}

      {/* SALUD */}
      {activeTab === "salud" && (
        <div className="flex flex-col gap-3">
          <GlassCard className="p-4">
            <div className="text-[13px] font-bold mb-1">Fuente de datos de salud</div>
            <div className="text-[12px] text-text-dim leading-relaxed">
              Conecta tu reloj o app de salud para obtener pasos, calorías, sueño y distancia en tiempo real. Sin esto, los retos que requieren actividad física no se pueden completar.
            </div>
          </GlassCard>

          {HEALTH_SOURCES.map((src) => (
            <button
              key={src.id}
              onClick={() => setHealthSource(healthSource === src.id ? "none" : src.id)}
              className={`w-full rounded-[20px] border p-4 text-left transition-all ${
                healthSource === src.id
                  ? "border-accent/50 bg-accent-dim"
                  : "border-border bg-glass"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-[24px]">{src.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold">{src.label}</span>
                    <span className="text-[9px] font-bold text-text-dimmer border border-border rounded-full px-1.5 py-0.5">
                      {src.platform}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-text-dim">{src.desc}</div>
                </div>
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  healthSource === src.id ? "border-accent bg-accent text-black" : "border-border"
                }`}>
                  {healthSource === src.id && "✓"}
                </div>
              </div>
            </button>
          ))}

          {healthSource !== "none" && (
            <GlassCard className="p-4 border-success/30 bg-success-dim">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-[13px] font-semibold text-success">
                  {HEALTH_SOURCES.find((s) => s.id === healthSource)?.label} conectado
                </span>
              </div>
              <div className="mt-1 text-[11.5px] text-text-dim">
                Los datos de actividad se sincronizan automáticamente. Los retos marcados con ⌚ se confirmarán con datos reales.
              </div>
              <button
                onClick={() => setHealthSource("none")}
                className="mt-3 rounded-full border border-border-strong px-3 py-1.5 text-[11px] font-semibold text-text-dim"
              >
                Desconectar
              </button>
            </GlassCard>
          )}

          <GlassCard className="p-4">
            <div className="text-[12px] font-bold mb-2 text-text-dim">Nota de privacidad</div>
            <div className="text-[11.5px] text-text-dim leading-relaxed">
              Los datos de salud se procesan únicamente en tu dispositivo. Titania no envía tus datos biométricos a ningún servidor externo.
            </div>
          </GlassCard>
        </div>
      )}

      {/* NOTIFICACIONES */}
      {activeTab === "notificaciones" && (
        <div className="flex flex-col gap-3">
          {/* Master toggle */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-bold">Notificaciones</div>
                <div className="text-[11.5px] text-text-dim mt-0.5">
                  {notifications.enabled ? "Activadas" : "Desactivadas"}
                </div>
              </div>
              <button
                onClick={() => updateNotifications({ enabled: !notifications.enabled })}
                className={`relative h-7 w-12 rounded-full transition-all ${
                  notifications.enabled ? "bg-accent" : "bg-white/20"
                }`}
              >
                <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-black transition-all ${
                  notifications.enabled ? "left-[22px]" : "left-0.5"
                }`} />
              </button>
            </div>
          </GlassCard>

          {notifications.enabled && (
            <GlassCard className="divide-y divide-border p-1">
              {[
                { key: "remindFood" as const, label: "Recordatorio de comidas", icon: "🍽️" },
                { key: "remindWater" as const, label: "Recordatorio de hidratación", icon: "💧" },
                { key: "remindWorkout" as const, label: "Recordatorio de entreno", icon: "🏋️" },
                { key: "dailySummary" as const, label: "Resumen diario", icon: "📊" },
                { key: "weeklySummary" as const, label: "Resumen semanal", icon: "📅" },
                { key: "duelAvailable" as const, label: "Duelo disponible", icon: "⚔️" },
                { key: "friendSurpassed" as const, label: "Amigo te ha superado", icon: "👥" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span>{item.icon}</span>
                    <span className="text-[13px]">{item.label}</span>
                  </div>
                  <button
                    onClick={() => updateNotifications({ [item.key]: !notifications[item.key] })}
                    className={`relative h-6 w-10 rounded-full transition-all ${
                      notifications[item.key] ? "bg-accent" : "bg-white/20"
                    }`}
                  >
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-all ${
                      notifications[item.key] ? "left-[18px]" : "left-0.5"
                    }`} />
                  </button>
                </div>
              ))}
            </GlassCard>
          )}
        </div>
      )}

      <TabBar />
    </div>
  );
}
