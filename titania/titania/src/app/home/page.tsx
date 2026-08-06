"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTitanStore, xpToLevel } from "@/lib/store";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { TitanAvatar } from "@/components/ui/TitanAvatar";
import { AchievementToast } from "@/components/ui/AchievementToast";

function RingProgress({
  pct,
  size = 68,
  stroke = 6,
  color = "var(--color-accent)",
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none"
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="ring-progress transition-all duration-700"
      />
    </svg>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const router = useRouter();
  const {
    onboardingCompleted,
    profile,
    todayWorkout,
    dailyStats,
    xp,
    streak,
    userRankPosition,
    userCommitmentIndex,
    challenges,
  } = useTitanStore();

  useEffect(() => {
    if (!onboardingCompleted) router.replace("/onboarding");
  }, [onboardingCompleted, router]);

  if (!onboardingCompleted) return null;

  const { level } = xpToLevel(xp);
  const firstName = profile.name?.split(" ")[0] ?? "Campeón";
  const hour = new Date().getHours();
  const greeting =
    hour < 13 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";

  const targetKcal = 2200;
  const targetProtein = 160;
  const targetWater = 2.5;
  const targetSteps = 10000;
  const completedMealsKcal = 1720;
  const completedProtein = 123;

  const dailyChallenges = challenges
    .filter((c) => c.type === "daily" && !c.completed)
    .slice(0, 3);

  return (
    <>
      <AchievementToast />
      <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[110px] pt-1">

        {/* Header */}
        <motion.div {...fadeUp} transition={{ duration: 0.35 }} className="px-1 pt-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[13px] font-semibold text-text-dim">{greeting}</div>
              <div className="mt-0.5 text-[28px] font-extrabold tracking-[-0.5px]">
                {firstName} 👋
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div
                onClick={() => router.push("/perfil")}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-accent font-extrabold text-black text-[14px]"
              >
                {firstName[0]?.toUpperCase()}
              </div>
              <div className="text-[11px] font-bold text-text-dim">Nv. {level}</div>
            </div>
          </div>

          {/* Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-orange/30 bg-orange-dim px-3 py-1.5">
              <span className="text-[13px]">🔥</span>
              <span className="text-[12px] font-bold text-orange">{streak} días</span>
            </div>
            <button
              onClick={() => router.push("/ranking")}
              className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-dim px-3 py-1.5"
            >
              <span className="text-[12px] font-bold text-accent">#{userRankPosition} amigos</span>
            </button>
            <div className="flex items-center gap-1.5 rounded-full border border-purple/30 bg-purple-dim px-3 py-1.5">
              <span className="text-[12px] font-bold text-purple">{userCommitmentIndex}% índice</span>
            </div>
          </div>
        </motion.div>

        {/* Rings de actividad */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.05 }}>
          <GlassCard className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[14px] font-bold">Actividad de hoy</div>
              <div className="text-[11px] text-text-dim">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
            <div className="flex items-center justify-around">
              {[
                {
                  icon: "🔥",
                  color: "var(--color-orange)",
                  pct: Math.round((completedMealsKcal / targetKcal) * 100),
                  value: String(completedMealsKcal),
                  label: `de ${targetKcal}`,
                  unit: "kcal",
                },
                {
                  icon: "💪",
                  color: "var(--color-blue)",
                  pct: Math.round((completedProtein / targetProtein) * 100),
                  value: `${completedProtein}g`,
                  label: `de ${targetProtein}g`,
                  unit: "prot.",
                },
                {
                  icon: "💧",
                  color: "var(--color-blue)",
                  pct: Math.round((dailyStats.water / targetWater) * 100),
                  value: `${dailyStats.water}L`,
                  label: `de ${targetWater}L`,
                  unit: "agua",
                },
                {
                  icon: "👣",
                  color: "var(--color-success)",
                  pct: Math.round((dailyStats.steps / targetSteps) * 100),
                  value: dailyStats.steps.toLocaleString("es"),
                  label: "de 10k",
                  unit: "pasos",
                },
              ].map((ring) => (
                <div key={ring.unit} className="flex flex-col items-center gap-1.5">
                  <div className="relative">
                    <RingProgress pct={ring.pct} color={ring.color} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px]">{ring.icon}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="tabular-nums text-[13px] font-extrabold">{ring.value}</div>
                    <div className="text-[9px] text-text-dim">{ring.label} {ring.unit}</div>
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
            className="relative flex min-h-[180px] w-full flex-col justify-end overflow-hidden rounded-[28px] p-5 text-left"
            style={{
              background: "linear-gradient(145deg, #1c1c1e 0%, #0d0d0d 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="absolute right-5 top-5 rounded-full border border-accent/30 bg-accent-dim px-3 py-1 text-[11px] font-bold text-accent">
              {todayWorkout.completed ? "✓ Completado" : "Hoy"}
            </div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[1.2px] text-accent/70">
              Entrenamiento de hoy
            </div>
            <div className="text-[22px] font-extrabold tracking-[-0.3px]">
              {todayWorkout.title}
            </div>
            <div className="mt-1 text-[13px] text-text-dim">{todayWorkout.meta}</div>
            <div className="mt-4 flex items-center gap-2">
              <div className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold text-black">
                {todayWorkout.completed ? "Ver entreno" : "Empezar"}
              </div>
              <div className="text-[12px] text-text-dimmer">
                {todayWorkout.exercises.length} ejercicios
              </div>
            </div>
          </button>
        </motion.div>

        {/* Retos diarios */}
        {dailyChallenges.length > 0 && (
          <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.15 }}>
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="text-[14px] font-bold">Retos de hoy</div>
              <button
                onClick={() => router.push("/retos")}
                className="text-[12px] text-accent"
              >
                Ver todos →
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {dailyChallenges.map((c) => {
                const pct = Math.min(
                  Math.round((c.progress / c.target) * 100),
                  100
                );
                return (
                  <GlassCard key={c.id} className="p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold">{c.title}</div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-accent transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="tabular-nums text-[12px] font-bold text-accent">
                          +{c.xpReward} XP
                        </div>
                        <div className="text-[10px] text-text-dimmer">{pct}%</div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Stats rápidos */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.2 }}>
          <button
            onClick={() => router.push("/progreso")}
            className="w-full text-left"
          >
            <div className="flex gap-2.5">
              {[
                {
                  icon: "💧",
                  value: `${dailyStats.water}L`,
                  label: `de ${targetWater}L`,
                  pct: Math.round((dailyStats.water / targetWater) * 100),
                },
                {
                  icon: "👣",
                  value: dailyStats.steps.toLocaleString("es"),
                  label: "pasos hoy",
                  pct: Math.round((dailyStats.steps / targetSteps) * 100),
                },
                {
                  icon: "🌙",
                  value: `${dailyStats.sleepHours}h`,
                  label: "de sueño",
                  pct: Math.round((dailyStats.sleepHours / 8) * 100),
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-[18px] border border-border bg-glass px-3 py-4"
                >
                  <div className="text-[16px]">{s.icon}</div>
                  <div className="tabular-nums mt-2 text-[18px] font-extrabold">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold text-text-dim">
                    {s.label}
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </button>
        </motion.div>

        {/* Mensaje Titan */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.25 }}>
          <button
            onClick={() => router.push("/titan")}
            className="w-full text-left"
          >
            <GlassCard className="p-4">
              <div className="flex items-start gap-3">
                <TitanAvatar size={36} pulse />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-[11px] font-bold tracking-[0.3px] text-accent">
                    Titan · IA
                  </div>
                  <p className="text-[13.5px] leading-[1.55] text-white/88">
                    Hoy puedes subir posiciones en el ranking. Necesitas{" "}
                    {Math.max(0, targetProtein - completedProtein)}g más de
                    proteína y completar el entreno. ¡Venga! 💪
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
