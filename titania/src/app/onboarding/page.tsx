"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTitanStore } from "@/lib/store";
import { onboardingSteps } from "@/lib/onboardingSteps";
import { TitanAvatar } from "@/components/ui/TitanAvatar";
import { Chip } from "@/components/ui/Chip";

export default function OnboardingPage() {
  const router = useRouter();
  const stepIndex = useTitanStore((s) => s.stepIndex);
  const history = useTitanStore((s) => s.history);
  const answerStep = useTitanStore((s) => s.answerStep);
  const completeOnboarding = useTitanStore((s) => s.completeOnboarding);
  const [freeText, setFreeText] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const finished = stepIndex >= onboardingSteps.length;
  const currentStep = !finished ? onboardingSteps[stepIndex] : null;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [stepIndex]);

  useEffect(() => {
    if (finished) {
      const t = setTimeout(() => {
        completeOnboarding();
        router.push("/home");
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [finished, completeOnboarding, router]);

  function handleAnswer(value: string) {
    if (!currentStep) return;
    answerStep(currentStep.field, value);
    setFreeText("");
  }

  const pct = Math.round((stepIndex / onboardingSteps.length) * 100);
  const hasChips = currentStep && currentStep.chips.length > 0;

  return (
    <div className="flex h-dvh flex-col bg-bg">
      {/* Progress bar */}
      <div className="shrink-0 px-5 pb-3.5 pt-[18px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-text-dimmer">
            {stepIndex}/{onboardingSteps.length}
          </span>
          <span className="text-[11px] font-bold text-accent">{pct}%</span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Conversación */}
      <div
        ref={bodyRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5 pt-2"
      >
        {history.map((turn, i) => {
          if (turn.role === "user") {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[80%] self-end rounded-[18px] rounded-tr-[4px] bg-accent px-4 py-3 text-[13.5px] font-semibold text-black"
              >
                {turn.text}
              </motion.div>
            );
          }
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex max-w-[88%] items-start gap-2.5"
            >
              <TitanAvatar size={30} />
              <div className="rounded-[18px] rounded-tl-[4px] border border-border bg-glass-strong px-4 py-[13px] text-[14px] leading-[1.5]">
                {turn.text.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-3" : ""}>{line}</p>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Pregunta actual */}
        <AnimatePresence mode="wait">
          {currentStep && (
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="flex max-w-[88%] items-start gap-2.5">
                <TitanAvatar size={30} />
                <div className="rounded-[18px] rounded-tl-[4px] border border-border bg-glass-strong px-4 py-[13px] text-[14px] leading-[1.5]">
                  {currentStep.question.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-3" : ""}>{line}</p>
                  ))}
                </div>
              </div>
              {hasChips && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-wrap gap-2 pl-[40px]"
                >
                  {currentStep.chips.map((chip) => (
                    <Chip key={chip} label={chip} onClick={() => handleAnswer(chip)} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {finished && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex max-w-[88%] items-start gap-2.5"
            >
              <TitanAvatar size={30} />
              <div className="rounded-[18px] rounded-tl-[4px] border border-border bg-glass-strong px-4 py-[13px] text-[14px] leading-[1.5]">
                Perfecto, ya te conozco lo suficiente para empezar. Estoy
                preparando tu primera semana de entrenamiento y tu lista de la
                compra — dame un segundo 🔧
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      {!finished && (
        <form
          className="shrink-0 px-5 pb-[26px] pt-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (freeText.trim()) handleAnswer(freeText.trim());
          }}
        >
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-glass py-1.5 pl-[18px] pr-1.5">
            <input
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder={
                currentStep?.freeTextPlaceholder ?? "Escribe tu respuesta..."
              }
              className="flex-1 bg-transparent py-2 text-[14px] text-text placeholder:text-text-dimmer outline-none"
            />
            <button
              type="submit"
              disabled={!freeText.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[15px] font-extrabold text-black disabled:opacity-40"
            >
              ↑
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
