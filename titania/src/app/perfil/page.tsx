"use client";

import { useRouter } from "next/navigation";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { TitanAvatar } from "@/components/ui/TitanAvatar";

const FIELD_LABELS: Record<string, string> = {
  goal: "Objetivo",
  trainingDays: "Días de entrenamiento",
  equipment: "Material disponible",
  injury: "Lesiones",
  supermarket: "Supermercado",
};

export default function PerfilPage() {
  const router = useRouter();
  const ready = useRequireOnboarding();
  const profile = useTitanStore((s) => s.profile);
  const resetOnboarding = useTitanStore((s) => s.resetOnboarding);

  function handleReset() {
    if (confirm("Esto reinicia tu perfil y vuelve a empezar el onboarding. ¿Continuar?")) {
      resetOnboarding();
      router.push("/onboarding");
    }
  }

  if (!ready) return null;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-[110px]">
      <ScreenHeader title="Tu perfil" subtitle="Esto es lo que Titan sabe de ti" />

      <div className="flex items-center gap-3 rounded-[20px] border border-border bg-glass p-4">
        <TitanAvatar size={44} />
        <div>
          <div className="text-[14px] font-bold">Entrenado por Titan</div>
          <div className="text-[12px] text-text-dim">Perfil permanente</div>
        </div>
      </div>

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
