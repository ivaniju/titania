"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChatTurn = {
  role: "titan" | "user";
  text: string;
};

export type Profile = {
  goal?: string;
  trainingDays?: string;
  equipment?: string;
  injury?: string;
  supermarket?: string;
};

type TitanState = {
  onboardingCompleted: boolean;
  stepIndex: number;
  profile: Profile;
  history: ChatTurn[];
  answerStep: (field: keyof Profile, value: string) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

export const useTitanStore = create<TitanState>()(
  persist(
    (set) => ({
      onboardingCompleted: false,
      stepIndex: 0,
      profile: {},
      history: [],
      answerStep: (field, value) =>
        set((state) => ({
          profile: { ...state.profile, [field]: value },
          history: [...state.history, { role: "user", text: value }],
          stepIndex: state.stepIndex + 1,
        })),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      reset: () =>
        set({
          onboardingCompleted: false,
          stepIndex: 0,
          profile: {},
          history: [],
        }),
    }),
    { name: "titan-store" }
  )
);
