"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { TitanAvatar } from "@/components/ui/TitanAvatar";
import { TabBar } from "@/components/TabBar";

const QUICK_PROMPTS = [
  "¿Cómo voy en el ranking?",
  "¿Qué como hoy?",
  "Estoy cansado",
  "¿Cuánta proteína me falta?",
];

export default function TitanChatPage() {
  const ready = useRequireOnboarding();
  const chatMessages = useTitanStore((s) => s.chatMessages);
  const sendChatMessage = useTitanStore((s) => s.sendChatMessage);
  const [text, setText] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendChatMessage(text.trim());
    setText("");
  }

  function sendPrompt(prompt: string) {
    sendChatMessage(prompt);
  }

  if (!ready) return null;

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 pb-3.5 pt-5">
        <TitanAvatar size={38} pulse />
        <div>
          <div className="text-[15px] font-bold">Titan</div>
          <div className="text-[11.5px] text-text-dim">
            Tu entrenador personal · IA
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-success/30 bg-success-dim px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-[11px] font-semibold text-success">Activo</span>
        </div>
      </div>

      {/* Mensajes */}
      <div
        ref={bodyRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
      >
        <AnimatePresence initial={false}>
          {chatMessages.map((m, i) =>
            m.role === "user" ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-[80%] self-end rounded-[18px] rounded-tr-[4px] bg-accent px-4 py-3 text-[13.5px] font-semibold text-black"
              >
                {m.text}
              </motion.div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex max-w-[88%] items-start gap-2.5"
              >
                <TitanAvatar size={28} />
                <div className="rounded-[18px] rounded-tl-[4px] border border-border bg-glass-strong px-4 py-[13px] text-[14px] leading-[1.5]">
                  {m.text}
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Quick prompts */}
      <div className="shrink-0 flex gap-2 overflow-x-auto px-5 pb-2 pt-1 [scrollbar-width:none]">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendPrompt(p)}
            className="shrink-0 rounded-full border border-border bg-glass px-3.5 py-2 text-[12px] font-semibold text-text-dim whitespace-nowrap"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <form className="shrink-0 px-5 pb-[110px] pt-2" onSubmit={submit}>
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-glass py-1.5 pl-[18px] pr-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pregúntale a Titan..."
            className="flex-1 bg-transparent py-2 text-[14px] text-text placeholder:text-text-dimmer outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[15px] font-extrabold text-black disabled:opacity-40"
          >
            ↑
          </button>
        </div>
      </form>

      <TabBar />
    </div>
  );
}
