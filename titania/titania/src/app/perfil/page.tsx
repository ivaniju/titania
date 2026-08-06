"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTitanStore, xpToLevel } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { XpBar } from "@/components/ui/XpBar";

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

function CalendarMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mon-based

  const cellStatus = (day: number) => {
    if (day > today.getDate()) return "future";
    if (day === today.getDate()) return "today";
    const r = Math.random();
    if (r > 0.6) return "perfect";
    if (r > 0.3) return "acceptable";
    return "inactive";
  };

  const cells = Array.from({ length: firstDay }, (_, i) => ({ key: `pad-${i}`, day: 0 }))
    .concat(Array.from({ length: daysInMonth }, (_, i) => ({ key: `${i + 1}`, day: i + 1 })));

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-text-dimmer">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ key, day }) => {
          if (!day) return <div key={key} />;
          const status = cellStatus(day);
          const bg =
            status === "perfect"
              ? "bg-success/70"
              : status === "acceptable"
              ? "bg-warning/70"
              : status === "inactive"
              ? "bg-danger/50"
              : status === "today"
              ? "bg-accent"
              : "bg-white/5";
          return (
            <div
              key={key}
              className={`flex h-7 items-center justify-center rounded-[7px] text-[11px] font-semibold ${bg} ${
                status === "today" ? "text-black" : "text-white"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-3">
        {[
          { color: "bg-success/70", label: "Día perfecto" },
          { color: "bg-warning/70", label: "Aceptable" },
          { color: "bg-danger/50", label: "Sin actividad" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-sm ${l.color}`} />
            <span className="text-[10px] text-text-dimmer">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const ready = useRequireOnboarding();
  const { profile, xp, streak, achievements, resetOnboarding } = useTitanStore();
  const { level } = xpToLevel(xp);

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);

  function handleReset() {
    if (confirm("Esto reinicia tu perfil y vuelve a empezar el onboarding. ¿Continuar?")) {
      resetOnboarding();
      router.push("/onboarding");
    }
  }

  if (!ready) return null;

  const firstName = profile.name ?? "Atleta";

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[110px] pt-4">

      {/* Avatar y nombre */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 pt-4"
      >
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
          <div className="text-[13px] text-text-dim">{profile.goal ?? "Fitness"}</div>
        </div>

        {/* XP Bar */}
        <XpBar xp={xp} className="w-full px-4" />

        {/* Stats rápidos */}
        <div className="mt-1 flex gap-4">
          {[
            { value: String(streak), label: "Racha", icon: "🔥" },
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
          { label: "Material", value: profile.equipment },
          { label: "Lesiones", value: profile.injury },
          { label: "Dieta", value: profile.dietPreference },
          { label: "Sueño", value: profile.sleepHours },
          { label: "Actividad diaria", value: profile.dailyActivity },
        ]
          .filter((row) => row.value)
          .map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[13px] text-text-dim">{label}</span>
              <span className="text-[13px] font-semibold">{value}</span>
            </div>
          ))}
      </GlassCard>

      {/* Calendario mensual */}
      <GlassCard className="p-4">
        <div className="mb-3 text-[14px] font-bold">
          {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </div>
        <CalendarMonth />
      </GlassCard>

      {/* Logros desbloqueados */}
      <div>
        <div className="mb-2 px-1 text-[14px] font-bold">Logros</div>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a) => (
            <GlassCard
              key={a.id}
              className={`flex flex-col items-center gap-1.5 p-3 text-center ${
                a.unlockedAt ? "" : "opacity-35"
              }`}
            >
              <div className="text-[24px]">{a.icon}</div>
              <div className="text-[11px] font-semibold leading-tight">{a.title}</div>
              {a.unlockedAt ? (
                <div className="text-[9px] text-accent font-bold">+{a.xpReward} XP</div>
              ) : (
                <div className="text-[9px] text-text-dimmer">🔒 Bloqueado</div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>

      <PillButton
        variant="secondary"
        className="mt-1 w-full py-3 text-center"
        onClick={handleReset}
      >
        Reiniciar perfil
      </PillButton>

      <TabBar />
    </div>
  );
}
