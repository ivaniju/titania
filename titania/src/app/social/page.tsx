"use client";

import { useMemo, useState } from "react";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { MOCK_FRIENDS, MOCK_FEED } from "@/lib/data/social";
import { ScreenHeader } from "@/components/ScreenHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/PillButton";
import { clsx } from "clsx";

type RankingScope = "Amigos" | "Ciudad" | "Global";
const SCOPES: RankingScope[] = ["Amigos", "Ciudad", "Global"];

export default function SocialPage() {
  const ready = useRequireOnboarding();
  const [tab, setTab] = useState<"Ranking" | "Amigos" | "Actividad">("Ranking");
  const [scope, setScope] = useState<RankingScope>("Amigos");
  const friendIds = useTitanStore((s) => s.friendIds);
  const addFriend = useTitanStore((s) => s.addFriend);
  const removeFriend = useTitanStore((s) => s.removeFriend);
  const xp = useTitanStore((s) => s.xp);
  const profile = useTitanStore((s) => s.profile);

  const myEngagement = Math.min(100, Math.round(xp / 20));

  const ranking = useMemo(() => {
    const pool =
      scope === "Amigos"
        ? MOCK_FRIENDS.filter((f) => friendIds.includes(f.id))
        : scope === "Ciudad"
        ? MOCK_FRIENDS.filter((f) => f.city === "Barcelona")
        : MOCK_FRIENDS;
    const me = { id: "me", name: profile.name || "Tú", avatar: "🙂", engagementScore: myEngagement };
    return [...pool, me].sort((a, b) => b.engagementScore - a.engagementScore);
  }, [scope, friendIds, myEngagement, profile.name]);

  if (!ready) return null;

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-5 pb-14">
      <ScreenHeader title="Social" subtitle="Amigos, ranking y actividad reciente" />

      <p className="rounded-2xl border border-border-strong bg-accent-dim px-3.5 py-2.5 text-[11px] leading-snug text-text-dim">
        ⚠️ Sección de ejemplo: amigos y rankings usan datos simulados localmente, ya que el
        proyecto todavía no tiene backend multiusuario.
      </p>

      <div className="flex gap-2 rounded-full border border-border bg-glass p-1">
        {(["Ranking", "Amigos", "Actividad"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "flex-1 rounded-full py-2 text-[12.5px] font-bold transition-colors",
              tab === t ? "bg-accent text-black" : "text-text-dim"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Ranking" && (
        <>
          <div className="flex gap-2">
            {SCOPES.map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={clsx(
                  "rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold",
                  scope === s ? "border-accent text-accent" : "border-border text-text-dim"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <GlassCard className="divide-y divide-border p-1">
            {ranking.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="w-5 text-[13px] font-bold text-text-dim">{i + 1}</span>
                <span className="text-[20px]">{r.avatar}</span>
                <span className={clsx("flex-1 text-[13.5px] font-semibold", r.id === "me" && "text-accent")}>
                  {r.name}
                </span>
                <span className="text-[12px] font-bold text-text-dim">{r.engagementScore}%</span>
              </div>
            ))}
          </GlassCard>
        </>
      )}

      {tab === "Amigos" && (
        <div className="flex flex-col gap-2.5">
          {MOCK_FRIENDS.map((f) => {
            const isFriend = friendIds.includes(f.id);
            return (
              <GlassCard key={f.id} className="flex items-center gap-3 p-3.5">
                <span className="text-[24px]">{f.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold">{f.name}</div>
                  <div className="text-[11px] text-text-dim">
                    Nivel {f.level} · 🔥 {f.streak} · {f.city}
                  </div>
                </div>
                <PillButton
                  variant={isFriend ? "secondary" : "primary"}
                  className="px-3.5 py-2 text-[11.5px]"
                  onClick={() => (isFriend ? removeFriend(f.id) : addFriend(f.id))}
                >
                  {isFriend ? "Amigos" : "Añadir"}
                </PillButton>
              </GlassCard>
            );
          })}
          <GlassCard className="p-3.5 text-center text-[12px] text-text-dim">
            Invita por enlace o código QR próximamente
          </GlassCard>
        </div>
      )}

      {tab === "Actividad" && (
        <div className="flex flex-col gap-2.5">
          {MOCK_FEED.map((e) => (
            <GlassCard key={e.id} className="flex items-center gap-3 p-3.5">
              <span className="text-[20px]">{e.avatar}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px]">
                  <span className="font-bold">{e.actor}</span> {e.text}
                </div>
                <div className="text-[10.5px] text-text-dimmer">{e.timeAgo}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
