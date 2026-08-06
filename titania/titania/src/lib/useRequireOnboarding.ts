"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTitanStore } from "@/lib/store";

export function useRequireOnboarding() {
  const router = useRouter();
  const onboardingCompleted = useTitanStore((s) => s.onboardingCompleted);

  useEffect(() => {
    if (!onboardingCompleted) router.replace("/onboarding");
  }, [onboardingCompleted, router]);

  return onboardingCompleted;
}
