"use client";

import { useRouter } from "next/navigation";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { levelFromXp } from "@/lib/gamification";
import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { TitanAvatar } from "@/components/ui/TitanAvatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NavCard } from "@/components/ui/NavCard";
import { CalendarMonth } from "@/components/perfil/CalendarMonth";

const FIELD_LABELS: Record<string, string> = {
  goal: "Objetivo",
  sportLevel: "Nivel deportivo",
  trainingDays: "Días de entrenamiento",
  equipment: "Material disponible",
  injury: "Lesiones",
  foodPreferences: "Preferencia alimentaria",
  supermarket: "Supermercado",
};

export default function PerfilPage() {
  const router = useRouter();
  const ready = useRequireOnboarding();
  const profile = useTitanStore((s) => s.profile);
  const resetOnboarding = useTitanStore((s) => s.resetOnboarding);
  const xp = useTitanStore((s) => s.xp);
  const streakDays = useTitanStore((s) => s.streakDays);
  const workoutsCompletedTotal = useTitanStore((s) => s.workoutsCompletedTotal);
  const unlockedAchievementIds = useTitanStore((s) => s.unlockedAchievementIds);
  const friendIds = useTitanStore((s) => s.friendIds);
  const calendarLog = useTitanStore((s) => s.calendarLog);

  function handleReset() {
    if (confirm("Esto reinicia tu perfil y vuelve a empezar el onboarding. ¿Continuar?")) {
      resetOnboarding();
      router.push("/onboarding");
    }
  }

  if (!ready) return null;

  const { level, xpIntoLevel, xpToNextLevel, progress } = levelFromXp(xp);

  const heightCm = Number(profile.height);
  const weightKg = Number(profile.weight);
  const bmi =
    heightCm > 0 && weightKg > 0 ? weightKg / Math.pow(heightCm / 100, 2) : null;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-[110px]">
      <ScreenHeader title="Tu perfil" subtitle="Esto es lo que Titan sabe de ti" />

      {/* Cabecera con nivel y XP */}
      <GlassCard strong className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <TitanAvatar size={52} />
          <div className="flex-1">
            <div className="text-[15px] font-extrabold">
              {profile.name || "Sin nombre"}
            </div>
            <div className="text-[12px] text-text-dim">Nivel {level} · {xp} XP</div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border-strong bg-glass px-3 py-1.5 text-[12px] font-bold text-accent">
            🔥 {streakDays}
          </div>
        </div>
        <div>
          <ProgressBar progress={progress} />
          <div className="mt-1.5 text-[11px] text-text-dim">
            {xpIntoLevel} / {xpToNextLevel} XP para el nivel {level + 1}
          </div>
        </div>
      </GlassCard>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-2.5">
        <GlassCard className="flex flex-col items-center gap-1 p-3.5">
          <div className="text-[16px] font-extrabold">{weightKg || "—"}</div>
          <div className="text-[10.5px] text-text-dim">Peso (kg)</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center gap-1 p-3.5">
          <div className="text-[16px] font-extrabold">{bmi ? bmi.toFixed(1) : "—"}</div>
          <div className="text-[10.5px] text-text-dim">IMC</div>
        </GlassCard>
        <GlassCard className="flex flex-col items-center gap-1 p-3.5">
          <div className="text-[16px] font-extrabold">{workoutsCompletedTotal}</div>
          <div className="text-[10.5px] text-text-dim">Entrenos</div>
        </GlassCard>
      </div>

      {/* Accesos */}
      <div className="grid grid-cols-2 gap-2.5">
        <NavCard href="/logros" icon="🏆" title="Logros" subtitle={`${unlockedAchievementIds.length}/${ACHIEVEMENTS.length} conseguidos`} />
        <NavCard href="/retos" icon="🎯" title="Retos" subtitle="Diarios, semanales y mensuales" />
        <NavCard href="/social" icon="🤝" title="Social" subtitle={`${friendIds.length} amigos`} />
        <NavCard href="/duelos" icon="⚔️" title="Duelos" subtitle="Sábado y domingo" />
      </div>

      {/* Calendario */}
      <GlassCard className="p-4">
        <CalendarMonth log={calendarLog} />
      </GlassCard>

      {/* Datos del onboarding */}
      <GlassCard className="divide-y divide-border p-1">
        {Object.entries(FIELD_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[13px] text-text-dim">{label}</span>
            <span className="text-[13px] font-semibold">
              {(profile as Record<string, string | undefined>)[key] ?? "—"}
            </span>
          </div>
        ))}
      </GlassCard>

      <PillButton
        variant="secondary"
        className="mt-1 w-full py-3 text-center"
        onClick={handleReset}
      >
        Reiniciar onboarding
      </PillButton>

      <TabBar />
    </div>
  );
}
