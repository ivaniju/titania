"use client";

import { useEffect, useRef, useState } from "react";
import { useTitanStore } from "@/lib/store";
import { useRequireOnboarding } from "@/lib/useRequireOnboarding";
import { TitanAvatar } from "@/components/ui/TitanAvatar";
import { TabBar } from "@/components/TabBar";

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

  if (!ready) return null;

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-5">
        <TitanAvatar size={36} />
        <div>
          <div className="text-[15px] font-bold">Titan</div>
          <div className="text-[11.5px] text-text-dim">Tu entrenador personal</div>
        </div>
      </div>

      <div
        ref={bodyRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-3"
      >
        {chatMessages.map((m, i) =>
          m.role === "user" ? (
            <div
              key={i}
              className="max-w-[80%] self-end rounded-[18px] rounded-tr-[4px] bg-accent px-4 py-3 text-[13.5px] font-semibold text-black"
            >
              {m.text}
            </div>
          ) : (
            <div key={i} className="flex max-w-[88%] items-start gap-2.5">
              <TitanAvatar size={28} />
              <div className="rounded-[18px] rounded-tl-[4px] border border-border bg-glass-strong px-4 py-[13px] text-[14px] leading-[1.5]">
                {m.text}
              </div>
            </div>
          )
        )}
      </div>

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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[15px] font-extrabold text-black"
          >
            ↑
          </button>
        </div>
      </form>

      <TabBar />
    </div>
  );
}
