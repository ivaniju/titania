"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { TitanAvatar } from "@/components/ui/TitanAvatar";
import { TabBar } from "@/components/TabBar";

const QUICK_PROMPTS = [
  "¿Cómo voy hoy?",
  "Receta alta en proteína",
  "Estoy cansado",
  "¿Cuánta proteína me falta?",
  "Motívame",
  "¿Qué como ahora?",
];

export default function TitanChatPage() {
  const ready = useRequireOnboarding();
  const chatMessages = useTitanStore((s) => s.chatMessages);
  const sendChatMessage = useTitanStore((s) => s.sendChatMessage);
  const chatLoading = useTitanStore((s) => s.chatLoading);
  const [text, setText] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || chatLoading) return;
    sendChatMessage(text.trim());
    setText("");
  }

  if (!ready) return null;

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 pb-3.5 pt-5">
        <TitanAvatar size={38} pulse />
        <div>
          <div className="text-[15px] font-bold">Titan</div>
          <div className="text-[11.5px] text-text-dim">Entrenador personal · IA</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-success/30 bg-success-dim px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-[11px] font-semibold text-success">Activo</span>
        </div>
      </div>

      {/* Mensajes */}
      <div ref={bodyRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-8 text-center">
            <TitanAvatar size={56} />
            <div className="text-[15px] font-bold">¡Hola! Soy Titan</div>
            <div className="text-[13px] text-text-dim max-w-[260px] leading-relaxed">
              Tu entrenador con IA. Pregúntame sobre nutrición, entrenamiento, hábitos, recetas o tu progreso.
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {chatMessages.map((m, i) =>
            m.role === "user" ? (
              <motion.div key={i}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="max-w-[80%] self-end rounded-[18px] rounded-tr-[4px] bg-accent px-4 py-3 text-[13.5px] font-semibold text-black">
                {m.text}
              </motion.div>
            ) : (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="flex max-w-[88%] items-start gap-2.5">
                <TitanAvatar size={28} />
                <div className="rounded-[18px] rounded-tl-[4px] border border-border bg-glass-strong px-4 py-[13px] text-[14px] leading-[1.55]">
                  {m.text.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-2" : ""}>{line}</p>
                  ))}
                </div>
              </motion.div>
            )
          )}

          {/* Typing indicator */}
          {chatLoading && (
            <motion.div key="loading"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex max-w-[88%] items-start gap-2.5">
              <TitanAvatar size={28} />
              <div className="rounded-[18px] rounded-tl-[4px] border border-border bg-glass-strong px-4 py-[13px]">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map((dot) => (
                    <div key={dot}
                      className="h-2 w-2 rounded-full bg-accent/60"
                      style={{ animation: `bounce 1.2s ease infinite ${dot * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick prompts */}
      <div className="shrink-0 flex gap-2 overflow-x-auto px-5 pb-2 pt-1 [scrollbar-width:none]">
        {QUICK_PROMPTS.map((p) => (
          <button key={p}
            onClick={() => { if (!chatLoading) sendChatMessage(p); }}
            disabled={chatLoading}
            className="shrink-0 rounded-full border border-border bg-glass px-3.5 py-2 text-[12px] font-semibold text-text-dim whitespace-nowrap disabled:opacity-40">
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <form className="shrink-0 px-5 pb-[100px] pt-2" onSubmit={submit}>
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-glass py-1.5 pl-[18px] pr-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pregúntale a Titan..."
            disabled={chatLoading}
            className="flex-1 bg-transparent py-2 text-[14px] text-text placeholder:text-text-dimmer outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!text.trim() || chatLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[15px] font-extrabold text-black disabled:opacity-40"
          >
            ↑
          </button>
        </div>
      </form>

      <TabBar />

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
