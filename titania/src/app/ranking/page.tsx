"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTitanStore, xpToLevel, type Friend } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TabBar } from "@/components/TabBar";
import { GlassCard } from "@/components/ui/GlassCard";

type Tab = "ranking" | "amigos" | "duelos";

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
  const [tab, setTab] = useState<Tab>("ranking");
  const [newFriendName, setNewFriendName] = useState("");

  const friends = useTitanStore((s) => s.friends);
  const friendRequests = useTitanStore((s) => s.friendRequests);
  const sendFriendRequest = useTitanStore((s) => s.sendFriendRequest);
  const acceptFriendRequest = useTitanStore((s) => s.acceptFriendRequest);
  const removeFriend = useTitanStore((s) => s.removeFriend);
  const feed = useTitanStore((s) => s.feed);
  const xp = useTitanStore((s) => s.xp);
  const streak = useTitanStore((s) => s.streak);
  const profile = useTitanStore((s) => s.profile);
  const userCommitmentIndex = useTitanStore((s) => s.userCommitmentIndex);

  const { level } = xpToLevel(xp);
  const firstName = profile.name?.split(" ")[0] ?? "Tú";

  if (!ready) return null;

  const acceptedFriends = friends.filter((f) => f.status === "accepted");
  const pendingReceived = friendRequests.filter((r) => r.status === "pending_received");

  const meRow = {
    id: "me",
    name: `${firstName} (tú)`,
    level,
    commitmentIndex: userCommitmentIndex,
    streak,
    position: 0,
    isMe: true,
  };

  const rankRows = [
    meRow,
    ...acceptedFriends.map((f) => ({ ...f, isMe: false })),
  ]
    .sort((a, b) => b.commitmentIndex - a.commitmentIndex)
    .map((r, i) => ({ ...r, position: i + 1 }));

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "ranking", label: "Ranking", icon: "📊" },
    { id: "amigos", label: "Amigos", icon: "👥" },
    { id: "duelos", label: "Duelos", icon: "⚔️" },
  ];

  function handleAddFriend() {
    const name = newFriendName.trim();
    if (!name) return;
    sendFriendRequest(name);
    setNewFriendName("");
  }

  function handleRemove(friend: Friend) {
    if (confirm(`¿Eliminar a ${friend.name} de tus amigos?`)) {
      removeFriend(friend.id);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pb-[100px]">
      <ScreenHeader title="Social" subtitle="Amigos, ranking y duelos" back="/home" />

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

      {/* RANKING */}
      {tab === "ranking" && (
        <>
          {acceptedFriends.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <div className="text-[32px] mb-3">👥</div>
              <div className="text-[15px] font-bold">Sin amigos todavía</div>
              <div className="text-[12px] text-text-dim mt-1 leading-relaxed">
                El ranking solo existe entre amigos reales.
                Invita a alguien para competir juntos.
              </div>
              <button
                onClick={() => setTab("amigos")}
                className="mt-4 rounded-full bg-accent px-5 py-2.5 text-[12px] font-bold text-black"
              >
                Añadir amigos
              </button>
            </GlassCard>
          ) : (
            <>
              <GlassCard className="p-4">
                <div className="text-[11px] font-bold text-text-dim mb-2">
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

              <div className="flex flex-col gap-2">
                {rankRows.map((row, i) => (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard
                      className={`p-3.5 ${row.isMe ? "border-accent/50 bg-accent-dim" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <Medal pos={row.position} />
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-strong bg-glass text-[12px] font-bold">
                          {row.name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[14px] font-semibold ${
                              row.isMe ? "text-accent" : ""
                            }`}
                          >
                            {row.name}
                          </div>
                          <div className="text-[11px] text-text-dim">
                            Nv. {row.level} · 🔥 {row.streak} días
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[15px] font-extrabold">
                            {row.commitmentIndex}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/8">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            row.isMe ? "bg-accent" : "bg-white/30"
                          }`}
                          style={{ width: `${row.commitmentIndex}%` }}
                        />
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* AMIGOS */}
      {tab === "amigos" && (
        <div className="flex flex-col gap-3">
          {/* Solicitudes recibidas */}
          {pendingReceived.length > 0 && (
            <div>
              <div className="mb-2 px-1 text-[12px] font-bold text-warning">
                Solicitudes pendientes ({pendingReceived.length})
              </div>
              {pendingReceived.map((req) => (
                <GlassCard
                  key={req.id}
                  className="flex items-center gap-3 p-3.5 mb-2"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-glass text-[13px] font-bold">
                    {req.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold">{req.name}</div>
                  </div>
                  <button
                    onClick={() => acceptFriendRequest(req.id)}
                    className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-black"
                  >
                    Aceptar
                  </button>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Enviar solicitud */}
          <div className="flex gap-2">
            <input
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
              placeholder="Nombre de usuario..."
              className="flex-1 rounded-full border border-border bg-glass px-5 py-3 text-[14px] text-text placeholder:text-text-dimmer outline-none focus:border-accent"
            />
            <button
              onClick={handleAddFriend}
              disabled={!newFriendName.trim()}
              className="rounded-full bg-accent px-4 py-3 text-[13px] font-bold text-black disabled:opacity-40"
            >
              Enviar
            </button>
          </div>

          {/* Lista amigos */}
          {acceptedFriends.length === 0 ? (
            <GlassCard className="p-5 text-center">
              <div className="text-[28px] mb-2">🤝</div>
              <div className="text-[13px] font-semibold">Sin amigos todavía</div>
              <div className="text-[11.5px] text-text-dim mt-1">
                Escribe el nombre de un amigo para enviarle una solicitud
              </div>
            </GlassCard>
          ) : (
            acceptedFriends.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
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
                  <button
                    onClick={() => handleRemove(f)}
                    className="rounded-full border border-border-strong px-3 py-1.5 text-[11px] font-semibold text-text-dim"
                  >
                    Eliminar
                  </button>
                </GlassCard>
              </motion.div>
            ))
          )}

          {/* Feed de actividad */}
          {feed.length > 0 && (
            <div>
              <div className="mb-2 px-1 text-[12px] font-bold text-text-dim">
                Actividad reciente
              </div>
              {feed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="mb-2"
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
        </div>
      )}

      {/* DUELOS */}
      {tab === "duelos" && (
        <div className="flex flex-col gap-3">
          <GlassCard className="p-4">
            <div className="text-[13px] font-bold">⚔️ Duelos de fin de semana</div>
            <div className="mt-1 text-[12px] text-text-dim leading-relaxed">
              Los duelos se crean automáticamente cada sábado. Gana quien acumule más pasos,
              actividad o puntos — los datos vienen exclusivamente de tu reloj inteligente.
            </div>
          </GlassCard>

          {acceptedFriends.length === 0 ? (
            <GlassCard className="p-5 text-center">
              <div className="text-[28px] mb-2">👥</div>
              <div className="text-[12px] text-text-dim">
                Necesitas al menos un amigo para lanzar un duelo
              </div>
              <button
                onClick={() => setTab("amigos")}
                className="mt-3 rounded-full border border-border-strong px-4 py-2 text-[12px] font-semibold"
              >
                Añadir amigos
              </button>
            </GlassCard>
          ) : (
            <GlassCard className="flex flex-col items-center gap-2 p-5 text-center">
              <div className="text-[32px]">🏆</div>
              <div className="text-[14px] font-bold">Duelo disponible el sábado</div>
              <div className="text-[12px] text-text-dim">
                Vuelve el fin de semana para lanzar un duelo
              </div>
              <button
                disabled
                className="mt-2 rounded-full bg-accent/40 px-6 py-3 text-[13px] font-bold text-black/60 cursor-not-allowed"
              >
                Disponible el sábado
              </button>
            </GlassCard>
          )}
        </div>
      )}

      <TabBar />
    </div>
  );
}
