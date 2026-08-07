"use client";

import { useState } from "react";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { MOCK_FRIENDS, DUEL_TYPES, type DuelType } from "@/lib/data/social";
import { ScreenHeader } from "@/components/ScreenHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { Chip } from "@/components/ui/Chip";
import { clsx } from "clsx";

function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export default function DuelosPage() {
  const ready = useRequireOnboarding();
  const friendIds = useTitanStore((s) => s.friendIds);
  const duels = useTitanStore((s) => s.duels);
  const startDuel = useTitanStore((s) => s.startDuel);
  const updateMyDuelScore = useTitanStore((s) => s.updateMyDuelScore);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DuelType>(DUEL_TYPES[0]);

  if (!ready) return null;

  const friends = MOCK_FRIENDS.filter((f) => friendIds.includes(f.id));
  const weekend = isWeekend();

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-14">
      <ScreenHeader title="Duelos" subtitle="Solo entre amigos, sábado y domingo" />

      {!weekend && (
        <p className="rounded-2xl border border-border-strong bg-glass px-3.5 py-2.5 text-[11.5px] leading-snug text-text-dim">
          Los duelos se disputan de sábado 00:00 a domingo 23:59. Puedes crear uno de práctica
          ahora mismo para probar cómo funciona.
        </p>
      )}

      <GlassCard className="flex flex-col gap-3 p-4">
        <div className="text-[13px] font-bold">Nuevo duelo</div>
        <div className="flex flex-wrap gap-2">
          {friends.map((f) => (
            <Chip
              key={f.id}
              label={`${f.avatar} ${f.name.split(" ")[0]}`}
              onClick={() => setSelectedFriend(f.id)}
            />
          ))}
        </div>
        {selectedFriend && (
          <>
            <div className="text-[12px] text-text-dim">Tipo de duelo</div>
            <div className="flex flex-wrap gap-2">
              {DUEL_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={clsx(
                    "rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                    selectedType === t ? "border-accent text-accent" : "border-border text-text-dim"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <PillButton
              className="mt-1 w-full py-3 text-center"
              onClick={() => {
                startDuel(selectedFriend, selectedType);
                setSelectedFriend(null);
              }}
            >
              Retar
            </PillButton>
          </>
        )}
      </GlassCard>

      <div className="flex flex-col gap-2.5">
        {duels.length === 0 && (
          <p className="px-1 text-[12px] text-text-dim">Todavía no tienes duelos. Reta a un amigo arriba.</p>
        )}
        {duels.map((d) => (
          <GlassCard key={d.id} className="flex flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold">{d.type} vs {d.opponentName}</div>
              <span
                className={clsx(
                  "rounded-full px-2.5 py-1 text-[10.5px] font-bold",
                  d.status === "ganado" && "bg-emerald-400/20 text-emerald-400",
                  d.status === "perdido" && "bg-red-400/20 text-red-400",
                  d.status === "en curso" && "bg-white/10 text-text-dim",
                  d.status === "empate" && "bg-amber-400/20 text-amber-400"
                )}
              >
                {d.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-text-dim">
              <span>Tú: {d.myScore}</span>
              <span>{d.opponentName}: {d.opponentScore}</span>
            </div>
            {d.status === "en curso" && (
              <div className="flex items-center gap-2">
                <PillButton
                  variant="secondary"
                  className="px-3.5 py-2 text-[11.5px]"
                  onClick={() => updateMyDuelScore(d.id, d.myScore + 1)}
                >
                  +1
                </PillButton>
                <PillButton
                  variant="secondary"
                  className="px-3.5 py-2 text-[11.5px]"
                  onClick={() => updateMyDuelScore(d.id, d.myScore + 5)}
                >
                  +5
                </PillButton>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
