"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTitanStore, xpToLevel, type HealthSource } from "@/lib/store";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { TitanAvatar } from "@/components/ui/TitanAvatar";
import { AchievementToast } from "@/components/ui/AchievementToast";

function RingProgress({
  pct, size = 68, stroke = 6, color = "var(--color-accent)",
}: {
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

const SOURCE_LABELS: Record<HealthSource, string> = {
  apple_health: "Apple Health",
  health_connect: "Health Connect",
  manual: "Manual",
  none: "Sin conectar",
};

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function HomePage() {
  const router = useRouter();
  const onboardingCompleted = useTitanStore((s) => s.onboardingCompleted);
  const profile = useTitanStore((s) => s.profile);
  const todayWorkout = useTitanStore((s) => s.todayWorkout);
  const dailyStats = useTitanStore((s) => s.dailyStats);
  const xp = useTitanStore((s) => s.xp);
  const streak = useTitanStore((s) => s.streak);
  const challenges = useTitanStore((s) => s.challenges);
  const healthSource = useTitanStore((s) => s.healthSource);
  const userCommitmentIndex = useTitanStore((s) => s.userCommitmentIndex);
  const friends = useTitanStore((s) => s.friends);
  const updateStreak = useTitanStore((s) => s.updateStreak);

  useEffect(() => {
    if (!onboardingCompleted) router.replace("/onboarding");
    else updateStreak();
  }, [onboardingCompleted, router, updateStreak]);

  if (!onboardingCompleted) return null;

  const { level } = xpToLevel(xp);
  const firstName = profile.name?.split(" ")[0] ?? "Campeón";
  const hour = new Date().getHours();
  const greeting = hour < 13 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  const dateStr = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  // Targets based on profile
  const targetKcal = 2200;
  const targetProtein = parseInt(profile.weight ?? "70") * 2;
  const targetWater = 2.5;
  const targetSteps = 10000;

  const dailyChallenges = challenges.filter((c) => c.type === "daily" && !c.completed).slice(0, 2);
  const watchConnected = healthSource !== "none";

  return (
    <>
      <AchievementToast />
      <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[100px] pt-1">

        {/* Header */}
        <motion.div {...fadeUp} transition={{ duration: 0.35 }} className="px-1 pt-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[13px] font-semibold text-text-dim capitalize">{dateStr}</div>
              <div className="mt-0.5 text-[28px] font-extrabold tracking-[-0.5px]">
                {greeting}, {firstName} 👋
              </div>
            </div>
            <button
              onClick={() => router.push("/perfil")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-extrabold text-black text-[15px] mt-1"
            >
              {firstName[0]?.toUpperCase()}
            </button>
          </div>

          {/* Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-orange/30 bg-orange-dim px-3 py-1.5">
                <span className="text-[13px]">🔥</span>
                <span className="text-[12px] font-bold text-orange">{streak} día{streak !== 1 ? "s" : ""}</span>
              </div>
            )}
            {friends.length > 0 && (
              <button
                onClick={() => router.push("/ranking")}
                className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-dim px-3 py-1.5"
              >
                <span className="text-[12px] font-bold text-accent">👥 {friends.filter(f => f.status === "accepted").length} amigos</span>
              </button>
            )}
            {userCommitmentIndex > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-purple/30 bg-purple-dim px-3 py-1.5">
                <span className="text-[12px] font-bold text-purple">{userCommitmentIndex}% índice</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full border border-blue/30 bg-blue-dim px-3 py-1.5">
              <span className="text-[12px] font-bold text-blue">Nv. {level}</span>
            </div>
          </div>
        </motion.div>

        {/* Health connect banner */}
        {!watchConnected && (
          <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.03 }}>
            <button
              onClick={() => router.push("/perfil?tab=salud")}
              className="flex w-full items-center gap-3 rounded-[20px] border border-warning/30 bg-warning-dim p-4 text-left"
            >
              <span className="text-[22px]">⌚</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-warning">Conecta tu reloj inteligente</div>
                <div className="text-[11.5px] text-text-dim mt-0.5">
                  Sin reloj, no puedes confirmar retos ni sumar puntos por actividad
                </div>
              </div>
              <span className="text-[12px] text-warning shrink-0">→</span>
            </button>
          </motion.div>
        )}

        {/* Actividad de hoy */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.05 }}>
          <GlassCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[14px] font-bold">Actividad de hoy</div>
              {watchConnected && (
                <div className="flex items-center gap-1 rounded-full border border-success/30 bg-success-dim px-2.5 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-[10px] font-semibold text-success">{SOURCE_LABELS[healthSource]}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-around">
              {[
                {
                  icon: "🔥", color: "var(--color-orange)",
                  pct: Math.min(Math.round((dailyStats.caloriesBurned / 500) * 100), 100),
                  value: String(dailyStats.caloriesBurned),
                  label: "kcal quemadas",
                },
                {
                  icon: "💧", color: "var(--color-blue)",
                  pct: Math.min(Math.round((dailyStats.water / targetWater) * 100), 100),
                  value: `${dailyStats.water.toFixed(1)}L`,
                  label: `de ${targetWater}L`,
                },
                {
                  icon: "👣", color: "var(--color-success)",
                  pct: Math.min(Math.round((dailyStats.steps / targetSteps) * 100), 100),
                  value: dailyStats.steps.toLocaleString("es"),
                  label: "pasos",
                },
                {
                  icon: "💪", color: "var(--color-accent)",
                  pct: Math.min(Math.round((dailyStats.proteinGrams / targetProtein) * 100), 100),
                  value: `${dailyStats.proteinGrams}g`,
                  label: `de ${targetProtein}g`,
                },
              ].map((ring) => (
                <div key={ring.label} className="flex flex-col items-center gap-1.5">
                  <div className="relative">
                    <RingProgress pct={ring.pct} color={ring.color} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px]">{ring.icon}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="tabular-nums text-[13px] font-extrabold">{ring.value}</div>
                    <div className="text-[9px] text-text-dim">{ring.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Entrenamiento de hoy */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.1 }}>
          <button
            onClick={() => router.push("/entrenamiento")}
            className="relative flex min-h-[168px] w-full flex-col justify-end overflow-hidden rounded-[28px] p-5 text-left"
            style={{
              background: "linear-gradient(145deg, #1a1a1c 0%, #0d0d0d 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="absolute right-5 top-5 rounded-full border border-accent/30 bg-accent-dim px-3 py-1 text-[11px] font-bold text-accent">
              {todayWorkout.completed ? "✓ Completado" : "Hoy"}
            </div>
            <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[1.2px] text-accent/70">
              Entrenamiento de hoy
            </div>
            <div className="text-[21px] font-extrabold tracking-[-0.3px]">{todayWorkout.title}</div>
            <div className="mt-0.5 text-[12.5px] text-text-dim">{todayWorkout.meta}</div>
            <div className="mt-4 flex items-center gap-2">
              <div className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold text-black">
                {todayWorkout.completed ? "Ver entreno" : "Empezar"}
              </div>
              {todayWorkout.exercises.length > 0 && (
                <div className="text-[12px] text-text-dimmer">
                  {todayWorkout.exercises.length} ejercicios
                </div>
              )}
            </div>
          </button>
        </motion.div>

        {/* Retos pendientes */}
        {dailyChallenges.length > 0 && (
          <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.15 }}>
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="text-[14px] font-bold">Retos de hoy</div>
              <button onClick={() => router.push("/retos")} className="text-[12px] text-accent">
                Ver todos →
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {dailyChallenges.map((c) => {
                const pct = Math.min(Math.round((c.progress / c.target) * 100), 100);
                return (
                  <button
                    key={c.id}
                    onClick={() => router.push("/retos")}
                    className="w-full text-left"
                  >
                    <GlassCard className="p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold">{c.title}</span>
                            {c.requiresWatch && !watchConnected && (
                              <span className="text-[9px] font-bold text-warning bg-warning-dim border border-warning/30 rounded-full px-1.5 py-0.5">⌚</span>
                            )}
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-accent transition-all duration-500"
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="tabular-nums text-[12px] font-bold text-accent">+{c.xpReward} XP</div>
                          <div className="text-[10px] text-text-dimmer">{pct}%</div>
                        </div>
                      </div>
                    </GlassCard>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Stats rápidos + accesos rápidos */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.2 }}>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Agua */}
            <button onClick={() => router.push("/progreso")} className="text-left">
              <GlassCard className="p-3.5">
                <div className="text-[16px]">💧</div>
                <div className="tabular-nums mt-2 text-[20px] font-extrabold">
                  {dailyStats.water.toFixed(1)}L
                </div>
                <div className="mt-0.5 text-[10px] font-semibold text-text-dim">
                  de {targetWater}L agua
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-blue transition-all duration-700"
                    style={{ width: `${Math.min((dailyStats.water / targetWater) * 100, 100)}%` }} />
                </div>
              </GlassCard>
            </button>
            {/* Sueño */}
            <button onClick={() => router.push("/progreso")} className="text-left">
              <GlassCard className="p-3.5">
                <div className="text-[16px]">🌙</div>
                <div className="tabular-nums mt-2 text-[20px] font-extrabold">
                  {dailyStats.sleepHours > 0 ? `${dailyStats.sleepHours}h` : "—"}
                </div>
                <div className="mt-0.5 text-[10px] font-semibold text-text-dim">
                  {dailyStats.sleepHours > 0 ? "de sueño" : "Sin datos de sueño"}
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-purple transition-all duration-700"
                    style={{ width: `${Math.min((dailyStats.sleepHours / 8) * 100, 100)}%` }} />
                </div>
              </GlassCard>
            </button>
          </div>
        </motion.div>

        {/* Accesos rápidos */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.25 }}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "🛒", label: "Compra", href: "/compra" },
              { icon: "📊", label: "Ranking", href: "/ranking" },
              { icon: "⚔️", label: "Retos", href: "/retos" },
            ].map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center gap-2 rounded-[18px] border border-border bg-glass py-4 transition-all active:scale-[0.97]"
              >
                <span className="text-[24px]">{item.icon}</span>
                <span className="text-[11px] font-semibold text-text-dim">{item.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Titan IA */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.3 }}>
          <button onClick={() => router.push("/titan")} className="w-full text-left">
            <GlassCard className="p-4">
              <div className="flex items-start gap-3">
                <TitanAvatar size={36} pulse />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-[11px] font-bold tracking-[0.3px] text-accent">
                    Titan · IA
                  </div>
                  <p className="text-[13.5px] leading-[1.55] text-white/88">
                    {dailyStats.steps === 0 && dailyStats.water === 0
                      ? "Empieza el día registrando tu actividad. Pregúntame lo que necesites — estoy aquí para ayudarte a alcanzar tu objetivo. 💬"
                      : `Hoy llevas ${dailyStats.steps.toLocaleString("es")} pasos y ${dailyStats.water.toFixed(1)}L de agua. ${dailyStats.water < targetWater ? `Te faltan ${(targetWater - dailyStats.water).toFixed(1)}L para completar tu objetivo hídrico.` : "¡Hidratación completada! 💧"}`}
                  </p>
                </div>
              </div>
            </GlassCard>
          </button>
        </motion.div>

      </div>
      <TabBar />
    </>
  );
}
