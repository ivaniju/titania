"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useTitanStore } from "@/lib/store";

export function AchievementToast() {
  const pendingAchievement = useTitanStore((s) => s.pendingAchievement);
  const clearPendingAchievement = useTitanStore((s) => s.clearPendingAchievement);

  useEffect(() => {
    if (pendingAchievement) {
      const t = setTimeout(clearPendingAchievement, 4000);
      return () => clearTimeout(t);
    }
  }, [pendingAchievement, clearPendingAchievement]);

  return (
    <AnimatePresence>
      {pendingAchievement && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="fixed inset-x-0 top-[env(safe-area-inset-top,0px)] z-50 mx-auto flex max-w-[440px] items-center gap-3 rounded-[20px] border border-accent/40 bg-black/90 p-4 shadow-2xl backdrop-blur-2xl"
          style={{ margin: "12px auto 0" }}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-dim text-2xl">
            {pendingAchievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wide text-accent">
              Logro desbloqueado
            </div>
            <div className="mt-0.5 text-[14px] font-bold truncate">{pendingAchievement.title}</div>
            <div className="text-[12px] text-text-dim">+{pendingAchievement.xpReward} XP</div>
          </div>
          <button
            onClick={clearPendingAchievement}
            className="text-text-dimmer text-lg leading-none shrink-0"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
